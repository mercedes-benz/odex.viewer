# SPDX-License-Identifier: AGPL-3.0-only
"""
Module providing the API endpoint implementations invoked via the generated controllers.
"""

import dataclasses
from dataclasses import is_dataclass
from datetime import datetime, timezone
from enum import Enum
from io import BytesIO
from itertools import chain
from typing import Any, cast

import odxtools.diagcomm
import odxtools.exceptions
from connexion.lifecycle import ConnexionResponse
from diag_server import const, model_utils, odx_util, response_codes
from diag_server.globals import logger
from diag_server.model_utils import (get_diag_data_set_perma_id, get_perma_id,
                                     resolve_model_class_mappings,
                                     translate_to_model)
from diag_server.odx_util import DatabaseWithID
from diag_server.openapi_server import models
from diag_server.openapi_server.models import (
    CompanyData, ContainerType, CreatedResourceReference, DiagCommCollection,
    DiagCommDetails, DiagCommGenericInfo, DiagCommInfo, DiagCommRef,
    DiagCommsOfVariantsOfDataSetsCollection, DiagCommWithDataSetsVariantRefs,
    DiagLayerType, DiagnosticDataCollection, DiagnosticDataSetDescriptor,
    DiagnosticDataSetRef, DiagnosticDataTypeCollection,
    DiagnosticLayerContainerInfo, DiagnosticVariant,
    DiagnosticVariantsCollection, DopBase, DopCollection,
    DopsOfVariantsOfDataSetsCollection, DopWithDataSetsVariantRefs,
    DopWithOriginLayerInfo, DtcCollection, DtcsOfVariantsOfDataSetsCollection,
    DtcWithDataSetsVariantRefs, DtcWithDopInfo, JsonProblem, Modification,
    NamedObjectIdRef, ObjectMetadata, OdxAny, ParentRef, Revision,
    RevisionHistory, SpecialDataGroup, StateChart, StateChartCollection,
    StateChartMetaData, StateChartWithMetaData,
    StateChartWithMetaDataCollection, StateTransitionWithDiagCommRefs,
    TeamMember, UdsServiceInfo, VariantObjectRef, VariantPatternInner)
from diag_server.response_codes import api_jsonifier
from odxtools.basevariantpattern import \
    BaseVariantPattern as OdxToolsBaseVariantPattern
from odxtools.diaglayercontainer import \
    DiagLayerContainer as OdxToolsDiagLayerContainer
from odxtools.diaglayers.basevariant import BaseVariant as OdxToolsBaseVariant
from odxtools.diaglayers.diaglayer import DiagLayer as OdxToolsDiagLayer
from odxtools.diaglayers.ecushareddata import \
    EcuSharedData as OdxToolsEcuSharedData
from odxtools.diaglayers.ecuvariant import EcuVariant as OdxToolsEcuVariant
from odxtools.diagnostictroublecode import \
    DiagnosticTroubleCode as OdxToolsDiagnosticTroubleCode
from odxtools.diagservice import DiagService as OdxToolsDiagService
from odxtools.dopbase import DopBase as OdxToolsDopBase
from odxtools.dtcdop import DtcDop as OdxToolsDtcDop
from odxtools.ecuvariantpattern import \
    EcuVariantPattern as OdxToolsEcuVariantPattern
from odxtools.odxlink import resolve_snref
from odxtools.parameters.parameter import Parameter as OdxToolsParameter
from odxtools.singleecujob import SingleEcuJob as OdxToolsSingleEcuJob
from werkzeug.datastructures import FileStorage

# Maps the diagnostic data types with the uploaded data
diag_data_type_descriptor_map: dict[
    const.DiagnosticDataTypes, dict[str, DiagnosticDataSetDescriptor]
] = {
    const.DiagnosticDataTypes.PDX: {},
}

# Maps the perma_ID generated during PDX upload to the underlying DiagnosticDataSetDescriptor object
diag_data_set_id_dict: dict[str, DiagnosticDataSetDescriptor] = {}

# Maps the perma_ID of a diagnostic data set to all object with perma_IDs within this data set
perma_id_dicts: dict[str, dict[str, Any]] = {}

# TODO: Check if it works to keep all object ids of all diagnostic data sets / Databases in one dict
# that maps every object in every odx_db from its id() to the python object
object_id_dict: dict[int, Any] = {}

# Maps all DIAG_COMMs to the DiagLayer object they originate from / are defined in
diag_comm_source_layer_dict: dict[str, dict[str, OdxToolsDiagLayer]] = {}

# Maps all DTCs with their defining DTC-DOP by their object ids
dtc_source_dop_dict: dict[str, dict[str, str]] = {}

# Maps all DOPs and DTC-DOPs to the DiagLayer object they originate from / are defined in
dop_source_layer_dict: dict[str, dict[str, OdxToolsDiagLayer]] = {}

state_chart_source_layer_dict: dict[str, dict[str, OdxToolsDiagLayer]] = {}

# Resolve all OpenAPI schema names and their Python class/type definitions
# from the generated classes in the 'models' submodule
resolve_model_class_mappings(models)


def update_object_id_dict(db: DatabaseWithID) -> None:
    """Update the object_id_dict for the given database

    :param db: The database to be added to the object_id_dict.
    """
    perma_id_dicts[db.odex_perma_id] = {}
    diag_comm_source_layer_dict[db.odex_perma_id] = {}
    dtc_source_dop_dict[db.odex_perma_id] = {}
    dop_source_layer_dict[db.odex_perma_id] = {}
    state_chart_source_layer_dict[db.odex_perma_id] = {}

    perma_id_dicts[db.odex_perma_id][db.odex_perma_id] = db
    object_id_dict[id(db)] = db
    for dlc in db.diag_layer_containers:
        _update_object_id_dict_helper(db, dlc)


def _update_object_id_dict_helper(db: DatabaseWithID, obj: Any) -> None:
    if not is_dataclass(obj):
        return

    # Check if a perma_id exists, and add the mapping to the dict
    if (perma_id := model_utils.get_perma_id(obj)) is not None:
        perma_id_dicts[db.odex_perma_id][perma_id] = obj

    # Add ephemeral id to the global id dictionary
    object_id_dict[id(obj)] = obj
    # Add mapping between ephemeral object id and the perma ID of the database
    model_utils.ephemeral_object_id_database_perma_id_dict[id(obj)] = db.odex_perma_id

    if isinstance(obj, OdxToolsDiagLayer):
        # Map DiagComms with the diagnostic layer they are defined in
        for diag_comm in obj.diag_comms_raw:
            if isinstance(diag_comm, odxtools.diagcomm.DiagComm):
                diag_comm_source_layer_dict[db.odex_perma_id][get_perma_id(diag_comm) or ""] = obj

        # Map DOPs with the diagnostic layer they are defined in
        if obj.diag_layer_raw.diag_data_dictionary_spec is not None:
            for dop_obj in obj.diag_layer_raw.diag_data_dictionary_spec.all_data_object_properties:
                dop_source_layer_dict[db.odex_perma_id][get_perma_id(dop_obj) or ""] = obj

                # Map DTCs with the DTC-DOP they are defined in
                if isinstance(dop_obj, OdxToolsDtcDop):
                    for dtc in dop_obj.dtcs:
                        dtc_source_dop_dict[db.odex_perma_id][get_perma_id(dtc) or ""] = (
                            get_perma_id(dop_obj) or ""
                        )

        if obj.diag_layer_raw.state_charts is not None:
            for state_chart in obj.diag_layer_raw.state_charts:
                state_chart_source_layer_dict[db.odex_perma_id][get_perma_id(state_chart) or ""] = (
                    obj
                )

    for field in dataclasses.fields(obj):
        field_obj = getattr(obj, field.name)

        if isinstance(field_obj, (list, tuple)):
            for x in field_obj:
                _update_object_id_dict_helper(db, x)
        elif is_dataclass(field_obj):
            _update_object_id_dict_helper(db, field_obj)


def get_uds_service_info(dc: odxtools.diagcomm.DiagComm) -> UdsServiceInfo | None:
    """Get UDS service information for a diagnostic communication object.

    :param dc: The DiagService of SingleEcuJob to get underlying UDS service information for.
    :rtype: The UdsServiceInfo or None, if no such information could be resolved.
    """
    if isinstance(dc, OdxToolsSingleEcuJob):
        return None
    if isinstance(dc, OdxToolsDiagService) and dc.request:
        try:
            service_id = odx_util.get_uds_service_id(dc)
            service_name = odx_util.get_uds_service_name(service_id)

            return UdsServiceInfo(service_id=service_id, service_name=service_name)
        except ValueError as e:
            logger.warning(
                "[get_uds_service_info] - Resolving UDS service from diagComm='%s' caused an error: %s",
                dc.short_name,
                str(e),
            )
    return None


def get_main_diag_layer_container(db: DatabaseWithID) -> OdxToolsDiagLayerContainer | None:
    # Resolve and assign the main diag_layer_container to get its document revision
    if len(db.diag_layer_containers) == 1:
        # If there is only a single diag layer container, we can directly assign it
        return db.diag_layer_containers[0]
    else:
        # Try to get the main diag layer via matching short_names
        return db.diag_layer_containers.get(db.short_name)


