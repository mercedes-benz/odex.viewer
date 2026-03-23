# SPDX-License-Identifier: AGPL-3.0-only
"""
Module providing utility functions for OpenAPI model generation and translation from odxtools dataclasses.
"""

import dataclasses
import datetime
import hashlib
import importlib
import inspect
import pkgutil
import types
import weakref
from collections.abc import Generator
from enum import Enum, IntEnum
from types import ModuleType
from typing import Any, Literal, Union, get_args, get_origin

import odxtools
import odxtools.compumethods as ComputMethodsModule
import odxtools.diaglayers as DiagLayersModule
import odxtools.parameters as ParametersModule
from dateutil.parser import parse
from odxtools.odxlink import OdxLinkRef
from odxtools.relateddiagcommref import RelatedDiagCommRef

from diag_server.odx_util import DatabaseWithID
from diag_server.openapi_server import typing_utils
from diag_server.openapi_server.models import base_model

RESOLVED_SUFFIX = "Resolved"
ODXTOOLS_TYPE_ID_PROP = "odxtools_type"

# List of to be ignored full-qualified class names for type generation
dataclass_ignore_map = {
    "packages": ["odxtools.cli"],
    "classes": [
        "odxtools.decodestate.DecodeState",
        "odxtools.encodestate.EncodeState",
        "odxtools.snrefcontext.SnRefContext",
        "odxtools.message.Message",
    ],
}

# Map of special field-name to property name associations which could not be automatically resolved
special_field_to_property_name_map: dict[str, str] = {
    "pos_response_refs": "positive_responses",
    "neg_response_refs": "negative_responses",
}

# Map of dataclass names and special properties which should be also added to the
# schema without a respective field in the dataclass
special_property_names_map: dict[str, list[str]] = {}

# List of to be ignored class names for reference resolution
resolution_ignore_list: list[type] = [RelatedDiagCommRef]

# Dict to store a map of dataclass types and their status of generating a JSON schema for them
dataclass_generated_types: dict[type[Any], bool] = {}

# Dict to store a map of dataclass names and the related type object
dataclass_type_map: dict[str, type[Any]] = {}

# Map of perma_IDs and their related Database objects
database_id_dict: dict[str, DatabaseWithID] = {}
# Maps every object from its ephemeral id (python object id) to the perma_id of the Database object it is located in
ephemeral_object_id_database_perma_id_dict: dict[int, str] = {}

# Map of all generated OpenAPI schema names and their OpenAPI Python class/type definition
openapi_schema_map: dict[str, type[Any]] = {}

# Map between all generated OpenAPI Python class/type definitions and the related odxtools Python class/type definitions
openapi_odxtools_map: dict[type[Any], type[Any]] = {}
# Reverse mapping from odxtools to OpenAPI model classes, the first entry in the dict with key "default" is the base class and the second optional entry with key "resolved", is the "*Resolved" class version, if one is available.
odxtools_openapi_map: dict[type[Any], dict[str, type[Any]]] = {}


def type_with_weakref(obj: object) -> type:
    """Returns the type of the object itself or the type of the referenced object if the given object itself is a weak proxy."""
    if isinstance(obj, (weakref.CallableProxyType, weakref.ProxyType)):
        # Resolve the type of the referenced object using the proxy __class__ attribute
        return obj.__class__
    else:
        return type(obj)


def is_dataclass_with_weakref(obj: object) -> bool:
    """Returns True if obj is a dataclass or an instance of a
    dataclass. Checks also weak references to instances of a dataclass.
    """
    if isinstance(obj, (weakref.CallableProxyType, weakref.ProxyType)):
        # Resolve the type of the referenced object using the proxy __class__ attribute
        return dataclasses.is_dataclass(obj.__class__)
    else:
        return dataclasses.is_dataclass(obj)


