# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests the generic retrieval of objects and their metadata from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response

# ####################################################################################################################################
# Test cases for ephemeral-ID endpoints
# ####################################################################################################################################


def test_get_object_by_ephemeral_id_diag_service(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_assiduous_perma_id = get_somersault_perma_id(
        "somersault_assiduous", "somersault_assiduous"
    )
    assert somersault_assiduous_perma_id is not None

    diag_comm_headstand_perma_id = get_somersault_perma_id(
        "somersault_assiduous.service.headstand", "somersault_assiduous"
    )
    assert diag_comm_headstand_perma_id is not None

    # Get DiagComm "headstand" from "somersault_assiduous" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_assiduous_perma_id}/diag-comms/{diag_comm_headstand_perma_id}"
    )
    response_diag_service = json_dict_from_response(response)
    assert response.status_code == 200
    assert "ephemeral_id" in response_diag_service
    diag_comm_headstand_ephemeral_id = response_diag_service["ephemeral_id"]

    # Get DiagService "headstand" of "somersault_assiduous" variant using GET /objects/{ephemeral-id}
    response = diag_client.get(f"/v1/objects/{diag_comm_headstand_ephemeral_id}")
    assert response.status_code == 200
    diag_schema["/objects/{ephemeral-id}"]["GET"].validate_response(response)
    diag_comm = json_dict_from_response(response)

    # Specific checks for "headstand" DiagService
    assert "short_name" in diag_comm
    assert diag_comm["short_name"] == "headstand"
    assert "diagnostic_class" in diag_comm
    assert "semantic" in diag_comm
    assert "state_transition_refs" in diag_comm
    assert "pre_condition_state_refs" in diag_comm
    assert "related_diag_comm_refs" in diag_comm
    assert "protocol_snrefs" in diag_comm
    assert "audience" in diag_comm
    assert "functional_class_refs" in diag_comm
    assert "sdgs" in diag_comm
    assert "description" in diag_comm


def test_get_object_by_ephemeral_id_dop(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_base_variant" and the "uint8_scale_linear_multiple" DOP
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None
    uint8_scale_linear_multiple_perma_id = get_somersault_perma_id(
        "somersault.DOP.uint8_scale_linear_multiple", "somersault_base_variant"
    )
    assert uint8_scale_linear_multiple_perma_id is not None

    # Get DOP "uint8_scale_linear_multiple" from "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops/{dop-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dops/{uint8_scale_linear_multiple_perma_id}"
    )
    response_dop = json_dict_from_response(response)
    assert response.status_code == 200
    assert "dop" in response_dop
    response_dop = response_dop["dop"]
    assert "ephemeral_id" in response_dop
    uint8_scale_linear_multiple_ephemeral_id = response_dop["ephemeral_id"]

    # Get DOP "uint8_scale_linear_multiple" of "somersault_base_variant" variant using GET /objects/{ephemeral-id}
    response = diag_client.get(f"/v1/objects/{uint8_scale_linear_multiple_ephemeral_id}")
    assert response.status_code == 200
    diag_schema["/objects/{ephemeral-id}"]["GET"].validate_response(response)
    dop = json_dict_from_response(response)

    # Specific checks for "uint8_scale_linear_multiple" DOP
    assert "short_name" in dop
    assert dop["short_name"] == "uint8_scale_linear_multiple"
    assert "diag_coded_type" in dop
    assert "physical_type" in dop
    assert "compu_method" in dop


def test_get_metadata_via_ephemeral_id_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Get the ephemeral ID of the "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}"
    )
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "ephemeral_id" in response_json
    somersault_base_variant_ephemeral_id = response_json["ephemeral_id"]

    # Resolve metadata of a variant object using GET /metadata/{ephemeral-id}
    response = diag_client.get(f"/v1/metadata/{somersault_base_variant_ephemeral_id}")
    assert response.status_code == 200

    diag_schema["/metadata/{ephemeral-id}"]["GET"].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "odx_model_version" in response_obj
    assert response_obj["odx_model_version"] == "2.2.0"
    assert "short_name" in response_obj
    assert response_obj["short_name"] == "somersault_base_variant"
    assert "long_name" in response_obj
    assert response_obj["long_name"] == "Somersault base variant"
    assert "odx_id" in response_obj
    assert response_obj["odx_id"] == "somersault.base_variant"
    assert "revision" not in response_obj
    assert "revision_ephemeral_id" not in response_obj
    assert "description" in response_obj
    assert response_obj["description"] == "<p>Base variant of the somersault ECU &amp; cetera</p>"
    assert "class_name" in response_obj
    assert response_obj["class_name"] == "BaseVariant"