def _remove_object_id_dict_helper(db: DatabaseWithID, obj: Any) -> None:
    obj_id = id(obj)
    perma_id = get_perma_id(obj)

    assert db.odex_perma_id in perma_id_dicts, (
        f"Database object id '{db.odex_perma_id}' not found in perma_id_dicts."
    )

    if not is_dataclass(obj):
        return

    # Remove the object with the given obj_id from related dictionaries
    if obj_id in object_id_dict:
        del object_id_dict[obj_id]
    if perma_id is not None and perma_id in perma_id_dicts[db.odex_perma_id]:
        del perma_id_dicts[db.odex_perma_id][perma_id]
    if obj_id in model_utils.ephemeral_object_id_database_perma_id_dict:
        del model_utils.ephemeral_object_id_database_perma_id_dict[obj_id]

    if isinstance(obj, OdxToolsDiagLayer):
        # Remove all mappings of DiagComms with the diagnostic layer they are defined in
        for diag_comm in obj.diag_comms:
            diag_comm_perma_id = get_perma_id(diag_comm)
            if (
                isinstance(diag_comm, odxtools.diagcomm.DiagComm)
                and diag_comm_perma_id is not None
                and diag_comm_perma_id in diag_comm_source_layer_dict[db.odex_perma_id]
            ):
                del diag_comm_source_layer_dict[db.odex_perma_id][diag_comm_perma_id]

        # Remove all mappings of DOPs with the diagnostic layer they are defined in
        if obj.diag_data_dictionary_spec is not None:
            for dop_obj in obj.diag_data_dictionary_spec.all_data_object_properties:
                dop_obj_perma_id = get_perma_id(dop_obj)
                if (
                    dop_obj_perma_id is not None
                    and dop_obj_perma_id in dop_source_layer_dict[db.odex_perma_id]
                ):
                    del dop_source_layer_dict[db.odex_perma_id][dop_obj_perma_id]

                # Remove all mappings of DTCs with the DTC-DOP they are defined in
                if isinstance(dop_obj, OdxToolsDtcDop):
                    for dtc in dop_obj.dtcs:
                        dtc_perma_id = get_perma_id(dtc)
                        if (
                            dtc_perma_id is not None
                            and dtc_perma_id in dtc_source_dop_dict[db.odex_perma_id]
                        ):
                            del dtc_source_dop_dict[db.odex_perma_id][dtc_perma_id]

        if obj.diag_layer_raw.state_charts is not None:
            for state_chart in obj.diag_layer_raw.state_charts:
                state_chart_perma_id = get_perma_id(state_chart)
                if (
                    state_chart_perma_id is not None
                    and state_chart_perma_id in state_chart_source_layer_dict[db.odex_perma_id]
                ):
                    del state_chart_source_layer_dict[db.odex_perma_id][state_chart_perma_id]

    for field in dataclasses.fields(obj):
        field_obj = getattr(obj, field.name)

        if isinstance(field_obj, (list, tuple)):
            for x in field_obj:
                _remove_object_id_dict_helper(db, x)
        elif is_dataclass(field_obj):
            _remove_object_id_dict_helper(db, field_obj)


def get_diagnostic_data_types() -> tuple[DiagnosticDataTypeCollection, int, dict[str, str]]:
    """
    Returns the collection of diagnostic data types of the server.

    :returns: 200, DiagnosticDataTypeCollection
    """
    response = DiagnosticDataTypeCollection(items=[e.name for e in const.DiagnosticDataTypes])
    return response, 200, {"Content-Type": "application/json"}


def get_diagnostic_data_collection_of_type(
    data_type: str,
) -> tuple[DiagnosticDataCollection, int, dict[str, str]] | ConnexionResponse:
    """get_diagnostic_data_collection_of_type

    Returns the collection of diagnostic data descriptors of a specific type of diagnostic data set of the Server

    :param data_type: The type of diagnostic data to fetch
    :type data_type: str

    :returns: 200, DiagnosticDataCollection
    """
    result_list: list[DiagnosticDataSetDescriptor] = []

    data_type_dict = diag_data_type_descriptor_map.get(const.DiagnosticDataTypes(data_type))
    if data_type_dict is None:
        return response_codes.default404(
            exception=f"No diagnostic data with the given diagnostic data type '{data_type}' is available."
        )

    for diag_data_id in list(data_type_dict.keys()):
        data_descr = data_type_dict[diag_data_id]
        result_list.append(data_descr)

    return (
        DiagnosticDataCollection(items=result_list),
        200,
        {"Content-Type": "application/json"},
    )


def upload_diagnostic_data_to_server(
    data_type: str, metadata: dict[str, Any], file_content: FileStorage
) -> tuple[CreatedResourceReference, int, dict[str, str]] | ConnexionResponse:
    """
    Upload diagnostic data to the server and create a data resource.

    :param data_type: The type of diagnostic data to upload.
    :param metadata: The metadata of the diagnostic data, i.e., an optional file name and whether odxtools shall parse the file in strict-mode or not.
    :param file_content: The file content to be loaded into a database.

    :returns: 201, CreatedResourceReference
    """

    # Create a file descriptor for the file and add it with the odx_db_id to the dict
    file_name = file_content.filename or ""
    display_name = ""
    if (
        "metadata" in metadata
        and "display_name" in metadata["metadata"]
        and len(metadata["metadata"]["display_name"]) > 0
    ):
        display_name = str(metadata["metadata"]["display_name"])
    elif "display_name" in metadata and len(metadata["display_name"]) > 0:
        display_name = str(metadata["display_name"])

    if file_name == "blob" and display_name != "":
        file_name = display_name

    logger.debug(
        "[upload_diagnostic_data_to_server] - Start processing new upload of file with type='%s' and filename='%s'",
        data_type,
        file_name,
    )

    # Extract strict_mode parameter from metadata object, if present
    if (
        "metadata" in metadata
        and "strict_mode" in metadata["metadata"]
        and type(metadata["metadata"]["strict_mode"]) is bool
    ):
        strict_mode = metadata["metadata"]["strict_mode"]
    elif "strict_mode" in metadata and type(metadata["strict_mode"]) is bool:
        strict_mode = metadata["strict_mode"]
    else:
        strict_mode = None

    # Set strict mode, if 'strict_mode' parameter is provided in request
    if strict_mode is not None:
        odxtools.exceptions.strict_mode = strict_mode
        logger.debug(
            "[upload_diagnostic_data_to_server] - odxtools strict-mode is set to: %s",
            strict_mode,
        )

    odx_db = DatabaseWithID()
    fake_file = BytesIO()

    try:
        file_content.save(fake_file)
        odx_db.add_pdx_file(fake_file)
        odx_db.refresh()

        logger.debug(
            "[upload_diagnostic_data_to_server] - %s - An odxtools Database is successfully created for the diagnostic data set",
            file_name,
        )

        # Add the database to the dict
        odx_db_id = get_diag_data_set_perma_id(odx_db, file_name)
        odx_db.odex_perma_id = odx_db_id

        logger.debug(
            "[upload_diagnostic_data_to_server] - %s - The resolution of a permanent ID for the diagnostic data set is started",
            file_name,
        )

        # Check if perma_id is not already known, i.e., a diagnostic data set is uploaded which is already loaded by the server
        if odx_db_id not in model_utils.database_id_dict:
            model_utils.database_id_dict[odx_db_id] = odx_db

            update_object_id_dict(odx_db)

            logger.debug(
                "[upload_diagnostic_data_to_server] - %s - odxtools Database objects for the diagnostic data set are successfully indexed",
                file_name,
            )

            # Resolve the main diag_layer_container from odx_db to get its revision
            dlc = odx_db.diag_layer_containers.get(odx_db.short_name)
            revision_str = None
            if (admin_data := getattr(dlc, "admin_data", None)) is not None:
                if admin_data.doc_revisions:
                    revision_str = admin_data.doc_revisions[-1].revision_label

            logger.debug(
                "[upload_diagnostic_data_to_server] - %s - A diagnostic data set descriptor is successfully created",
                file_name,
            )

            logger.debug(
                "[upload_diagnostic_data_to_server] - Successfully completed processing of file with type='%s' and filename='%s'",
                data_type,
                file_name,
            )

            # Store the uploaded data as a new entry in the diag_data_type_descriptor_map
            diag_data_descr = DiagnosticDataSetDescriptor(
                perma_id=odx_db_id,
                ephemeral_id=id(odx_db),
                display_name=display_name,
                file_name=file_name,
                creation_date=datetime.now(timezone.utc),
                last_modified=datetime.now(timezone.utc),
                version=revision_str,
                diagnostic_layer_containers=[
                    DiagnosticLayerContainerInfo(
                        perma_id=get_perma_id(dlc),
                        ephemeral_id=id(dlc),
                        short_name=dlc.short_name,
                        is_main_container=(odx_db.short_name == dlc.short_name),
                    )
                    for dlc in odx_db.diag_layer_containers
                ],
            )
            diag_data_type_descriptor_map[const.DiagnosticDataTypes(data_type)][odx_db_id] = (
                diag_data_descr
            )

            # Add the new diagnostic data set to the respective dict
            diag_data_set_id_dict[odx_db_id] = diag_data_descr

            return (
                CreatedResourceReference(id=odx_db_id),
                201,
                {"Content-Type": "application/json"},
            )
        else:
            logger.warning(
                "[upload_diagnostic_data_to_server] - %s - The uploaded file is already known to the server, i.e., a diagnostic data set with the same perma_id is already stored. The uploaded file will not be processed again.",
                file_name,
            )

            error = JsonProblem(
                type="/problem/odx",
                title="The uploaded PDX file is already known to the server",
                status=400,
                detail=f"The PDX file is not loaded again, since it is already available within the server with the following perma-ID: {odx_db_id}",
                instance="/problem/odx#duplicate-perma-id",
                exception={
                    "exception": f"A diagnostic data set with id='{odx_db_id}' already exists. Please use the existing id to interact with the data or rename the file and upload it again to create a new diagnostic data set with a new perma-ID to keep the two versions distinguishable."
                },
            )

            return ConnexionResponse(
                status_code=400,
                body=api_jsonifier.dumps(data=error),
                content_type="application/problem+json",
            )
    except Exception as e:
        del odx_db
        del fake_file
        del file_content

        error = JsonProblem(
            type="/problem/odx",
            title="Problem when loading a PDX file",
            status=422,
            detail=f"The PDX file could not be loaded: {e}",
            instance="/problem/odx#error",
            exception=str(e),
        )

        logger.error(
            "[upload_diagnostic_data_to_server] - Processing of file with type='%s' and filename='%s' caused an error: %s",
            data_type,
            file_name,
            str(e),
        )

        return ConnexionResponse(
            status_code=422,
            body=api_jsonifier.dumps(data=error),
            content_type="application/problem+json",
        )
    finally:
        odxtools.exceptions.strict_mode = True
        logger.debug("[upload_diagnostic_data_to_server] - odxtools strict-mode is reset to 'True'")