def dataclass_fields_with_weakref(
    class_or_instance: type | object,
) -> tuple[dataclasses.Field[Any], ...]:
    """Return a tuple describing the fields of this dataclass.

    Accepts a dataclass or an instance of one incl. weak references to instances. Tuple elements are of
    type Field.
    """
    if isinstance(class_or_instance, (weakref.CallableProxyType, weakref.ProxyType)):
        # Resolve the type of the referenced object using the proxy __class__ attribute
        cls = class_or_instance.__class__
        if dataclasses.is_dataclass(cls):
            return dataclasses.fields(cls)
    else:
        if dataclasses.is_dataclass(class_or_instance):
            return dataclasses.fields(class_or_instance)

    return ()


def get_diag_data_set_perma_id(odx_db: DatabaseWithID, file_name: str) -> str:
    """Return a permanent ID for an odxtools Database"""

    # The "permanent ID" is resolved based on the file_name of the diagnostic data set loaded into the odxtools Database and the last revision history entry of
    # its diagnostic layer container.

    # Resolve the main diag_layer_container from odx_db to get its revision

    revision_str = ""
    for dlc in odx_db.diag_layer_containers:
        if (admin_data := getattr(dlc, "admin_data", None)) is not None:
            if admin_data.doc_revisions:
                revision_str += admin_data.doc_revisions[-1].revision_label or ""

    return hashlib.md5((file_name + revision_str).encode("utf-8")).hexdigest()


def get_perma_id(obj: Any) -> str | None:
    """Return a permanent ID for an object

    A "permanent ID" is an identifier which does not get changed
    between restarts of the server. If no such identifier can be
    determined, `None` is returned.

    TODO: handle collisions. (for now, we just assume that the
    hash-space is big enough that collisions are exceedingly
    unlikely.)
    """
    perma_id = None
    if (oid := getattr(obj, "oid", None)) is not None:
        perma_id = oid

    if (odx_id := getattr(obj, "odx_id", None)) is not None:
        perma_id = odx_id.local_id + "-" + odx_id.doc_fragments[-1].doc_name

    if perma_id is not None:
        perma_id = hashlib.md5(str(perma_id).encode("utf-8")).hexdigest()

    # Check if object class name ends with "Raw" to avoid collisions
    # of hashes of resolved and raw objects which share the same oid / odx_id
    class_type = type(obj)
    if class_type is not None:
        if class_type.__name__.endswith("Raw"):
            perma_id = f"{perma_id}-raw"

    return perma_id


def resolve_database_from_object(
    obj: Any,
) -> DatabaseWithID | None:
    """
    Returns the database object which contains the given object or None if no database
    containing the given object can be found.
    """
    ephemeral_obj_id = id(obj)
    if isinstance(obj, DatabaseWithID):
        # Check if we already have a odxtools database object
        return obj
    elif isinstance(obj, (list, tuple)) and len(obj) > 0:
        # Check if we have a list or tuple of odxtools objects,
        # use the first element to resolve the database object from
        ephemeral_obj_id = id(obj[0])

    # Resolve the database object from the identified ephemeral object id
    db_obj_id = ephemeral_object_id_database_perma_id_dict.get(ephemeral_obj_id)
    if db_obj_id is not None:
        return database_id_dict.get(db_obj_id)

    return None


def find_dataclasses_in_module(
    module: ModuleType,
) -> Generator[tuple[str, type[Any]], None, None]:
    """
    Returns a list of (qualified_name, class) tuples for dataclasses and Enum classes defined in the given module.
    """
    for name, cls in inspect.getmembers(module, inspect.isclass):
        if (
            is_dataclass_with_weakref(cls) or issubclass(cls, Enum)
        ) and cls.__module__ == module.__name__:
            yield (
                f"{module.__name__}.{name}",
                cls,
            )


def find_dataclasses_in_package(
    package: ModuleType,
) -> Generator[tuple[str, type[Any]], None, None]:
    """
    Recursively finds all dataclass-decorated classes in a package and its submodules.
    """
    if hasattr(package, "__path__"):
        for (
            _,
            modname,
            _,
        ) in pkgutil.walk_packages(
            package.__path__,
            package.__name__ + ".",
        ):
            try:
                mod = importlib.import_module(modname)
                yield from find_dataclasses_in_module(mod)
            except Exception:
                continue  # skip modules that fail to import
    else:
        yield from find_dataclasses_in_module(package)


