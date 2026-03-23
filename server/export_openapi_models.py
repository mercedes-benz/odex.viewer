#! /usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
import dataclasses
import inspect
import json
import types
import typing
from enum import Enum, IntEnum
from typing import Any, ForwardRef, Literal, SupportsBytes, get_args, get_origin

from odxtools.odxlink import OdxLinkRef
from odxtools.parameters.physicalconstantparameter import PhysicalConstantParameter
from packaging.version import Version

from diag_server import model_utils


def remove_invalid_resolved_references(
    obj: dict[str, Any], resolved_schema_names: list[str]
) -> None:
    if not isinstance(obj, dict):
        return

    for elm in obj:
        if elm == "properties":
            property_obj = obj[elm]
            if isinstance(property_obj, dict):
                for prop_name in property_obj:
                    prop_value = property_obj.get(prop_name)
                    if prop_value is not None:
                        remove_invalid_resolved_references(prop_value, resolved_schema_names)
        elif elm == "items":
            items_obj = obj[elm]
            if isinstance(items_obj, dict):
                remove_invalid_resolved_references(items_obj, resolved_schema_names)
        elif elm == "$ref":
            reference_path = obj["$ref"]
            if isinstance(reference_path, str):
                ref_schema_name_segments = reference_path.rsplit("/", 1)
                if len(ref_schema_name_segments) == 2:
                    ref_schema_name = ref_schema_name_segments[1]
                    # Remove "Resolved" suffix, if it was added during generation without having a respective resolved type schema
                    if (
                        ref_schema_name.endswith(model_utils.RESOLVED_SUFFIX)
                        and ref_schema_name not in resolved_schema_names
                    ):
                        obj[elm] = reference_path.replace(model_utils.RESOLVED_SUFFIX, "")


def cleanup_resolved_schemas(resolved_schemas: dict[str, Any]) -> None:
    # Collect all generated resolved schema names
    resolved_schema_names = list(resolved_schemas.keys())

    # Loop through the resolved schema definitions and identify and remove all references that are referring to a resolved schema definition that does not exist
    for name in resolved_schemas:
        remove_invalid_resolved_references(resolved_schemas[name], resolved_schema_names)


def is_union_type(cls: Any) -> bool:
    if isinstance(cls, types.UnionType):
        return True
    tmp = get_origin(cls)
    if tmp is None:
        return False
    return tmp is typing.Union