def remove_diagnostic_data_from_server(
    diagnostic_data_set_id: str,
    data_type: const.DiagnosticDataTypes = const.DiagnosticDataTypes.PDX,
) -> ConnexionResponse:
    """
    Helper function to remove diagnostic data from the server and update all related dictionaries.

    :param diagnostic_data_set_id: The ID of the diagnostic data to remove.

    :returns: 204, None or 404, Not Found error
    """
    try:
        if diagnostic_data_set_id not in diag_data_set_id_dict:
            error = JsonProblem(
                title="/problem/odx",
                status=404,
                detail=f"The diagnostic data set with ID '{diagnostic_data_set_id}' was not found.",
                instance="/problem/odx#error",
                exception={"exception": "File not found"},
            )
            return ConnexionResponse(
                status_code=404,
                body=api_jsonifier.dumps(data=error),
                content_type="application/problem+json",
            )

        diag_data_set_descriptor = diag_data_set_id_dict[diagnostic_data_set_id]
        odx_db_id = diag_data_set_descriptor.perma_id

        if odx_db_id in model_utils.database_id_dict:
            odx_db = model_utils.database_id_dict[odx_db_id]

            # Remove all objects for all diag layer containers defined within the database
            for dlc in odx_db.diag_layer_containers:
                _remove_object_id_dict_helper(odx_db, dlc)

            # Delete diagnostic data set from perma_id_dict
            del perma_id_dicts[odx_db.odex_perma_id]
            # Delete diagnostic data set from database dict
            del model_utils.database_id_dict[odx_db.odex_perma_id]
            # Delete database from object dict
            del object_id_dict[id(odx_db)]

            # Delete diagnostic data set perma ID from helper dicts
            del diag_comm_source_layer_dict[odx_db.odex_perma_id]
            del dtc_source_dop_dict[odx_db.odex_perma_id]
            del dop_source_layer_dict[odx_db.odex_perma_id]
            del state_chart_source_layer_dict[odx_db.odex_perma_id]

            if data_type in diag_data_type_descriptor_map:
                del diag_data_type_descriptor_map[data_type][odx_db.odex_perma_id]

        del diag_data_set_id_dict[diagnostic_data_set_id]

        return ConnexionResponse(status_code=204, body=None)
    except Exception as e:
        error = JsonProblem(
            title="/problem/odx",
            status=422,
            detail=f"The diagnostic data could not be removed: {e}",
            instance="/problem/odx#error",
            exception={"exception": str(e)},
        )
        print(f"Caught exception: {str(e)}")
        return ConnexionResponse(
            status_code=422,
            body=api_jsonifier.dumps(data=error),
            content_type="application/problem+json",
        )


def delete_all_diagnostic_data_from_type(data_type: str) -> ConnexionResponse:
    """delete_all_diagnostic_data_from_type

    Deletes all diagnostic data set for the specified data type of the server.

    :param data_type: The type of diagnostic data to fetch
    :type data_type: str

    :returns: 204, None
    """

    data_type_dict = diag_data_type_descriptor_map.get(const.DiagnosticDataTypes(data_type))
    if data_type_dict is None:
        return response_codes.default404(
            exception=f"No diagnostic data with the given diagnostic data type '{data_type}' is available."
        )

    for diag_data_set_id in list(data_type_dict.keys()):
        response = remove_diagnostic_data_from_server(
            diag_data_set_id, const.DiagnosticDataTypes(data_type)
        )
        if response.status_code >= 400:
            return response

    return response_codes.default204()


def delete_diagnostic_data_from_type(data_type: str, diag_data_set_id: str) -> ConnexionResponse:
    """delete_diagnostic_data_from_type

    Deletes a specific diagnostic data set resource from the specified data type of the server.

    :param data_type: The type of diagnostic data to fetch
    :type data_type: str
    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str

    :returns: 204, None
    """

    data_type_dict = diag_data_type_descriptor_map.get(const.DiagnosticDataTypes(data_type))
    if data_type_dict is None:
        return response_codes.default404(
            exception=f"No diagnostic data with the given diagnostic data type '{data_type}' is available."
        )

    return remove_diagnostic_data_from_server(
        diag_data_set_id, const.DiagnosticDataTypes(data_type)
    )


def get_object_by_perma_id_from_diagnostic_data_set(
    diag_data_set_id: str, perma_id: str
) -> ConnexionResponse:
    """get_object_by_perma_id_from_diagnostic_data_set

    Returns the given object from the Server

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str

    :rtype: object
    """
    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    if (
        perma_id is None
        or perma_id not in perma_id_dicts[diag_data_set_id]
        or (obj := perma_id_dicts[diag_data_set_id].get(perma_id)) is None
    ):
        return response_codes.default404(
            exception=f"An object with the requested permanent id '{perma_id}' is not found."
        )

    result: dict[str, Any] = {}

    if isinstance(obj, DatabaseWithID):
        result["diag_layer_containers"] = [get_perma_id(x) for x in obj.diag_layer_containers]
    else:
        for field in dataclasses.fields(obj):
            field_obj = getattr(obj, field.name)

            if isinstance(field_obj, (list, tuple)):
                result[field.name] = [id(x) for x in field_obj]
            elif isinstance(field_obj, (str, int, float, bytes)):
                result[field.name] = field_obj
            elif isinstance(field_obj, Enum):
                result[field.name] = (
                    field_obj.value if type(field_obj.value) is str else field_obj.name
                )
            elif is_dataclass(field_obj):
                result[field.name] = id(field_obj)
            else:
                result[field.name] = str(field_obj)

    return ConnexionResponse(
        status_code=200,
        body=api_jsonifier.dumps(data=result),
        content_type="application/json",
    )


def get_object_by_ephemeral_id(ephemeral_id: int) -> ConnexionResponse:
    """get_object

    Returns the given object from the Server

    :param ephemeral_id: The ephemeral ID of the object to fetch
    :type ephemeral_id: int

    :rtype: object
    """

    if type(ephemeral_id) is not int:
        return response_codes.default404(
            exception=f"This endpoint only supports ephemeral object ids. The provided value '{ephemeral_id}' is not a valid ephemeral object id."
        )

    obj = object_id_dict.get(ephemeral_id)
    if obj is None:
        return response_codes.default404(
            exception=f"An object with the requested ephemeral id '{ephemeral_id}' is not found."
        )

    result: dict[str, Any] = {}

    if isinstance(obj, DatabaseWithID):
        result["diag_layer_containers"] = [get_perma_id(x) for x in obj.diag_layer_containers]
    else:
        for field in dataclasses.fields(obj):
            field_obj = getattr(obj, field.name)

            if isinstance(field_obj, (list, tuple)):
                result[field.name] = [id(x) for x in field_obj]
            elif isinstance(field_obj, (str, int, float, bytes)):
                result[field.name] = field_obj
            elif isinstance(field_obj, Enum):
                result[field.name] = (
                    field_obj.value if type(field_obj.value) is str else field_obj.name
                )
            elif is_dataclass(field_obj):
                result[field.name] = id(field_obj)
            else:
                result[field.name] = str(field_obj)

    return ConnexionResponse(
        status_code=200,
        body=api_jsonifier.dumps(data=result),
        content_type="application/json",
    )


def get_diagnostic_variants_of_diagnostic_data_set(
    diag_data_set_id: str, filter_variants_by_perma_ids: list[str]
) -> tuple[DiagnosticVariantsCollection, int, dict[str, str]] | ConnexionResponse:
    """

    Returns the list of diagnostic variants from the given database.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param filter_variants_by_perma_ids: Filters the collection of variants provided by a database
        based on the provided list of permanent IDs.
    :type filter_variants_by_perma_ids: List[str]

    :rtype: DiagnosticVariantsCollection
    """

    assert isinstance(diag_data_set_id, str)

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    var_list = []
    for x in chain(odx_db.base_variants, odx_db.ecu_variants):
        # If the filter query param is provided, ignore all variants
        # not being listed in the query param
        if filter_variants_by_perma_ids and get_perma_id(x) not in filter_variants_by_perma_ids:
            continue

        revision_str = None
        revision_obj_id = None
        if x.admin_data is not None and x.admin_data.doc_revisions:
            revision_str = x.admin_data.doc_revisions[-1].revision_label
            revision_obj_id = id(x.admin_data.doc_revisions[-1])
        variant_patterns = []

        # extract the relevant information for base and ecu variant patterns
        odx_variant_patterns: list[OdxToolsBaseVariantPattern | OdxToolsEcuVariantPattern] = []
        if isinstance(x, OdxToolsEcuVariant):
            odx_variant_patterns.extend(x.ecu_variant_patterns)
        elif isinstance(x, OdxToolsBaseVariant) and x.base_variant_pattern is not None:
            odx_variant_patterns.append(x.base_variant_pattern)
        for vp in odx_variant_patterns:
            tmp = []
            for mp in vp.get_matching_parameters():
                diag_comm = resolve_snref(mp.diag_comm_snref, x.diag_comms)

                if mp.out_param_if_snref:
                    # TODO: in principle, there can be more than a
                    # single response and the out_param_if can
                    # also be referenced via SNPATHREF
                    param = resolve_snref(
                        mp.out_param_if_snref,
                        diag_comm.positive_responses[0].parameters,
                        OdxToolsParameter,
                    )
                    tmp.append(
                        VariantPatternInner(
                            diag_comm_short_name=mp.diag_comm_snref,
                            diag_comm_obj_id=get_perma_id(diag_comm),
                            param_short_name=mp.out_param_if_snref,
                            param_obj_id=id(param),
                            expected_value=mp.expected_value,
                        )
                    )
            variant_patterns.append(tmp)

        variant_type = (
            DiagLayerType.ECU_MINUS_VARIANT
            if x.variant_type.value == "ECU-VARIANT"
            else DiagLayerType.BASE_MINUS_VARIANT
        )

        description_str = None
        if (desc := getattr(x, "description", None)) is not None:
            description_str = str(desc)

        parent_refs = None
        if (p_refs := getattr(x, "parent_refs", None)) is not None:
            parent_refs = translate_to_model(
                db_object=odx_db,
                target_model_cls=ParentRef,
                obj_to_translate=p_refs,
            )

        var_list.append(
            DiagnosticVariant(
                short_name=x.short_name,
                long_name=x.long_name,
                description=description_str,
                variant_type=variant_type,
                revision=revision_str,
                revision_ephemeral_id=revision_obj_id,
                variant_patterns=variant_patterns,
                perma_id=get_perma_id(x),
                ephemeral_id=id(x),
                sdgs=translate_to_model(
                    db_object=odx_db,
                    target_model_cls=SpecialDataGroup,
                    obj_to_translate=x.sdgs,
                ),
                parent_refs=parent_refs,
            )
        )

    return (
        DiagnosticVariantsCollection(items=var_list),
        200,
        {"Content-Type": "application/json"},
    )