def is_ignored_dataclass(class_name: str) -> bool:
    """Check if the given class name is on the list of to be ignored dataclasses.

    :param class_name: The class name to check.
    :rtype: True, if the dataclass shall be ignored, False otherwise.
    """
    # Check for ignored packages
    for package_name in dataclass_ignore_map["packages"]:
        if class_name.startswith(package_name):
            return True

    # Check for ignored classes
    return class_name in dataclass_ignore_map["classes"]


def resolve_dataclasses() -> None:
    """Resolve all odxtools dataclasses as input for JSON schema generation."""
    dataclasses_found = list(find_dataclasses_in_package(odxtools))

    # It seems that "pkgutil.walk_packages()" is only able to recursively find and
    # resolve nested packages/modules if the respective subpackage folder contains an __init__.py file.
    # Since this is not the case for some of the odxtools subpackage, we have to separately trigger their resolution.
    dataclasses_found.extend(find_dataclasses_in_package(DiagLayersModule))
    dataclasses_found.extend(find_dataclasses_in_package(ComputMethodsModule))
    dataclasses_found.extend(find_dataclasses_in_package(ParametersModule))

    for fq_class_name, cls in dataclasses_found:
        if not is_ignored_dataclass(fq_class_name):
            dataclass_generated_types[cls] = False
            if "." in fq_class_name:
                class_name = fq_class_name.split(".")[-1]
            else:
                class_name = fq_class_name
            dataclass_type_map[class_name] = cls


def resolve_odxtools_class(
    cls_name: str,
) -> type[Any] | None:
    """Resolve the odxtools dataclass matching with the given class name.

    :param class_name: The class name to resolve.
    :rtype: The odxtools dataclass type object or None, if no matching type is found.
    """
    target_cls_name = cls_name
    # Remove "Resolved" model name suffix, if required
    if target_cls_name.endswith(RESOLVED_SUFFIX):
        target_cls_name = target_cls_name.removesuffix(RESOLVED_SUFFIX)

    # Resolve odxtools class/type definition based on target class name
    if target_cls_name in dataclass_type_map:
        return dataclass_type_map[target_cls_name]

    return None


def is_resolved_model_class(
    cls: type[base_model.Model],
) -> bool:
    if cls.__name__.endswith(RESOLVED_SUFFIX):
        return True
    return False


def resolve_model_class_mappings(
    module_obj: types.ModuleType,
) -> None:
    # Check if odxtools dataclasses are already resolved, if not call the function
    if len(dataclass_type_map) == 0:
        resolve_dataclasses()

    for cls_name, cls_def in inspect.getmembers(module_obj, inspect.isclass):
        openapi_schema_map[cls_name] = cls_def
        rsolvd = resolve_odxtools_class(cls_name)
        if rsolvd is not None:
            openapi_odxtools_map[cls_def] = rsolvd
            if rsolvd not in odxtools_openapi_map:
                odxtools_openapi_map[rsolvd] = {}
            if cls_name.endswith(RESOLVED_SUFFIX):
                odxtools_openapi_map[rsolvd]["resolved"] = cls_def
            else:
                odxtools_openapi_map[rsolvd]["default"] = cls_def


def resolve_class_by_name(
    cls_name: str,
) -> type[Any] | None:
    result_type = None
    matching_result_types = [x for x in dataclass_generated_types if x.__name__.endswith(cls_name)]
    if len(matching_result_types) > 0:
        result_type = matching_result_types[0]

    return result_type


def resolve_property_type(prop_obj: property) -> type[Any] | None:
    result_type = None
    if prop_obj is not None and prop_obj.fget is not None:
        if prop_obj.fget.__annotations__ is not None and "return" in prop_obj.fget.__annotations__:
            return_type = prop_obj.fget.__annotations__["return"]
            # Check if the type class name is provided as a string value
            if isinstance(return_type, str):
                result_type = resolve_class_by_name(return_type)
            else:
                result_type = return_type

    return result_type