def make_openapi_type(
    cls: type[Any] | str | None, *, top_level: bool = False, resolve_props: bool = False
) -> dict[str, Any] | None:
    result: dict[str, Any] = {}

    if cls is None:
        return None

    # Check if the type class name is provided as a string value
    if isinstance(cls, str):
        cls = model_utils.resolve_class_by_name(cls)

    schema_name_suffix = ""
    if resolve_props:
        schema_name_suffix = model_utils.RESOLVED_SUFFIX

    # Check if a type definition is or will be generated, i.e., is in the mapping dict, if so reference it
    if cls in model_utils.dataclass_generated_types and not top_level:
        result["$ref"] = f"#/components/schemas/{cls.__name__}{schema_name_suffix}"
        return result

    if isinstance(cls, ForwardRef):
        # Special handling for ComplexValue definition
        if cls.__forward_arg__ == "ComplexValue":
            result["type"] = "object"
        else:
            result["$ref"] = f"#/components/schemas/{cls.__forward_arg__}{schema_name_suffix}"
        return result

    # deal with union types. so far we only support simple types made
    # optional
    if is_union_type(cls):
        union_list: list[dict[str, Any]] = []
        for x in get_args(cls):
            if x is type(None):
                continue
            elif x is SupportsBytes:
                continue
            oapi_type = make_openapi_type(x)

            # Handle special case of OdxDocFragment, where single or double element list can appear
            # and therefore an identical type definition will be added to the union_list.
            # To prevent this, we check if the
            if oapi_type is not None and not any(oapi_type == elm2 for elm2 in union_list):
                union_list.append(oapi_type)
        if len(union_list) == 1:
            return union_list[0]

        return {"anyOf": union_list}

    if isinstance(cls, types.GenericAlias):
        if issubclass(get_origin(cls), (list, tuple)):
            result["type"] = "array"
            result["items"] = make_openapi_type(get_args(cls)[0])
        elif issubclass(get_origin(cls), dict):
            result["type"] = "object"
        return result
    elif inspect.isclass(cls):
        if issubclass(cls, Enum):
            if not resolve_props:
                # Handle Enums classes
                result["type"] = "string"
                result["enum"] = [e.name if issubclass(cls, IntEnum) else e.value for e in cls]
                return {cls.__name__: result}
            return None
        elif issubclass(cls, str):
            result["type"] = "string"
            return result
        elif issubclass(cls, bool):
            result["type"] = "boolean"
            return result
        elif issubclass(cls, int):
            result["type"] = "integer"
            return result
        elif issubclass(cls, float):
            result["type"] = "number"
            return result
        elif issubclass(cls, bool):
            result["type"] = "number"
            return result
        elif issubclass(cls, bytes):
            result["type"] = "string"
            result["format"] = "byte"
            return result
        elif issubclass(cls, bytearray):
            result["type"] = "string"
            result["format"] = "binary"
            return result

    if not dataclasses.is_dataclass(cls):
        if get_origin(cls) is Literal:
            result["type"] = "string"
            result["enum"] = get_args(cls)
            return result

        if cls is not None and issubclass(cls, Version):
            return result

        if inspect.isclass(cls):
            print(f"Class {cls.__name__} is not a dataclass")
        else:
            print(f"{cls} is not a class. type({cls}) = {type(cls).__name__}")
        return result

    schema_dict: dict[str, Any] = {}
    result[cls.__name__ + schema_name_suffix] = schema_dict
    schema_dict["type"] = "object"
    schema_props_dict: dict[str, Any] = {}
    schema_dict["properties"] = schema_props_dict

    # Get the fields of the dataclass
    cls_fields = dataclasses.fields(cls)

    handled_prop_fields: list[str] = []
    fields2props_map: dict[str, str] = {}
    # Resolve all property fields of the dataclass and match them with the fields of the dataclass
    if resolve_props:
        fields2props_map = model_utils.resolve_matching_properties(cls)
        if len(fields2props_map) == 0:
            return None

    for cur_field in cls_fields:
        field_name = cur_field.name
        if field_name.endswith("_raw"):
            if cls == PhysicalConstantParameter:
                field_name = field_name[:-4]
            else:
                # Add _raw property type definition
                schema_props_dict[field_name] = make_openapi_type(cur_field.type)
                # Add defaulted property type definition
                prop_name = field_name[:-4]
                if hasattr(cls, prop_name):
                    prop_type = model_utils.resolve_property_type(getattr(cls, prop_name))
                    schema_props_dict[prop_name] = make_openapi_type(
                        prop_type, resolve_props=resolve_props
                    )
                continue
        schema_props_dict[field_name] = make_openapi_type(cur_field.type)
        if (
            resolve_props
            and field_name in fields2props_map
            and fields2props_map.get(field_name) not in handled_prop_fields
        ):
            # Check if the field value is also represented by a resolved property within the class or not,
            # and if the property is already handled in the context of another field
            field_prop_name = fields2props_map.get(field_name)
            if field_prop_name is not None:
                prop_type = model_utils.resolve_property_type(getattr(cls, field_prop_name))
                schema_props_dict[field_prop_name] = make_openapi_type(
                    prop_type, resolve_props=resolve_props
                )
                handled_prop_fields.append(field_prop_name)

    special_props = model_utils.resolve_special_properties_to_handle(cls)
    if special_props and len(special_props) > 0:
        for prop_name in special_props:
            prop_type = model_utils.resolve_property_type(getattr(cls, prop_name))
            schema_props_dict[prop_name] = make_openapi_type(prop_type)

    if issubclass(cls, OdxLinkRef):
        schema_props_dict["resolved_object_perma_id"] = {"type": "string"}
        schema_props_dict["resolved_object_ephemeral_id"] = {"type": "integer"}
        schema_props_dict["resolved_object_short_name"] = {"type": "string"}

    schema_props_dict["perma_id"] = {"type": "string"}
    schema_props_dict["ephemeral_id"] = {"type": "integer"}
    schema_props_dict["class_name"] = {"type": "string"}

    # Set the generation status of the type to True
    if cls in model_utils.dataclass_generated_types:
        model_utils.dataclass_generated_types[cls] = True

    return result


with open("odxtools-types.json", "w", encoding="utf-8") as file:
    # Create default openapi file contents
    openapi: dict[str, Any] = {
        "openapi": "3.0.3",
        "info": {
            "title": "odxtools JSON schema type definitions",
            "version": "1.0.0",
            "description": "Autogenerated JSON schema type definitions for all dataclasses of the odxtools library.",
            "contact": {
                "name": "odex.viewer Team",
                "url": "https://github.com/mercedes-benz/odex.viewer",
            },
        },
        "servers": [],
        "paths": {},
        "components": {
            "schemas": {},
        },
    }

    # Resolve all dataclasses from odxtools
    model_utils.resolve_dataclasses()

    resolved_schema_definitions: dict[str, Any] = {}
    # Generate type definitions and add them to the 'schemas' dict
    for cls_type in model_utils.dataclass_generated_types:
        result_plain = make_openapi_type(cls_type, top_level=True)
        result_resolved_refs = make_openapi_type(cls_type, top_level=True, resolve_props=True)
        openapi["components"]["schemas"].update(result_plain)
        if result_resolved_refs is not None:
            resolved_schema_definitions.update(result_resolved_refs)

    cleanup_resolved_schemas(resolved_schema_definitions)

    # Add the resolved schema definitions to the OpenAPI dict
    openapi["components"]["schemas"].update(resolved_schema_definitions)

    # Add the union-type schema definition for all types
    odx_schema_names = sorted(openapi["components"]["schemas"])
    openapi["components"]["schemas"]["OdxAny"] = {
        "anyOf": [{"$ref": f"#/components/schemas/{x}"} for x in odx_schema_names]
    }

    openapi["components"]["schemas"]["OdxSchemaNames"] = {
        "type": "string",
        "enum": odx_schema_names,
    }

    # Store the whole openapi dict to the type definition file
    json.dump(openapi, file, ensure_ascii=False, indent=2)