def get_diagnostic_variant(
    diag_data_set_id: str,
    variant_perma_id: str,
) -> tuple[DiagnosticVariant, int, dict[str, str]] | ConnexionResponse:
    """get_diagnostic_variant

    Returns a single diagnostic variant with the given ID, if there exists one.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str

    :rtype: DiagnosticVariant
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)

    variant_obj = perma_id_dicts[diag_data_set_id].get(variant_perma_id)
    if not variant_obj:
        return response_codes.default404(
            exception=f"A diagnostic variant with permanent object id '{variant_perma_id}' was not found."
        )

    if not isinstance(variant_obj, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )

    revision_str = None
    revision_obj_id = None
    if variant_obj.admin_data is not None and variant_obj.admin_data.doc_revisions:
        revision_str = variant_obj.admin_data.doc_revisions[-1].revision_label
        revision_obj_id = id(variant_obj.admin_data.doc_revisions[-1])
    variant_patterns = []

    # extract the relevant information for base and ecu variant patterns
    odx_variant_patterns: list[OdxToolsBaseVariantPattern | OdxToolsEcuVariantPattern] = []
    if isinstance(variant_obj, OdxToolsEcuVariant):
        odx_variant_patterns.extend(variant_obj.ecu_variant_patterns)
    elif (
        isinstance(variant_obj, OdxToolsBaseVariant)
        and variant_obj.base_variant_pattern is not None
    ):
        odx_variant_patterns.append(variant_obj.base_variant_pattern)
    for vp in odx_variant_patterns:
        tmp = []
        for mp in vp.get_matching_parameters():
            diag_comm = resolve_snref(mp.diag_comm_snref, variant_obj.diag_comms)

            if mp.out_param_if_snref:
                # TODO: in principle, there can be more than a
                # single response and the out_param_if can
                # also be referenced via SNPATHREF
                param = resolve_snref(
                    mp.out_param_if_snref,
                    diag_comm.positive_responses[0].parameters,
                    OdxToolsParameter,
                )
                tmp.append(
                    VariantPatternInner(
                        diag_comm_short_name=mp.diag_comm_snref,
                        diag_comm_obj_id=get_perma_id(diag_comm),
                        param_short_name=mp.out_param_if_snref,
                        param_obj_id=get_perma_id(param),
                        expected_value=mp.expected_value,
                    )
                )
        variant_patterns.append(tmp)

    description_str = None
    if (desc := getattr(variant_obj, "description", None)) is not None:
        description_str = str(desc)

    return (
        DiagnosticVariant(
            short_name=variant_obj.short_name,
            long_name=variant_obj.long_name,
            description=description_str,
            variant_type=translate_to_model(
                db_object=odx_db,
                obj_to_translate=variant_obj.variant_type,
            ),
            revision=revision_str,
            revision_ephemeral_id=revision_obj_id,
            variant_patterns=variant_patterns,
            perma_id=get_perma_id(variant_obj),
            ephemeral_id=id(variant_obj),
            sdgs=translate_to_model(
                db_object=odx_db,
                target_model_cls=SpecialDataGroup,
                obj_to_translate=variant_obj.sdgs,
            ),
            parent_refs=translate_to_model(
                db_object=odx_db,
                target_model_cls=ParentRef,
                obj_to_translate=variant_obj.parent_refs,
            ),
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_revision_history_of_diagnostic_data_set(
    diag_data_set_id: str,
) -> tuple[RevisionHistory, int, dict[str, str]] | ConnexionResponse:
    """

    Returns the revision history from the given diagnostic data set.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str

    :rtype: RevisionHistory
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    container_type = ContainerType.DIAG_LAYER_CONTAINER
    # Resolve the main diagnostic layer container
    obj = get_main_diag_layer_container(odx_db)
    obj_perma_id = get_perma_id(obj)
    if obj is None or obj_perma_id is None:
        return response_codes.default404(
            exception=f"The main diagnostic layer container for diagnostic data set with id '{diag_data_set_id}' could not be resolved."
        )

    if not hasattr(obj, "admin_data") or obj.admin_data is None:
        return response_codes.default400(
            exception=f"The given permanent object id '{obj_perma_id}' does not have a revision history"
        )

    admin_data = obj.admin_data

    dr_items = []
    for doc_revision in admin_data.doc_revisions:
        tm = doc_revision.team_member

        tm_object_ref = None
        if tm:
            tm_object_ref = NamedObjectIdRef(
                name=tm.long_name or tm.short_name,
                perma_id=get_perma_id(doc_revision.team_member),
                ephemeral_id=id(doc_revision.team_member),
            )

        dr_items.append(
            Revision(
                ephemeral_id=id(doc_revision),
                revision_label=doc_revision.revision_label,
                state=doc_revision.state,
                _date=doc_revision.date,
                team_member_ref=tm_object_ref,
                tool=doc_revision.tool,
                container_type=container_type,
                container_name=obj.short_name,
                modifications=translate_to_model(
                    db_object=odx_db,
                    target_model_cls=Modification,
                    obj_to_translate=doc_revision.modifications,
                ),
            )
        )
    cd_items = []
    if hasattr(obj, "company_datas"):
        for comp_data in obj.company_datas:
            comp_description_str = None
            if (desc := getattr(comp_data, "description", None)) is not None:
                comp_description_str = str(desc)

            cd_items.append(
                CompanyData(
                    data_id=comp_data.odx_id.local_id,
                    short_name=comp_data.short_name,
                    description=comp_description_str,
                    long_name=comp_data.long_name,
                    team_members=translate_to_model(
                        db_object=odx_db,
                        target_model_cls=TeamMember,
                        obj_to_translate=comp_data.team_members,
                    ),
                )
            )

    return (
        RevisionHistory(
            container_name=obj.short_name,
            container_perma_id=obj_perma_id,
            container_ephemeral_id=id(obj),
            container_type=container_type,
            language=admin_data.language,
            revisions=dr_items,
            company_datas=cd_items,
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_revision_history_of_variant(
    diag_data_set_id: str,
    perma_id: str,
) -> tuple[RevisionHistory, int, dict[str, str]] | ConnexionResponse:
    """

    Returns the revision history from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param perma_id: ID of the object to fetch
    :type perma_id: str

    :rtype: RevisionHistory
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    obj = perma_id_dicts[diag_data_set_id].get(perma_id)
    if obj is None:
        return response_codes.default404(
            exception=f"An object with the requested permanent object id '{perma_id}' is not found."
        )

    if isinstance(obj, (OdxToolsEcuVariant | OdxToolsBaseVariant)):
        container_type = ContainerType.ECU_VARIANT
    else:
        return response_codes.default400(
            exception=f"The object with the requested permanent object id '{perma_id}' is not of type ECU_VARIANT or BASE_VARIANT."
        )

    if not hasattr(obj, "admin_data") or obj.admin_data is None:
        return response_codes.default400(
            exception=f"The given permanent object id '{perma_id}' does not have a revision history"
        )

    admin_data = obj.admin_data

    dr_items = []
    for doc_revision in admin_data.doc_revisions:
        tm = doc_revision.team_member

        tm_object_ref = None
        if tm:
            tm_object_ref = NamedObjectIdRef(
                name=tm.long_name or tm.short_name,
                perma_id=get_perma_id(doc_revision.team_member),
                ephemeral_id=id(doc_revision.team_member),
            )

        dr_items.append(
            Revision(
                ephemeral_id=id(doc_revision),
                revision_label=doc_revision.revision_label,
                state=doc_revision.state,
                _date=doc_revision.date,
                team_member_ref=tm_object_ref,
                tool=doc_revision.tool,
                container_type=container_type,
                container_name=obj.short_name,
                modifications=translate_to_model(
                    db_object=odx_db,
                    target_model_cls=Modification,
                    obj_to_translate=doc_revision.modifications,
                ),
            )
        )
    cd_items = []
    if hasattr(obj, "company_datas"):
        for comp_data in obj.company_datas:
            comp_description_str = None
            if (desc := getattr(comp_data, "description", None)) is not None:
                comp_description_str = str(desc)

            cd_items.append(
                CompanyData(
                    data_id=comp_data.odx_id.local_id,
                    short_name=comp_data.short_name,
                    description=comp_description_str,
                    long_name=comp_data.long_name,
                    team_members=translate_to_model(
                        db_object=odx_db,
                        target_model_cls=TeamMember,
                        obj_to_translate=comp_data.team_members,
                    ),
                )
            )

    return (
        RevisionHistory(
            container_name=obj.short_name,
            container_perma_id=get_perma_id(obj),
            container_ephemeral_id=id(obj),
            container_type=container_type,
            language=admin_data.language,
            revisions=dr_items,
            company_datas=cd_items,
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_metadata_by_perma_id_from_diagnostic_data_set(
    diag_data_set_id: str, perma_id: str, resolve_main_diag_layer: bool
) -> tuple[ObjectMetadata, int, dict[str, str]] | ConnexionResponse:
    """get_metadata_by_perma_id_from_diagnostic_data_set

    Returns metadata for the given object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str
    :param resolve_main_diag_layer: Whether the main diagnostic layer container of a diagnostic data object shall be resolved automatically or not.
    :type resolve_main_diag_layer: bool
    :param body: The raw request body

    :rtype: ObjectMetadata
    """
    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    if (
        perma_id is None
        or perma_id not in perma_id_dicts[diag_data_set_id]
        or (obj := perma_id_dicts[diag_data_set_id].get(perma_id)) is None
    ):
        return response_codes.default404(
            exception=f"An object with the requested permanent id '{perma_id}' is not found."
        )

    model_version_str = "<undefined>"
    odx_id_str = None
    if isinstance(obj, DatabaseWithID):
        if obj.model_version is not None:
            model_version_str = str(obj.model_version)
        if resolve_main_diag_layer:
            # Resolve and assign the main diag_layer_container to get its metadata
            obj = get_main_diag_layer_container(obj)
    else:
        db_obj = model_utils.resolve_database_from_object(obj)
        if db_obj is not None and db_obj.model_version is not None:
            model_version_str = str(db_obj.model_version)
        if hasattr(obj, "odx_id"):
            odx_id_str = obj.odx_id.local_id

    revision_str = None
    revision_obj_id = None
    if (admin_data := getattr(obj, "admin_data", None)) is not None:
        if admin_data.doc_revisions:
            revision_str = admin_data.doc_revisions[-1].revision_label
            revision_obj_id = id(admin_data.doc_revisions[-1])

    description_str = None
    if (desc := getattr(obj, "description", None)) is not None:
        description_str = str(desc)

    class_name_str = None
    class_type = model_utils.type_with_weakref(obj)
    if class_type is not None:
        class_name_str = class_type.__name__

    return (
        ObjectMetadata(
            odx_model_version=model_version_str,
            short_name=getattr(obj, "short_name", None),
            long_name=getattr(obj, "long_name", None),
            odx_id=odx_id_str,
            revision=revision_str,
            revision_ephemeral_id=revision_obj_id,
            description=description_str,
            class_name=class_name_str,
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_metadata_of_object_by_ephemeral_id(
    ephemeral_id: int, resolve_main_diag_layer: bool
) -> tuple[ObjectMetadata, int, dict[str, str]] | ConnexionResponse:
    """

    Returns metadata for the given object.

    :param ephemeral_id: The ephemeral ID of the object to fetch
    :type ephemeral_id: int
    :param resolve_main_diag_layer: Whether the main diagnostic layer container of a diagnostic data object shall be resolved automatically or not.
    :type resolve_main_diag_layer: bool

    :rtype: ObjectMetadata
    """

    assert isinstance(ephemeral_id, int)
    obj = object_id_dict.get(ephemeral_id)
    if obj is None:
        return response_codes.default404(
            exception=f"An object with the requested ephemeral ID '{ephemeral_id}' is not found."
        )

    model_version_str = "<undefined>"
    odx_id_str = None
    if isinstance(obj, DatabaseWithID):
        if obj.model_version is not None:
            model_version_str = str(obj.model_version)
        if resolve_main_diag_layer:
            # Resolve and assign the main diag_layer_container to get its metadata
            obj = get_main_diag_layer_container(obj)
    else:
        db_obj = model_utils.resolve_database_from_object(obj)
        if db_obj is not None and db_obj.model_version is not None:
            model_version_str = str(db_obj.model_version)
        if hasattr(obj, "odx_id"):
            odx_id_str = obj.odx_id.local_id

    revision_str = None
    revision_obj_id = None
    if (admin_data := getattr(obj, "admin_data", None)) is not None:
        if admin_data.doc_revisions:
            revision_str = admin_data.doc_revisions[-1].revision_label
            revision_obj_id = id(admin_data.doc_revisions[-1])

    description_str = None
    if (desc := getattr(obj, "description", None)) is not None:
        description_str = str(desc)

    class_name_str = None
    class_type = model_utils.type_with_weakref(obj)
    if class_type is not None:
        class_name_str = class_type.__name__

    return (
        ObjectMetadata(
            odx_model_version=model_version_str,
            short_name=getattr(obj, "short_name", None),
            long_name=getattr(obj, "long_name", None),
            odx_id=odx_id_str,
            revision=revision_str,
            revision_ephemeral_id=revision_obj_id,
            description=description_str,
            class_name=class_name_str,
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_all_diag_comms_from_all_diagnostic_data_sets(
    fields: list[str] | None,
) -> tuple[DiagCommsOfVariantsOfDataSetsCollection, int, dict[str, str]] | ConnexionResponse:
    """get_all_diag_comms_from_all_diagnostic_data_sets

    Returns all diagnostic communications from all existing BASE-VARIANT or ECU-VARIANT objects in all diagnostic data sets.
    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id is always returned for any object.
    :type fields: List[str]

    :rtype: DiagCommsOfVariantsOfDataSetsCollection
    """
    diag_data_set_list: list[DiagnosticDataSetDescriptor] = []
    variants_list: list[DiagnosticVariant] = []
    diag_comm_list: list[DiagCommWithDataSetsVariantRefs] = []

    # Use existing API method to get all diagnostic data sets objects directly in the target representation
    diag_data_set_collection = None
    result = get_diagnostic_data_collection_of_type("PDX")

    if result is not None and isinstance(result, tuple):
        diag_data_set_collection = result[0]

        for diag_set_api_obj in diag_data_set_collection.items:
            # Collect the relations between diag_comms and variants within each database
            diag_comm_map: dict[str, DiagCommWithDataSetsVariantRefs] = {}

            diag_data_set_list.append(diag_set_api_obj)

            odx_db = model_utils.database_id_dict.get(diag_set_api_obj.perma_id)
            if not odx_db or not isinstance(odx_db, DatabaseWithID):
                continue

            # Use existing API method to get all diagnostic variants provided within the DB object
            # directly in the target representation
            variants_collection = get_diagnostic_variants_of_diagnostic_data_set(
                diag_data_set_id=diag_set_api_obj.perma_id, filter_variants_by_perma_ids=[]
            )

            # Check if there is an error response when trying to retrieve the variants
            if isinstance(variants_collection, tuple):
                for variant_api_obj in variants_collection[0].items:
                    variants_list.append(variant_api_obj)

                    # Resolve detailed variant object via perma_id to get diag_comms
                    variant = perma_id_dicts[diag_set_api_obj.perma_id].get(
                        variant_api_obj.perma_id
                    )
                    if variant and isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
                        for dc in variant.diag_comms:
                            diag_comm_id = get_perma_id(dc)
                            if diag_comm_id is None:
                                continue

                            if diag_comm_id in diag_comm_map:
                                # Add the current variant to the reference list of the already processed diagComm
                                diag_comm_map[diag_comm_id].referencing_variant_perma_ids.append(
                                    variant_api_obj.perma_id
                                )
                            else:
                                # Add additional infos
                                origin_layer = diag_comm_source_layer_dict[
                                    diag_set_api_obj.perma_id
                                ].get(diag_comm_id)

                                diag_comm_api_obj: DiagCommGenericInfo = cast(
                                    DiagCommGenericInfo,
                                    translate_to_model(
                                        db_object=odx_db,
                                        target_model_cls=DiagCommGenericInfo,
                                        obj_to_translate=dc,
                                        filter_fields=fields,
                                    ),
                                )

                                uds_service = get_uds_service_info(dc)
                                if uds_service is not None:
                                    diag_comm_api_obj.uds_service = uds_service

                                if origin_layer is not None:
                                    diag_comm_api_obj.origin_layer_perma_id = (
                                        get_perma_id(origin_layer) or ""
                                    )
                                    diag_comm_api_obj.origin_layer_ephemeral_id = id(origin_layer)
                                    diag_comm_api_obj.origin_layer_short_name = (
                                        origin_layer.short_name
                                    )
                                    diag_comm_api_obj.origin_layer_type = (
                                        origin_layer.variant_type.value
                                    )

                                # Wrap the resulting object with the references to DB and variant (DiagCommWithDataSetVariantRefs) and add it to the diag_comm_map
                                diag_comm_map[diag_comm_id] = DiagCommWithDataSetsVariantRefs(
                                    diagnostic_data_set_id=diag_set_api_obj.perma_id,
                                    referencing_variant_perma_ids=[variant_api_obj.perma_id],
                                    diag_comm=diag_comm_api_obj,
                                )
            else:
                # Return the error response
                return variants_collection

            # Add all collected individual diag_comms to the result list
            diag_comm_list.extend(list(diag_comm_map.values()))

    return (
        DiagCommsOfVariantsOfDataSetsCollection(
            diagnostic_data_sets=diag_data_set_list,
            variants=variants_list,
            diag_comms=diag_comm_list,
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_diag_comms(
    diag_data_set_id: str, variant_perma_id: str, fields: list[str] | None
) -> tuple[DiagCommCollection, int, dict[str, str]] | ConnexionResponse:
    """

    Returns the diagnostic communications from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the object to fetch
    :type variant_perma_id: str
    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id is always returned for any object.
    :type fields: List[str]

    :rtype: DiagCommCollection
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    variant = perma_id_dicts[diag_data_set_id][variant_perma_id]

    if not isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )

    items = []
    for dc in variant.diag_comms:
        dc_perma_id = get_perma_id(dc)

        if dc_perma_id is not None:
            origin_layer = diag_comm_source_layer_dict[diag_data_set_id][dc_perma_id]

            diag_comm_info: DiagCommInfo = cast(
                DiagCommInfo,
                translate_to_model(
                    db_object=odx_db,
                    target_model_cls=DiagCommInfo,
                    obj_to_translate=dc,
                    filter_fields=fields,
                ),
            )

            # Add additional infos
            uds_service = get_uds_service_info(dc)
            if uds_service is not None:
                diag_comm_info.uds_service = uds_service

            if origin_layer is not None:
                diag_comm_info.origin_layer_perma_id = get_perma_id(origin_layer) or ""
                diag_comm_info.origin_layer_ephemeral_id = id(origin_layer)
                diag_comm_info.origin_layer_short_name = origin_layer.short_name
                diag_comm_info.origin_layer_type = origin_layer.variant_type.value

            items.append(diag_comm_info)

    return DiagCommCollection(items=items), 200, {"Content-Type": "application/json"}


def get_diag_comm_by_perma_id(
    diag_data_set_id: str, variant_perma_id: str, diag_comm_perma_id: str
) -> tuple[DiagCommDetails, int, dict[str, str]] | ConnexionResponse:
    """

    Returns a diagnostic communication from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param diag_comm_perma_id: ID of the diagnostic communication to fetch
    :type diag_comm_perma_id: str

    :rtype: DiagCommDetails
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    assert isinstance(diag_comm_perma_id, str)
    if diag_comm_perma_id is None or diag_comm_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"DiagComm with permanent object id '{diag_comm_perma_id}' not found"
        )

    dc = perma_id_dicts[diag_data_set_id].get(diag_comm_perma_id)

    if not isinstance(dc, odxtools.diagcomm.DiagComm):
        return response_codes.default400(
            exception=f"The given permanent object id '{diag_comm_perma_id}' does not belong to a DiagComm object."
        )

    origin_layer = diag_comm_source_layer_dict[diag_data_set_id].get(diag_comm_perma_id)

    # Resolve the given variant id and check if the diagComm is defined within the variant
    variant_obj = perma_id_dicts[diag_data_set_id].get(variant_perma_id)
    if not isinstance(variant_obj, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )
    if dc not in variant_obj.diag_comms:
        return response_codes.default400(
            exception=f"The given DiagComm permanent object id '{diag_comm_perma_id}' does not belong to a diagnostic communication defined within the variant with permanent object id '{variant_perma_id}'. The origin variant the DiagComm is defined in has the following permanent object id: '{get_perma_id(origin_layer)}'"
        )

    # Translate data to OpenAPI model
    diag_comm = cast(
        DiagCommDetails,
        translate_to_model(
            db_object=odx_db,
            target_model_cls=DiagCommDetails,
            obj_to_translate=dc,
            translate_properties=True,
        ),
    )

    # Enhance model object with additional information
    uds_service = get_uds_service_info(dc)
    if uds_service is not None:
        diag_comm.uds_service = uds_service

    if origin_layer is not None:
        diag_comm.origin_layer_perma_id = get_perma_id(origin_layer) or ""
        diag_comm.origin_layer_ephemeral_id = id(origin_layer)
        diag_comm.origin_layer_short_name = origin_layer.short_name
        diag_comm.origin_layer_type = origin_layer.variant_type.value

    return diag_comm, 200, {"Content-Type": "application/json"}


def get_structured_data_by_perma_id_from_diagnostic_data_set(
    diag_data_set_id: str, schema_name: str, perma_id: str
) -> tuple[OdxAny, int, dict[str, str]] | ConnexionResponse:
    """get_structured_data_by_perma_id_from_diagnostic_data_set

    Structured data retrieval by providing the target schema name and the permanent object-id to be retrieved.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param schema_name: Name of the schema to be retrieved
    :type schema_name: dict | bytes
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str
    :param body: The raw request body

    :rtype: OdxAny
    """
    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    if (
        type(schema_name) is not str
        or schema_name is None
        or schema_name not in model_utils.openapi_schema_map
    ):
        return response_codes.default404(
            exception=f"The requested schema name '{schema_name}' is not found."
        )
    target_schema_cls = model_utils.openapi_schema_map[schema_name]

    if (
        perma_id is None
        or perma_id not in perma_id_dicts[diag_data_set_id]
        or (target_object := perma_id_dicts[diag_data_set_id].get(perma_id)) is None
    ):
        return response_codes.default404(
            exception=f"An object with the requested permanent id '{perma_id}' is not found."
        )

    # Resolve the database containing the object
    odx_db = model_utils.database_id_dict[diag_data_set_id]
    if odx_db is None:
        return response_codes.default400(
            exception=f"No database object could be resolved for the requested diagnostic data set with id '{diag_data_set_id}'."
        )

    # Check if we have a matching odxtools type for the OpenAPI type
    if model_utils.openapi_odxtools_map[target_schema_cls] is None:
        return response_codes.default400(
            exception=f"No matching odxtools type for the given schema name '{schema_name}' could be found."
        )

    # Check if the target_object is of the matching odxtools type based on the resolved OpenAPI type
    if not isinstance(target_object, model_utils.openapi_odxtools_map[target_schema_cls]):
        return response_codes.default400(
            exception=f"The given permanent object id '{perma_id}' is of type {model_utils.type_with_weakref(target_object)} and therefore does not match to the given schema name {schema_name}."
        )

    # Translate odxtools object to OpenAPI model object
    structured_data = cast(
        OdxAny,
        translate_to_model(
            db_object=odx_db,
            target_model_cls=target_schema_cls,
            obj_to_translate=target_object,
            translate_properties=True,
        ),
    )

    return structured_data, 200, {"Content-Type": "application/json"}


def get_structured_data_by_ephemeral_id(
    schema_name: str, ephemeral_id: int
) -> tuple[OdxAny, int, dict[str, str]] | ConnexionResponse:
    """get_structured_data_by_ephemeral_id

    Structured data retrieval by providing the target schema name and the ephemeral-id to be retrieved.

    :param schema_name: Name of the schema to be retrieved
    :type schema_name: str
    :param ephemeral_id: The ephemeral ID of the object to fetch
    :type ephemeral_id: int

    :rtype: OdxAny
    """

    if (
        type(schema_name) is not str
        or schema_name is None
        or schema_name not in model_utils.openapi_schema_map
    ):
        return response_codes.default404(
            exception=f"The requested schema name '{schema_name}' is not found."
        )
    target_schema_cls = model_utils.openapi_schema_map[schema_name]

    if type(ephemeral_id) is not int:
        return response_codes.default400(
            exception=f"This endpoint only supports ephemeral object ids. The provided value '{ephemeral_id}' is not a valid ephemeral object id."
        )

    if ephemeral_id is None or ephemeral_id not in object_id_dict:
        return response_codes.default404(
            exception=f"An object with the requested ephemeral id '{ephemeral_id}' is not found."
        )

    # Resolve the ephemeral-id
    target_object = object_id_dict.get(ephemeral_id)

    # Resolve the database containing the object
    odx_db = model_utils.resolve_database_from_object(target_object)
    if odx_db is None:
        return response_codes.default400(
            exception=f"No database object could be resolved for the requested ephemeral id '{ephemeral_id}'."
        )

    # Check if we have a matching odxtools type for the OpenAPI type
    if model_utils.openapi_odxtools_map[target_schema_cls] is None:
        return response_codes.default400(
            exception=f"No matching odxtools type for the given schema name '{schema_name}' could be found."
        )

    # Check if the target_object is of the matching odxtools type based on the resolved OpenAPI type
    if not isinstance(target_object, model_utils.openapi_odxtools_map[target_schema_cls]):
        return response_codes.default400(
            exception=f"The given ephemeral id '{ephemeral_id}' is of type {model_utils.type_with_weakref(target_object)} and therefore does not match to the given schema name {schema_name}."
        )

    # Translate odxtools object to OpenAPI model object
    structured_data = cast(
        OdxAny,
        translate_to_model(
            db_object=odx_db,
            target_model_cls=target_schema_cls,
            obj_to_translate=target_object,
            translate_properties=True,
        ),
    )

    return structured_data, 200, {"Content-Type": "application/json"}


def get_state_charts(
    diag_data_set_id: str,
    variant_perma_id: str,
) -> tuple[StateChartCollection, int, dict[str, str]] | ConnexionResponse:
    """get_state_charts

    Returns the state charts from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: int
    :param body: The raw request body

    :rtype: StateChartCollection
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    variant = perma_id_dicts[diag_data_set_id][variant_perma_id]

    if not isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )

    items: list[StateChart] = []
    for state_chart in variant.state_charts:
        state_chart_info = cast(
            StateChart,
            translate_to_model(
                db_object=odx_db, target_model_cls=StateChart, obj_to_translate=state_chart
            ),
        )
        items.append(state_chart_info)

    return StateChartCollection(items=items), 200, {"Content-Type": "application/json"}