def resolved_property_name(
    field_name: str,
) -> str | None:
    singular_name = None
    if field_name.endswith("_refs"):
        singular_name = field_name[:-5]
    elif field_name.endswith("_snrefs"):
        singular_name = field_name[:-7]
    elif field_name.endswith("_ref"):
        return field_name[:-4]
    elif field_name.endswith("_snref"):
        return field_name[:-6]
    else:
        return None

    # Check if a special mapping for the field name exists
    if field_name in special_field_to_property_name_map:
        return special_field_to_property_name_map[field_name]

    # Add the matching suffix for property names reflecting resolved reference lists
    if singular_name.endswith("s"):
        return singular_name + "es"
    elif singular_name.endswith("y"):
        return singular_name[:-1] + "ies"
    else:
        return singular_name + "s"


def is_ignored_property_resolution_type(
    cls: type[Any] | str | Any,
) -> bool:
    type_to_check = cls
    if isinstance(cls, types.GenericAlias):
        if issubclass(get_origin(cls), (list, tuple)):
            type_to_check = cls.__args__[0]
    return type_to_check in resolution_ignore_list


def resolve_matching_properties(
    cls: type[Any],
) -> dict[str, str]:
    result: dict[str, str] = {}

    prop_fields = [x for x in dir(cls) if isinstance(getattr(cls, x), property)]

    for field_obj in dataclass_fields_with_weakref(cls):
        # Check if property type is on resolution ignore list or not
        if not is_ignored_property_resolution_type(field_obj.type):
            property_name = resolved_property_name(field_obj.name)
            if property_name in prop_fields:
                result[field_obj.name] = property_name

    return result


def resolve_special_properties_to_handle(
    cls: type[Any],
) -> list[str]:
    # Check if special properties are registered for given class directly
    if cls.__qualname__ and cls.__module__:
        fqcn = f"{cls.__module__}.{cls.__qualname__}"
        if fqcn in special_property_names_map:
            return special_property_names_map[fqcn]

    # Else we have to check, if the given class extends a class which requires special property handling
    cls_hierarchy = inspect.getmro(cls)
    for parent_cls in cls_hierarchy:
        fqcn = f"{parent_cls.__module__}.{parent_cls.__qualname__}"
        if fqcn in special_property_names_map:
            return special_property_names_map[fqcn]

    return []