def test_get_metadata_via_ephemeral_id_dataset(diag_schema, diag_client, upload_pdx_data) -> None:
    # Read all diagnostic data sets using GET /diagnostic-data-sets/PDX and extract ephemeral_id from the first item
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 1
    assert "ephemeral_id" in response_collection["items"][0]

    # Extract diagnostic data set ephemeral_id
    diag_data_set_ephemeral_id = response_collection["items"][0]["ephemeral_id"]

    # Resolve metadata of a diagnostic data set object using GET /metadata/{ephemeral-id}
    response = diag_client.get(f"/v1/metadata/{diag_data_set_ephemeral_id}")
    assert response.status_code == 200

    diag_schema["/metadata/{ephemeral-id}"]["GET"].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "odx_model_version" in response_obj
    assert response_obj["odx_model_version"] == "2.2.0"
    assert "short_name" in response_obj
    assert response_obj["short_name"] == "somersault_database"
    assert "long_name" not in response_obj
    assert "odx_id" not in response_obj
    assert "revision" not in response_obj
    assert "revision_ephemeral_id" not in response_obj
    assert "description" not in response_obj
    assert "class_name" in response_obj
    assert response_obj["class_name"] == "DatabaseWithID"

    # Resolve metadata of a main diagnostic layer object using GET /metadata/{ephemeral-id}?resolve_main_diag_layer=true
    response = diag_client.get(
        f"/v1/metadata/{diag_data_set_ephemeral_id}?resolve_main_diag_layer=true"
    )
    assert response.status_code == 200

    diag_schema["/metadata/{ephemeral-id}"]["GET"].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "odx_model_version" in response_obj
    assert response_obj["odx_model_version"] == "2.2.0"
    assert "short_name" in response_obj
    assert response_obj["short_name"] == "somersault"
    assert "long_name" in response_obj
    assert response_obj["long_name"] == "Collect all saults in the summer"
    assert "odx_id" not in response_obj
    assert "revision" in response_obj
    assert response_obj["revision"] == "1.0.3.2.1.5.6"
    assert "revision_ephemeral_id" in response_obj
    assert "description" in response_obj
    assert (
        response_obj["description"] == "<p>This contains ECUs which do somersaults &amp; cetera</p>"
    )
    assert "class_name" in response_obj
    assert response_obj["class_name"] == "DiagLayerContainer"


# ####################################################################################################################################
# Test cases for perma-ID endpoints
# ####################################################################################################################################


def test_get_object_by_perma_id_diag_service(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    diag_comm_headstand_perma_id = get_somersault_perma_id(
        "somersault_assiduous.service.headstand", "somersault_assiduous"
    )
    assert diag_comm_headstand_perma_id is not None

    # Get DiagService "headstand" of "somersault_assiduous" variant using GET /diagnostic-data-sets/{diag-data-set-id}/objects/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/objects/{diag_comm_headstand_perma_id}"
    )
    assert response.status_code == 200
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/objects/{perma-id}"][
        "GET"
    ].validate_response(response)
    diag_comm = json_dict_from_response(response)

    # Specific checks for "headstand" DiagService
    assert "short_name" in diag_comm
    assert diag_comm["short_name"] == "headstand"
    assert "diagnostic_class" in diag_comm
    assert "semantic" in diag_comm
    assert "state_transition_refs" in diag_comm
    assert "pre_condition_state_refs" in diag_comm
    assert "related_diag_comm_refs" in diag_comm
    assert "protocol_snrefs" in diag_comm
    assert "audience" in diag_comm
    assert "functional_class_refs" in diag_comm
    assert "sdgs" in diag_comm
    assert "description" in diag_comm