def get_all_state_charts_from_all_diagnostic_data_sets() -> (
    tuple[StateChartWithMetaDataCollection, int, dict[str, str]] | ConnexionResponse
):
    """get_all_state_charts

    Returns the collection of all state charts in all databases.

    :param body: The raw request body

    :rtype: StateChartCollection
    """
    diag_data_set_list: list[DiagnosticDataSetDescriptor] = []
    items: list[StateChartWithMetaData] = []

    # Use existing API method to get all diagnostic data sets objects directly in the target representation
    diag_data_set_collection = None
    result = get_diagnostic_data_collection_of_type("PDX")

    if result is not None and isinstance(result, tuple):
        diag_data_set_collection = result[0]

        for diag_set_api_obj in diag_data_set_collection.items:
            odx_db = model_utils.database_id_dict.get(diag_set_api_obj.perma_id)
            if not odx_db or not isinstance(odx_db, DatabaseWithID):
                continue

            # Collect the relations between dops and variants within each database
            sc_map: dict[str, StateChartWithMetaData] = {}

            diag_data_set_list.append(diag_set_api_obj)
            diag_data_set_ref = DiagnosticDataSetRef(
                diag_set_api_obj.perma_id, diag_set_api_obj.file_name
            )

            # Use existing API method to get all diagnostic variants provided within the DB object
            # directly in the target representation
            variants_collection = get_diagnostic_variants_of_diagnostic_data_set(
                diag_data_set_id=diag_set_api_obj.perma_id, filter_variants_by_perma_ids=[]
            )

            # Check if there is an error response when trying to retrieve the variants
            if isinstance(variants_collection, tuple):
                for variant_api_obj in variants_collection[0].items:
                    variant = perma_id_dicts[diag_set_api_obj.perma_id].get(
                        variant_api_obj.perma_id
                    )
                    if variant and isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
                        variant_ref = VariantObjectRef(
                            perma_id=variant_api_obj.perma_id,
                            short_name=variant.short_name,
                            variant_type=variant.variant_type.name,
                        )
                        for state_chart in variant.state_charts:
                            state_chart_perma_id = get_perma_id(state_chart)

                            if state_chart_perma_id is not None:
                                if state_chart_perma_id in sc_map:
                                    sc_map[
                                        state_chart_perma_id
                                    ].meta_data.referencing_variants.append(variant_ref)
                                else:
                                    origin_layer = state_chart_source_layer_dict[
                                        diag_set_api_obj.perma_id
                                    ][state_chart_perma_id]
                                    if origin_layer is None:
                                        return response_codes.default404(
                                            exception="The state charts origin layer was never set"
                                        )
                                    origin_layer_ref = VariantObjectRef(
                                        perma_id=get_perma_id(origin_layer),
                                        ephemeral_id=id(origin_layer),
                                        short_name=origin_layer.short_name,
                                        variant_type=origin_layer.variant_type.name,
                                    )
                                    meta_data = StateChartMetaData(
                                        state_chart_perma_id=get_perma_id(state_chart),
                                        state_chart_ephemeral_id=id(state_chart),
                                        origin_layer=origin_layer_ref,
                                        referencing_variants=[variant_ref],
                                        diagnostic_data_set_ref=diag_data_set_ref,
                                    )
                                    state_chart_with_meta_data = StateChartWithMetaData(
                                        state_chart=cast(
                                            StateChart,
                                            translate_to_model(
                                                db_object=odx_db,
                                                target_model_cls=StateChart,
                                                obj_to_translate=state_chart,
                                            ),
                                        ),
                                        meta_data=meta_data,
                                    )
                                    sc_map[state_chart_perma_id] = state_chart_with_meta_data
                items.extend(list(sc_map.values()))
            else:
                # Return the error response
                return variants_collection

    return (
        StateChartWithMetaDataCollection(items=items),
        200,
        {"Content-Type": "application/json"},
    )