def odx_values_as_dict(
    db_object: DatabaseWithID | None,
    obj: Any,
    fill_properties: bool = False,
    resolve_matching_target_model_types: bool = True,
    filter_fields: list[str] | None = None,
) -> Any:
    """Resolve a dictionary fully reflecting the given ODX object values.

    :param db_object: The database object the ODX object originates from.
    :param obj: The ODX object to be translated to a dict.
    :param fill_properties: Whether fields only or also property values shall be added to the resulting dict.
    By default, properties are not added.
    :param resolve_matching_target_model_types: Whether the nested objects shall be translated to the subclass matching the source odxtools class or not. If set to True, the underlying type is added as an extra property "odxtools_type" to the created JSON objects / dicts.
    :param filter_fields: An optional list of field names which should be included into the resulting object. All other fields of the source data are filtered out and not included into the returned object.
    :rtype: The resulting ODX object values as dictionary.
    """

    if obj is None:
        return obj

    if isinstance(obj, (list, tuple)):
        return [odx_values_as_dict(db_object, x, fill_properties) for x in obj]

    if isinstance(obj, Enum):
        return obj.name if isinstance(obj, IntEnum) else obj.value

    if isinstance(obj, (str, int, float, bytes, bool, bytearray)):
        return obj

    if is_dataclass_with_weakref(obj):
        result: dict[str, Any] = {}

        # If type resolution is active, add the type of the object to the result dict for later use when translating the dict to an API model object
        if resolve_matching_target_model_types:
            result[ODXTOOLS_TYPE_ID_PROP] = type_with_weakref(obj)

        field_filter = None if filter_fields is None else set(filter_fields)

        for field in dataclass_fields_with_weakref(obj):
            # Default behavior: Loop through all fields defined by the underlying model class
            # Filtering behavior: Only deserialize the fields defined by the underlying model class, if the attribute is contained in the filter_fields list
            # All filter field names which do not match a field name are ignored and no respective attribute is added to the resulting object.
            if field.name.endswith("_raw"):
                prop_name = field.name[:-4]
                # Check filter to decide if property shall be added or not
                if field_filter is None or prop_name in field_filter:
                    prop_value = getattr(obj, prop_name, None)
                    if prop_value is not None:
                        result[prop_name] = odx_values_as_dict(
                            db_object,
                            prop_value,
                            fill_properties,
                        )

            # Check filter to decide if property shall be added or not
            if field_filter is None or field.name in field_filter:
                field_obj = getattr(obj, field.name)
                if field_obj is not None:
                    field_name = field.name
                    result[field_name] = odx_values_as_dict(
                        db_object,
                        field_obj,
                        fill_properties,
                    )

        # Resolve and add a perma ID, if possible
        result["perma_id"] = get_perma_id(obj)
        # Add the ephemeral ID
        result["ephemeral_id"] = id(obj)

        result["class_name"] = type_with_weakref(obj).__name__
        if isinstance(obj, OdxLinkRef) and db_object is not None:
            resolved_obj = db_object.odxlinks.resolve(obj)
            # Resolve and assign the perma ID and ephemeral ID of the referenced object
            result["resolved_object_perma_id"] = get_perma_id(resolved_obj)
            result["resolved_object_ephemeral_id"] = id(resolved_obj)
            result["resolved_object_short_name"] = resolved_obj.short_name

        if fill_properties:
            # Resolve relevant properties to be filled
            fields2props_map = resolve_matching_properties(type_with_weakref(obj))
            if len(fields2props_map) > 0:
                for prop_name in fields2props_map.values():
                    result[prop_name] = odx_values_as_dict(
                        db_object, getattr(obj, prop_name), False
                    )

            special_props = resolve_special_properties_to_handle(type_with_weakref(obj))
            if special_props and len(special_props) > 0:
                for prop_name in special_props:
                    cls = type_with_weakref(obj)
                    prop_type = resolve_property_type(getattr(cls, prop_name))

                    if prop_type is not None and get_origin(prop_type) is Literal:
                        result[prop_name] = odx_values_as_dict(
                            db_object, getattr(obj, prop_name), False
                        )

        return result
    raise AssertionError("Unhandled object type in model_utils.odx_values_as_dict()")


def translate_to_model(
    *,
    db_object: DatabaseWithID,
    obj_to_translate: Any,
    target_model_cls: type[base_model.Model] | None = None,
    translate_properties: bool = False,
    resolve_matching_target_model_types: bool = True,
    filter_fields: list[str] | None = None,
) -> base_model.Model | Any | None:
    """Translate an ODX object to the given API model class representation.

    :param obj_to_translate: The ODX object to be translated to an API model object.
    :param cls: The target API model class to translate the given ODX object to.
    :param translate_properties: Whether properties shall be added during translation or not.
    By default, properties are not translated automatically.
    :param resolve_matching_target_model_types: Whether the nested objects shall be translated to the subclass matching the source odxtools class or to the ones referenced in the target model class given.
    :param filter_fields: An optional list of field names which should be included into the resulting object. All other fields of the source data are filtered out and not included into the returned object.
    :rtype: The resulting API model object representing the given ODX object.
    """
    if obj_to_translate is None:
        return None

    if isinstance(obj_to_translate, list):
        result = []
        if target_model_cls is not None:
            for elm in obj_to_translate:
                assert is_dataclass_with_weakref(elm)
                result.append(
                    deserialize_model(
                        data=odx_values_as_dict(
                            db_object,
                            elm,
                            translate_properties,
                            resolve_matching_target_model_types,
                            filter_fields=filter_fields,
                        ),
                        klass=target_model_cls,
                        resolve_matching_target_model_types=resolve_matching_target_model_types,
                        use_resolved_type_defs=is_resolved_model_class(target_model_cls),
                    )
                )
        return result
    elif issubclass(type(obj_to_translate), Enum):
        return (
            obj_to_translate.name
            if issubclass(type(obj_to_translate), IntEnum)
            else obj_to_translate.value
        )
    else:
        assert is_dataclass_with_weakref(obj_to_translate)

        if target_model_cls is not None:
            return deserialize_model(
                data=odx_values_as_dict(
                    db_object,
                    obj_to_translate,
                    translate_properties,
                    resolve_matching_target_model_types,
                    filter_fields=filter_fields,
                ),
                klass=target_model_cls,
                resolve_matching_target_model_types=resolve_matching_target_model_types,
                use_resolved_type_defs=is_resolved_model_class(target_model_cls),
            )
    return None