def test_get_object_by_perma_id_dop(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_ID to identify the "uint8_scale_linear_multiple" DOP
    uint8_scale_linear_multiple_perma_id = get_somersault_perma_id(
        "somersault.DOP.uint8_scale_linear_multiple", "somersault_base_variant"
    )
    assert uint8_scale_linear_multiple_perma_id is not None

    # Get DOP "uint8_scale_linear_multiple" of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/objects/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/objects/{uint8_scale_linear_multiple_perma_id}"
    )
    assert response.status_code == 200
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/objects/{perma-id}"][
        "GET"
    ].validate_response(response)
    dop = json_dict_from_response(response)

    # Specific checks for "uint8_scale_linear_multiple" DOP
    assert "short_name" in dop
    assert dop["short_name"] == "uint8_scale_linear_multiple"
    assert "diag_coded_type" in dop
    assert "physical_type" in dop
    assert "compu_method" in dop


def test_get_metadata_via_perma_id_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Resolve metadata of a variant object using GET /diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/metadata/{somersault_base_variant_perma_id}"
    )
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}"][
        "GET"
    ].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "odx_model_version" in response_obj
    assert response_obj["odx_model_version"] == "2.2.0"
    assert "short_name" in response_obj
    assert response_obj["short_name"] == "somersault_base_variant"
    assert "long_name" in response_obj
    assert response_obj["long_name"] == "Somersault base variant"
    assert "odx_id" in response_obj
    assert response_obj["odx_id"] == "somersault.base_variant"
    assert "revision" not in response_obj
    assert "revision_ephemeral_id" not in response_obj
    assert "description" in response_obj
    assert response_obj["description"] == "<p>Base variant of the somersault ECU &amp; cetera</p>"
    assert "class_name" in response_obj
    assert response_obj["class_name"] == "BaseVariant"


def test_get_metadata_via_perma_id_dataset(diag_schema, diag_client, upload_pdx_data) -> None:
    # Read all diagnostic data sets using GET /diagnostic-data-sets/PDX and extract perma_ID from the first item
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 1
    assert "perma_id" in response_collection["items"][0]

    # Extract diagnostic data set perma_id
    diag_data_set_perma_id = response_collection["items"][0]["perma_id"]

    # Resolve metadata of a diagnostic data set object using GET /diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{diag_data_set_perma_id}/metadata/{diag_data_set_perma_id}"
    )
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}"][
        "GET"
    ].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "odx_model_version" in response_obj
    assert response_obj["odx_model_version"] == "2.2.0"
    assert "short_name" in response_obj
    assert response_obj["short_name"] == "somersault_database"
    assert "long_name" not in response_obj
    assert "odx_id" not in response_obj
    assert "revision" not in response_obj
    assert "revision_ephemeral_id" not in response_obj
    assert "description" not in response_obj
    assert "class_name" in response_obj
    assert response_obj["class_name"] == "DatabaseWithID"

    # Resolve metadata of a main diagnostic layer object using GET /metadata/{ephemeral-id}?resolve_main_diag_layer=true
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{diag_data_set_perma_id}/metadata/{diag_data_set_perma_id}?resolve_main_diag_layer=true"
    )
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}"][
        "GET"
    ].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "odx_model_version" in response_obj
    assert response_obj["odx_model_version"] == "2.2.0"
    assert "short_name" in response_obj
    assert response_obj["short_name"] == "somersault"
    assert "long_name" in response_obj
    assert response_obj["long_name"] == "Collect all saults in the summer"
    assert "odx_id" not in response_obj
    assert "revision" in response_obj
    assert response_obj["revision"] == "1.0.3.2.1.5.6"
    assert "revision_ephemeral_id" in response_obj
    assert "description" in response_obj
    assert (
        response_obj["description"] == "<p>This contains ECUs which do somersaults &amp; cetera</p>"
    )
    assert "class_name" in response_obj
    assert response_obj["class_name"] == "DiagLayerContainer"