def get_state_chart_by_perma_id(
    diag_data_set_id: str, variant_perma_id: str, state_chart_id: str
) -> tuple[StateChartWithMetaData, int, dict[str, str]] | ConnexionResponse:
    """get_state_chart_by_perma_id

    Returns a state chart from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param state_chart_id: ID of the state chart
    :type state_chart_id: str
    :param body: The raw request body

    :rtype: StateChart
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )
    diag_data_set = diag_data_set_id_dict[diag_data_set_id]

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    variant = perma_id_dicts[diag_data_set_id][variant_perma_id]

    if not isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant, OdxToolsEcuSharedData)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )

    assert isinstance(state_chart_id, str)
    req_chart = None
    for state_chart in variant.state_charts:
        if get_perma_id(state_chart) == state_chart_id:
            req_chart = state_chart
            break

    if req_chart is None:
        return response_codes.default404(
            exception=f"The given state chart id '{state_chart_id}' does not belong to a state chart."
        )

    transitions_diags = {
        get_perma_id(trans): StateTransitionWithDiagCommRefs(
            state_transition_ref=get_perma_id(trans), diag_comms=[]
        )
        for trans in req_chart.state_transitions
    }

    for diag_comm in variant.diag_comms:
        for transition in diag_comm.state_transitions:
            if transition in req_chart.state_transitions:
                diag_comm_ref = cast(
                    DiagCommRef,
                    translate_to_model(
                        db_object=odx_db, target_model_cls=DiagCommRef, obj_to_translate=diag_comm
                    ),
                )
                transitions_diags[get_perma_id(transition)].diag_comms.append(diag_comm_ref)

    req_chart_perma_id = get_perma_id(req_chart)
    origin_ref = None
    if (
        diag_data_set_id in state_chart_source_layer_dict
        and req_chart_perma_id is not None
        and req_chart_perma_id in state_chart_source_layer_dict[diag_data_set_id]
    ):
        origin_layer = state_chart_source_layer_dict[diag_data_set_id][req_chart_perma_id]
        if origin_layer is None:
            return response_codes.default404(
                exception="The state charts origin layer was never set"
            )

        origin_ref = VariantObjectRef(
            perma_id=get_perma_id(origin_layer),
            ephemeral_id=id(origin_layer),
            short_name=origin_layer.short_name,
            variant_type=origin_layer.variant_type.name,
        )

    variants_collection = get_diagnostic_variants_of_diagnostic_data_set(
        diag_data_set_id=diag_data_set_id, filter_variants_by_perma_ids=[]
    )
    variant_list: list[VariantObjectRef] = []
    if not isinstance(variants_collection, tuple):
        return variants_collection

    variant_ref = VariantObjectRef(
        perma_id=get_perma_id(variant),
        ephemeral_id=id(variant),
        short_name=variant.short_name,
        variant_type=variant.variant_type.name,
    )
    variant_list = [variant_ref]
    for db_variant_api_obj in variants_collection[0].items:
        if db_variant_api_obj.perma_id == variant_ref.perma_id:
            continue
        db_variant = perma_id_dicts[diag_data_set_id].get(db_variant_api_obj.perma_id)
        if db_variant and isinstance(db_variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
            if req_chart in db_variant.state_charts:
                variant_ref = VariantObjectRef(
                    perma_id=get_perma_id(db_variant),
                    ephemeral_id=id(db_variant),
                    short_name=db_variant.short_name,
                    variant_type=db_variant.variant_type.name,
                )
                variant_list.append(variant_ref)

    db_ref = DiagnosticDataSetRef(
        perma_id=diag_data_set.perma_id, file_name=diag_data_set.file_name
    )

    meta_data = StateChartMetaData(
        state_chart_perma_id=get_perma_id(req_chart),
        state_chart_ephemeral_id=id(req_chart),
        origin_layer=origin_ref,
        referencing_variants=variant_list,
        diagnostic_data_set_ref=db_ref,
    )

    state_chart_with_diag_refs = StateChartWithMetaData(
        state_chart=cast(
            StateChart,
            translate_to_model(
                db_object=odx_db, target_model_cls=StateChart, obj_to_translate=req_chart
            ),
        ),
        meta_data=meta_data,
        referencing_transitions=list(transitions_diags.values()),
    )

    return state_chart_with_diag_refs, 200, {"Content-Type": "application/json"}


def get_dops(
    diag_data_set_id: str, variant_perma_id: str, fields: list[str] | None
) -> tuple[DopCollection, int, dict[str, str]] | ConnexionResponse:
    """get_dops

    Returns the data object properties from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id is always returned for any object.
    :type fields: List[str]

    :rtype: DopCollection
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    variant = perma_id_dicts[diag_data_set_id][variant_perma_id]

    if not isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )

    items: list[DopWithOriginLayerInfo] = []
    for dop in variant.diag_data_dictionary_spec.all_data_object_properties:
        dop_perma_id = get_perma_id(dop)
        if dop_perma_id is None:
            continue

        dop_info = cast(
            DopBase,
            translate_to_model(
                db_object=odx_db,
                target_model_cls=DopBase,
                obj_to_translate=dop,
                filter_fields=fields,
            ),
        )

        # Add original layer info
        dop_layer_obj = DopWithOriginLayerInfo()
        dop_layer_obj.dop = dop_info
        origin_layer = dop_source_layer_dict[diag_data_set_id].get(dop_perma_id)
        if origin_layer is not None:
            dop_layer_obj.origin_layer_perma_id = get_perma_id(origin_layer) or ""
            dop_layer_obj.origin_layer_ephemeral_id = id(origin_layer)
            dop_layer_obj.origin_layer_short_name = origin_layer.short_name
            dop_layer_obj.origin_layer_type = origin_layer.variant_type.value

        items.append(dop_layer_obj)

    return DopCollection(items=items), 200, {"Content-Type": "application/json"}