def get_matching_subtype(
    openapi_cls: type,
    odxtools_cls: type,
    resolved_definition: bool,
) -> type:
    """Returns the API model type matching the given odxtools type, or None if not matching type definition could be found.

    :param odxtools_cls: the odxtools class to get the matching API model type for.
    :param resolved_definition: whether the resolved type definition shall be returned or not.

    :return: The matching API model type. If "resolved_definition=True" but no resolved type definition is available for the given type, the default type definition is returned.
    """

    # Check if there is a mapping for the odxtools type of the data
    if odxtools_cls in odxtools_openapi_map:
        # Check if the given class "klass" is in the "openapi_odxtools_map" to avoid replacing automatically generated inner classes required for nested objects, e.g., SpecialDataGroupValuesInner.
        if openapi_cls in openapi_odxtools_map:
            # Resolve the matching type
            if resolved_definition and "resolved" in odxtools_openapi_map[odxtools_cls]:
                return odxtools_openapi_map[odxtools_cls]["resolved"]
            return odxtools_openapi_map[odxtools_cls]["default"]

    return openapi_cls


# Adapted version from generated diag_server.openapi_server.models.util with resolution of specialized model types during deserialization
def _deserialize(
    data: Any,
    klass: type,
    resolve_matching_target_model_types: bool,
    use_resolved_type_defs: bool,
) -> Any:
    """Deserializes dict, list, str into an object.

    :param data: dict, list or str.
    :param klass: class literal, or string of class name.
    :param resolve_matching_target_model_types: Whether the nested objects shall be translated to the subclass matching the source odxtools class or to the ones referenced in the target model class given.
    :param use_resolved_type_defs: Whether the resolved API type definition variant, if one is defined, shall be used during deserialization or not.

    :return: object.
    """
    if data is None:
        return None

    if get_origin(klass) == Union:
        type_list = get_args(klass)
        # Take the type underlying to the data as basic target type
        target_model_cls = type_with_weakref(data)
        # Check if the data is structured and if a type hint is added during translation from odxtools classes or not
        if type(data) is dict and ODXTOOLS_TYPE_ID_PROP in data:
            target_model_cls = data[ODXTOOLS_TYPE_ID_PROP]
        # Check if the identified target type is part of the specified union type or not
        if target_model_cls in type_list:
            klass = target_model_cls

    if klass in (
        int,
        float,
        str,
        bool,
        bytearray,
    ):
        return _deserialize_primitive(data, klass)
    elif klass is object:
        return _deserialize_object(data)
    elif klass is datetime.date:
        return deserialize_date(data)
    elif klass is datetime.datetime:
        return deserialize_datetime(data)
    elif typing_utils.is_generic(klass):
        if typing_utils.is_list(klass):
            return _deserialize_list(
                data,
                get_args(klass)[0],
                resolve_matching_target_model_types,
                use_resolved_type_defs,
            )
        if typing_utils.is_dict(klass):
            return _deserialize_dict(
                data,
                get_args(klass)[1],
                resolve_matching_target_model_types,
                use_resolved_type_defs,
            )
    else:
        return deserialize_model(
            data,
            klass,
            resolve_matching_target_model_types,
            use_resolved_type_defs,
        )