def get_dop_by_perma_id(
    diag_data_set_id: str, variant_perma_id: str, dop_perma_id: str
) -> tuple[DopWithOriginLayerInfo, int, dict[str, str]] | ConnexionResponse:
    """get_dop_by_perma_id

    Returns a data object property from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param dop_perma_id: ID of the diagnostic object property to fetch
    :type dop_perma_id: str

    :rtype: DopWithOriginLayerInfo
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    assert isinstance(dop_perma_id, str)
    if dop_perma_id is None or dop_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"DOP with permanent object id '{dop_perma_id}' not found"
        )

    dop = perma_id_dicts[diag_data_set_id].get(dop_perma_id)

    if not isinstance(dop, OdxToolsDopBase):
        return response_codes.default400(
            exception=f"The given permanent object id '{dop_perma_id}' does not belong to a DOP object."
        )

    # Translate data to OpenAPI model
    dop_info = cast(
        DopBase,
        translate_to_model(
            db_object=odx_db,
            target_model_cls=DopBase,
            obj_to_translate=dop,
            translate_properties=True,
        ),
    )

    # Add original layer info
    dop_layer_obj = DopWithOriginLayerInfo()
    dop_layer_obj.dop = dop_info
    origin_layer = dop_source_layer_dict[diag_data_set_id].get(dop_perma_id)
    if origin_layer is not None:
        dop_layer_obj.origin_layer_perma_id = get_perma_id(origin_layer) or ""
        dop_layer_obj.origin_layer_ephemeral_id = id(origin_layer)
        dop_layer_obj.origin_layer_short_name = origin_layer.short_name
        dop_layer_obj.origin_layer_type = origin_layer.variant_type.value

    return dop_layer_obj, 200, {"Content-Type": "application/json"}


def get_all_dops_from_all_diagnostic_data_sets(
    fields: list[str] | None,
) -> tuple[DopsOfVariantsOfDataSetsCollection, int, dict[str, str]] | ConnexionResponse:
    """get_all_dops_from_all_databases

    Returns all data object properties from all existing BASE-VARIANT or ECU-VARIANT objects in all databases.

    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id is always returned for any object.
    :type fields: List[str]

    :rtype: DopsOfVariantsOfDataSetsCollection
    """
    diag_data_set_list: list[DiagnosticDataSetDescriptor] = []
    variants_list: list[DiagnosticVariant] = []
    dop_list: list[DopWithDataSetsVariantRefs] = []

    # Use existing API method to get all diagnostic data sets objects directly in the target representation
    diag_data_set_collection = None
    result = get_diagnostic_data_collection_of_type("PDX")

    if result is not None and isinstance(result, tuple):
        diag_data_set_collection = result[0]

        for diag_set_api_obj in diag_data_set_collection.items:
            # Collect the relations between dops and variants within each database
            dop_map: dict[str, DopWithDataSetsVariantRefs] = {}

            diag_data_set_list.append(diag_set_api_obj)

            odx_db = model_utils.database_id_dict.get(diag_set_api_obj.perma_id)
            if not odx_db or not isinstance(odx_db, DatabaseWithID):
                continue

            # Use existing API method to get all diagnostic variants provided within the DB object
            # directly in the target representation
            variants_collection = get_diagnostic_variants_of_diagnostic_data_set(
                diag_data_set_id=diag_set_api_obj.perma_id, filter_variants_by_perma_ids=[]
            )

            # Check if there is an error response when trying to retrieve the variants
            if isinstance(variants_collection, tuple):
                for variant_api_obj in variants_collection[0].items:
                    variants_list.append(variant_api_obj)

                    # Resolve detailed variant object via perma_id to get dops
                    variant = perma_id_dicts[diag_set_api_obj.perma_id].get(
                        variant_api_obj.perma_id
                    )
                    if variant and isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
                        for dop in variant.diag_data_dictionary_spec.all_data_object_properties:
                            dop_id = get_perma_id(dop)
                            if dop_id is None:
                                continue

                            if dop_id in dop_map:
                                # Add the current variant to the reference list of the already processed dop
                                dop_map[dop_id].referencing_variant_perma_ids.append(
                                    variant_api_obj.perma_id
                                )
                            else:
                                dop_api_obj: DopBase = cast(
                                    DopBase,
                                    translate_to_model(
                                        db_object=odx_db,
                                        target_model_cls=DopBase,
                                        obj_to_translate=dop,
                                        filter_fields=fields,
                                    ),
                                )

                                # Add original layer info
                                dop_layer_obj = DopWithOriginLayerInfo()
                                dop_layer_obj.dop = dop_api_obj
                                origin_layer = dop_source_layer_dict[diag_set_api_obj.perma_id].get(
                                    dop_id
                                )
                                if origin_layer is not None:
                                    dop_layer_obj.origin_layer_perma_id = (
                                        get_perma_id(origin_layer) or ""
                                    )
                                    dop_layer_obj.origin_layer_ephemeral_id = id(origin_layer)
                                    dop_layer_obj.origin_layer_short_name = origin_layer.short_name
                                    dop_layer_obj.origin_layer_type = (
                                        origin_layer.variant_type.value
                                    )

                                # Wrap the resulting object with the references to DB and variant (DopWithDataSetsVariantRefs) and add it to the dop_map
                                dop_map[dop_id] = DopWithDataSetsVariantRefs(
                                    diagnostic_data_set_id=diag_set_api_obj.perma_id,
                                    referencing_variant_perma_ids=[variant_api_obj.perma_id],
                                    dop=dop_layer_obj,
                                )
            else:
                # Return the error response
                return variants_collection

            # Add all collected individual dops to the result list
            dop_list.extend(list(dop_map.values()))

    return (
        DopsOfVariantsOfDataSetsCollection(
            diagnostic_data_sets=diag_data_set_list, variants=variants_list, dops=dop_list
        ),
        200,
        {"Content-Type": "application/json"},
    )


def get_dtcs(
    diag_data_set_id: str, variant_perma_id: str, fields: list[str] | None
) -> tuple[DtcCollection, int, dict[str, str]] | ConnexionResponse:
    """get_dtcs

    Returns the diagnostic trouble codes from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id is always returned for any object.
    :type fields: List[str]

    :rtype: DtcCollection
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    variant = perma_id_dicts[diag_data_set_id][variant_perma_id]

    if not isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
        return response_codes.default400(
            exception=f"The given permanent object id '{variant_perma_id}' does not belong to a diagnostic variant object."
        )

    items: list[DtcWithDopInfo] = []
    for dtc_dop in variant.diag_data_dictionary_spec.dtc_dops:
        dtc_dop_perma_id = get_perma_id(dtc_dop)
        if dtc_dop_perma_id is None:
            continue

        if dtc_dop.dtcs is not None:
            for dtc in dtc_dop.dtcs:
                dtc_info = cast(
                    DtcWithDopInfo,
                    translate_to_model(
                        db_object=odx_db,
                        target_model_cls=DtcWithDopInfo,
                        obj_to_translate=dtc,
                        filter_fields=fields,
                    ),
                )

                # Add source dtc dop reference
                dtc_info.origin_dtc_dop_perma_id = dtc_dop_perma_id
                dtc_info.origin_dtc_dop_ephemeral_id = id(dtc_dop)
                dtc_info.origin_dtc_dop_short_name = dtc_dop.short_name

                # Add original layer info
                origin_layer = dop_source_layer_dict[diag_data_set_id].get(dtc_dop_perma_id)
                if origin_layer is not None:
                    dtc_info.origin_layer_perma_id = get_perma_id(origin_layer) or ""
                    dtc_info.origin_layer_ephemeral_id = id(origin_layer)
                    dtc_info.origin_layer_short_name = origin_layer.short_name
                    dtc_info.origin_layer_type = origin_layer.variant_type.value

                items.append(dtc_info)

    return DtcCollection(items=items), 200, {"Content-Type": "application/json"}


def get_dtc_by_perma_id(
    diag_data_set_id: str, variant_perma_id: str, dtc_perma_id: str
) -> tuple[DtcWithDopInfo, int, dict[str, str]] | ConnexionResponse:
    """get_dtc_by_perma_id

    Returns a diagnostic trouble code from the given BASE-VARIANT or ECU-VARIANT object.

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param dtc_perma_id: ID of the diagnostic trouble code to fetch
    :type dtc_perma_id: str

    :rtype: DtcWithDopInfo
    """

    if diag_data_set_id not in perma_id_dicts:
        return response_codes.default404(
            exception=f"A diagnostic data set with the given id '{diag_data_set_id}' is not found."
        )
    odx_db = model_utils.database_id_dict.get(diag_data_set_id)
    if not odx_db or not isinstance(odx_db, DatabaseWithID):
        return response_codes.default404(
            exception=f"A database object for diagnostic data set with id '{diag_data_set_id}' was not found."
        )

    assert isinstance(variant_perma_id, str)
    if variant_perma_id is None or variant_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"Variant with permanent object id '{variant_perma_id}' not found"
        )

    assert isinstance(dtc_perma_id, str)
    if dtc_perma_id is None or dtc_perma_id not in perma_id_dicts[diag_data_set_id]:
        return response_codes.default404(
            exception=f"DTC with permanent object id '{dtc_perma_id}' not found"
        )

    dtc = perma_id_dicts[diag_data_set_id].get(dtc_perma_id)

    if not isinstance(dtc, OdxToolsDiagnosticTroubleCode):
        return response_codes.default400(
            exception=f"The given permanent object id '{dtc_perma_id}' does not belong to a DiagnosticTroubleCode object."
        )

    # Translate data to OpenAPI model
    dtc_info = cast(
        DtcWithDopInfo,
        translate_to_model(
            db_object=odx_db,
            target_model_cls=DtcWithDopInfo,
            obj_to_translate=dtc,
        ),
    )

    # Add source dtc dop reference
    origin_dtc_dop_id = dtc_source_dop_dict[diag_data_set_id].get(dtc_perma_id)
    if origin_dtc_dop_id is not None:
        origin_dtc_dop = perma_id_dicts[diag_data_set_id].get(origin_dtc_dop_id)
        if origin_dtc_dop is not None:
            dtc_info.origin_dtc_dop_perma_id = origin_dtc_dop_id
            dtc_info.origin_dtc_dop_ephemeral_id = id(origin_dtc_dop)
            dtc_info.origin_dtc_dop_short_name = origin_dtc_dop.short_name

            # Add original layer info
            origin_layer = dop_source_layer_dict[diag_data_set_id].get(origin_dtc_dop_id)
            if origin_layer is not None:
                dtc_info.origin_layer_perma_id = get_perma_id(origin_layer) or ""
                dtc_info.origin_layer_ephemeral_id = id(origin_layer)
                dtc_info.origin_layer_short_name = origin_layer.short_name
                dtc_info.origin_layer_type = origin_layer.variant_type.value

    return dtc_info, 200, {"Content-Type": "application/json"}


def get_all_dtcs_from_all_diagnostic_data_sets(
    fields: list[str] | None,
) -> tuple[DtcsOfVariantsOfDataSetsCollection, int, dict[str, str]] | ConnexionResponse:
    """get_all_dtcs_from_all_diagnostic_data_sets

    Returns all diagnostic trouble codes from all existing BASE-VARIANT or ECU-VARIANT objects in all databases.

    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id is always returned for any object.
    :type fields: List[str]

    :rtype: DtcsOfVariantsOfDataSetsCollection
    """
    diag_data_set_list: list[DiagnosticDataSetDescriptor] = []
    variants_list: list[DiagnosticVariant] = []
    dtc_list: list[DtcWithDataSetsVariantRefs] = []

    # Use existing API method to get all diagnostic data sets objects directly in the target representation
    diag_data_set_collection = None
    result = get_diagnostic_data_collection_of_type("PDX")

    if result is not None and isinstance(result, tuple):
        diag_data_set_collection = result[0]

        for diag_set_api_obj in diag_data_set_collection.items:
            # Collect the relations between dtcs and variants within each data set
            dtc_map: dict[str, DtcWithDataSetsVariantRefs] = {}

            diag_data_set_list.append(diag_set_api_obj)

            odx_db = model_utils.database_id_dict.get(diag_set_api_obj.perma_id)
            if not odx_db or not isinstance(odx_db, DatabaseWithID):
                continue

            # Use existing API method to get all diagnostic variants provided within the DB object
            # directly in the target representation
            variants_collection = get_diagnostic_variants_of_diagnostic_data_set(
                diag_data_set_id=diag_set_api_obj.perma_id, filter_variants_by_perma_ids=[]
            )

            # Check if there is an error response when trying to retrieve the variants
            if isinstance(variants_collection, tuple):
                for variant_api_obj in variants_collection[0].items:
                    variants_list.append(variant_api_obj)

                    # Resolve detailed variant object via perma_id to get dtcs
                    variant = perma_id_dicts[diag_set_api_obj.perma_id].get(
                        variant_api_obj.perma_id
                    )
                    if variant and isinstance(variant, (OdxToolsEcuVariant, OdxToolsBaseVariant)):
                        for dtc_dop in variant.diag_data_dictionary_spec.dtc_dops:
                            dtc_dop_perma_id = get_perma_id(dtc_dop)
                            if dtc_dop_perma_id is None:
                                continue
                            if dtc_dop.dtcs is not None:
                                for dtc in dtc_dop.dtcs:
                                    dtc_perma_id = get_perma_id(dtc)
                                    if dtc_perma_id is None:
                                        continue

                                    if dtc_perma_id in dtc_map:
                                        # Add the current variant to the reference list of the already processed dop
                                        dtc_map[dtc_perma_id].referencing_variant_perma_ids.append(
                                            variant_api_obj.perma_id
                                        )
                                    else:
                                        dtc_api_obj: DtcWithDopInfo = cast(
                                            DtcWithDopInfo,
                                            translate_to_model(
                                                db_object=odx_db,
                                                target_model_cls=DtcWithDopInfo,
                                                obj_to_translate=dtc,
                                                filter_fields=fields,
                                            ),
                                        )

                                        # Add source dtc dop reference
                                        dtc_api_obj.origin_dtc_dop_perma_id = dtc_dop_perma_id
                                        dtc_api_obj.origin_dtc_dop_ephemeral_id = id(dtc_dop)
                                        dtc_api_obj.origin_dtc_dop_short_name = dtc_dop.short_name

                                        # Add original layer info
                                        origin_layer = dop_source_layer_dict[
                                            diag_set_api_obj.perma_id
                                        ].get(dtc_dop_perma_id)
                                        if origin_layer is not None:
                                            dtc_api_obj.origin_layer_perma_id = (
                                                get_perma_id(origin_layer) or ""
                                            )
                                            dtc_api_obj.origin_layer_ephemeral_id = id(origin_layer)
                                            dtc_api_obj.origin_layer_short_name = (
                                                origin_layer.short_name
                                            )
                                            dtc_api_obj.origin_layer_type = (
                                                origin_layer.variant_type.value
                                            )

                                        # Wrap the resulting object with the references to data set and variant (DtcWithDataSetVariantRefs) and add it to the dtc_map
                                        dtc_map[dtc_perma_id] = DtcWithDataSetsVariantRefs(
                                            diagnostic_data_set_id=diag_set_api_obj.perma_id,
                                            referencing_variant_perma_ids=[
                                                variant_api_obj.perma_id
                                            ],
                                            dtc=dtc_api_obj,
                                        )
            else:
                # Return the error response
                return variants_collection

            # Add all collected individual dops to the result list
            dtc_list.extend(list(dtc_map.values()))

    return (
        DtcsOfVariantsOfDataSetsCollection(
            diagnostic_data_sets=diag_data_set_list, variants=variants_list, dtcs=dtc_list
        ),
        200,
        {"Content-Type": "application/json"},
    )