def _deserialize_primitive(
    data: Any, klass: type[int | float | str | bool | bytearray]
) -> int | float | str | bool | bytearray:
    """Deserializes to primitive type.

    :param data: data to deserialize.
    :param klass: class literal.

    :return: int, long, float, str, bool.
    :rtype: int | long | float | str | bool
    """
    try:
        value = klass(data)
    except UnicodeEncodeError:
        value = data
    except TypeError:
        value = data
    return value


def _deserialize_object(value: object) -> object:
    """Return an original value.

    :return: object.
    """
    return value


def deserialize_date(string: str) -> datetime.date | str | None:
    """Deserializes string to date.

    :param string: str.
    :type string: str
    :return: date.
    :rtype: date
    """
    if string is None:
        return None

    try:
        return parse(string).date()  # type: ignore[no-any-return]
    except ImportError:
        return string


def deserialize_datetime(string: str) -> datetime.datetime | str | None:
    """Deserializes string to datetime.

    The string should be in iso8601 datetime format.

    :param string: str.
    :type string: str
    :return: datetime.
    :rtype: datetime
    """
    if string is None:
        return None

    try:
        return parse(string)  # type: ignore[no-any-return]
    except ImportError:
        return string


def deserialize_model(
    data: dict[str, Any] | list[Any],
    klass: type[base_model.Model],
    resolve_matching_target_model_types: bool,
    use_resolved_type_defs: bool,
) -> base_model.Model | dict[str, Any] | list[Any]:
    """Deserializes list or dict to model.

    :param data: dict, list.
    :type data: dict | list
    :param klass: class literal.
    :param resolve_matching_target_model_types: Whether the nested objects shall be translated to the subclass matching the source odxtools class or to the ones referenced in the target model class given.
    :param use_resolved_type_defs: Whether the resolved API type definition variant, if one is defined, shall be used during deserialization or not.
    :return: model object.
    """

    instance = klass()

    if not instance.openapi_types:
        return data

    # Check if there is a type hint in the data ("odxtools_type" property) and the type matching is requested via "resolve_matching_target_model_types" param
    if (
        isinstance(data, dict)
        and ODXTOOLS_TYPE_ID_PROP in data
        and resolve_matching_target_model_types
    ):
        target_model_cls = get_matching_subtype(
            openapi_cls=klass,
            odxtools_cls=data[ODXTOOLS_TYPE_ID_PROP],
            resolved_definition=use_resolved_type_defs,
        )

        # Check if the types match or not, if not use the resolved one
        if klass != target_model_cls:
            klass = target_model_cls
            instance = klass()

    for (
        attr,
        attr_type,
    ) in instance.openapi_types.items():
        if (
            data is not None
            and instance.attribute_map[attr] in data
            and isinstance(data, (list, dict))
        ):
            if isinstance(data, list):
                value = data
            else:
                value = data[instance.attribute_map[attr]]
            setattr(
                instance,
                attr,
                _deserialize(
                    value,
                    attr_type,
                    resolve_matching_target_model_types,
                    use_resolved_type_defs,
                ),
            )

    return instance


def _deserialize_list(
    data: Any,
    boxed_type: type,
    resolve_matching_target_model_types: bool,
    use_resolved_type_defs: bool,
) -> list[Any]:
    """Deserializes a list and its elements.

    :param data: list to deserialize.
    :type data: list
    :param boxed_type: class literal.

    :return: deserialized list.
    :rtype: list
    """
    return [
        _deserialize(
            sub_data,
            boxed_type,
            resolve_matching_target_model_types,
            use_resolved_type_defs,
        )
        for sub_data in data
    ]


def _deserialize_dict(
    data: Any,
    boxed_type: type,
    resolve_matching_target_model_types: bool,
    use_resolved_type_defs: bool,
) -> dict[str, Any]:
    """Deserializes a dict and its elements.

    :param data: dict to deserialize.
    :type data: dict
    :param boxed_type: class literal.

    :return: deserialized dict.
    :rtype: dict
    """
    return {
        k: _deserialize(
            v,
            boxed_type,
            resolve_matching_target_model_types,
            use_resolved_type_defs,
        )
        for k, v in data.items()
    }
