# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests different aspects regarding the exploration of Diagnostic Communication (DiagComm) objects from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_get_all_diag_comms(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DiagComms using GET /diag-comms
    response = diag_client.get("/v1/diag-comms")
    assert response.status_code == 200

    diag_schema["/diag-comms"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "diag_comms" in response_collection
    assert len(response_collection["diag_comms"]) == 10
    for diag_comm_with_refs in response_collection["diag_comms"]:
        assert "referencing_variant_perma_ids" in diag_comm_with_refs
        assert len(diag_comm_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in diag_comm_with_refs
        assert "diagComm" in diag_comm_with_refs
        diag_comm = diag_comm_with_refs.get("diagComm")
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm
        assert "short_name" in diag_comm
        assert "perma_id" in diag_comm
        assert "ephemeral_id" in diag_comm
        assert "functional_class_refs" in diag_comm


def test_get_all_diag_comms_with_filter(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DiagComms but only containing selected fields using GET /diag-comms?fields=...
    response = diag_client.get("/v1/diag-comms?fields=short_name,perma_id")
    assert response.status_code == 200

    diag_schema["/diag-comms"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert "diag_comms" in response_collection
    assert len(response_collection["diag_comms"]) == 10
    for diag_comm_with_refs in response_collection["diag_comms"]:
        assert "referencing_variant_perma_ids" in diag_comm_with_refs
        assert len(diag_comm_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in diag_comm_with_refs
        assert diag_comm_with_refs["diagnostic_data_set_id"] is not None

        assert "diagComm" in diag_comm_with_refs
        diag_comm = diag_comm_with_refs["diagComm"]
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm
        assert "short_name" in diag_comm
        assert "perma_id" in diag_comm
        assert "ephemeral_id" in diag_comm
        assert "functional_class_refs" not in diag_comm


def test_get_all_diag_comms_with_wrong_filter(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DiagComms with wrong fields filter using GET /diag-comms?fields=test
    response = diag_client.get("/v1/diag-comms?fields=test")
    assert response.status_code == 200

    diag_schema["/diag-comms"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert "diag_comms" in response_collection
    assert len(response_collection["diag_comms"]) == 10
    for diag_comm_with_refs in response_collection["diag_comms"]:
        assert "referencing_variant_perma_ids" in diag_comm_with_refs
        assert len(diag_comm_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in diag_comm_with_refs
        assert diag_comm_with_refs["diagnostic_data_set_id"] is not None

        assert "diagComm" in diag_comm_with_refs
        diag_comm = diag_comm_with_refs["diagComm"]

        # All non filterable fields shall be present
        assert "perma_id" in diag_comm
        assert "ephemeral_id" in diag_comm
        assert "class_name" in diag_comm
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm

        # All additional fields shall not be present
        assert "short_name" not in diag_comm
        assert "diagnostic_class" not in diag_comm
        assert "semantic" not in diag_comm
        assert "state_transition_refs" not in diag_comm
        assert "pre_condition_state_refs" not in diag_comm
        assert "related_diag_comm_refs" not in diag_comm
        assert "protocol_snrefs" not in diag_comm
        assert "audience" not in diag_comm
        assert "functional_class_refs" not in diag_comm
        assert "sdgs" not in diag_comm
        assert "description" not in diag_comm


def test_get_diag_comms_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Get diagnostic data set using GET /diagnostic-data-sets/PDX
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    assert response.status_code == 200

    response_collection = json_dict_from_response(response)
    diag_schema["/diagnostic-data-sets/{data-type}"]["GET"].validate_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 1
    assert "perma_id" in response_collection["items"][0]

    # Extract data set perma_id
    data_set_id = response_collection["items"][0]["perma_id"]

    # Read all diagnostic variants of data set using GET /diagnostic-data-sets/{data-type}/variants
    response = diag_client.get(f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants")
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants"]["GET"].validate_response(
        response
    )
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 3

    # Extract the short_name and id of each variant
    variant_map: dict[str, str] = {}
    for variant in response_collection["items"]:
        variant_map[variant["short_name"]] = variant["perma_id"]

    somersault_base_variant_id = variant_map["somersault_base_variant"]
    somersault_lazy_variant_id = variant_map["somersault_lazy"]
    somersault_assiduous_variant_id = variant_map["somersault_assiduous"]

    # Test if perma-id for "somersault_lazy" variant matches or not
    assert somersault_lazy_variant_id == "0975d777c7a38ec4816683ef37eb8c43"

    somersault_base_variant_endpoint = (
        f"/v1/diagnostic-data-sets/{data_set_id}/variants/{somersault_base_variant_id}"
    )
    somersault_lazy_variant_endpoint = (
        f"/v1/diagnostic-data-sets/{data_set_id}/variants/{somersault_lazy_variant_id}"
    )
    somersault_assiduous_variant_endpoint = (
        f"/v1/diagnostic-data-sets/{data_set_id}/variants/{somersault_assiduous_variant_id}"
    )

    # Get "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_base_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_base_variant_id
    assert response_json["short_name"] == "somersault_base_variant"

    # Get DiagComms of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms
    response = diag_client.get(f"{somersault_base_variant_endpoint}/diag-comms")
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 9
    for diag_comm in response_collection["items"]:
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm
        assert diag_comm["origin_layer_perma_id"] == somersault_base_variant_id
        assert diag_comm["origin_layer_short_name"] == "somersault_base_variant"
        assert diag_comm["origin_layer_type"] == "BASE-VARIANT"

    # Get "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_lazy_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_lazy_variant_id
    assert response_json["short_name"] == "somersault_lazy"

    # Get DiagComms of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms
    response = diag_client.get(f"{somersault_lazy_variant_endpoint}/diag-comms")
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 7
    for diag_comm in response_collection["items"]:
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm
        assert diag_comm["origin_layer_perma_id"] == somersault_base_variant_id
        assert diag_comm["origin_layer_short_name"] == "somersault_base_variant"
        assert diag_comm["origin_layer_type"] == "BASE-VARIANT"

    # Get "somersault_assiduous" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_assiduous_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_assiduous_variant_id
    assert response_json["short_name"] == "somersault_assiduous"

    # Get DiagComms of "somersault_assiduous" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms
    response = diag_client.get(f"{somersault_assiduous_variant_endpoint}/diag-comms")
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 10
    for diag_comm in response_collection["items"]:
        assert "short_name" in diag_comm
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm

        if diag_comm["short_name"] == "headstand":
            assert diag_comm["origin_layer_perma_id"] == somersault_assiduous_variant_id
            assert diag_comm["origin_layer_short_name"] == "somersault_assiduous"
            assert diag_comm["origin_layer_type"] == "ECU-VARIANT"
        else:
            assert diag_comm["origin_layer_perma_id"] == somersault_base_variant_id
            assert diag_comm["origin_layer_short_name"] == "somersault_base_variant"
            assert diag_comm["origin_layer_type"] == "BASE-VARIANT"


def test_get_diag_comms_of_variant_with_filter(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Get all DiagComms of variant but only containing selected fields using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms?fields=...
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/diag-comms?fields=short_name,perma_id"
    )
    assert response.status_code == 200

    diag_schema["/diag-comms"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 9
    for diag_comm in response_collection["items"]:
        assert "origin_layer_perma_id" in diag_comm
        assert "origin_layer_ephemeral_id" in diag_comm
        assert "origin_layer_short_name" in diag_comm
        assert "origin_layer_type" in diag_comm
        assert diag_comm["origin_layer_perma_id"] == somersault_base_variant_perma_id
        assert diag_comm["origin_layer_short_name"] == "somersault_base_variant"
        assert diag_comm["origin_layer_type"] == "BASE-VARIANT"
        assert "short_name" in diag_comm
        assert "perma_id" in diag_comm
        assert "functional_class_refs" not in diag_comm


def test_get_single_diag_comm_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_lazy" and base variant as well as the "report_status" diagComm
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    somersault_lazy_variant_perma_id = get_somersault_perma_id("somersault_lazy", "somersault_lazy")
    assert somersault_lazy_variant_perma_id is not None

    diag_comm_report_status_perma_id = get_somersault_perma_id(
        "somersault.service.report_status", "somersault_base_variant"
    )
    assert diag_comm_report_status_perma_id is not None

    # Get DiagComm "report_status" of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_lazy_variant_perma_id}/diag-comms/{diag_comm_report_status_perma_id}"
    )
    assert response.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}"
    ]["GET"].validate_response(response)

    diag_comm = json_dict_from_response(response)
    assert diag_comm["origin_layer_perma_id"] == somersault_base_variant_perma_id
    assert diag_comm["origin_layer_short_name"] == "somersault_base_variant"
    assert diag_comm["origin_layer_type"] == "BASE-VARIANT"

    assert "uds_service" in diag_comm
    assert diag_comm["uds_service"]["service_id"] == 34
    assert diag_comm["uds_service"]["service_name"] == "Read Data By Identifier"
    assert "functional_classes" in diag_comm
    assert "protocols" in diag_comm
    assert "pre_condition_states" in diag_comm
    assert "state_transitions" in diag_comm
    assert "is_mandatory" in diag_comm
    assert "is_executable" in diag_comm
    assert "is_final" in diag_comm
    assert "comparams" in diag_comm
    assert "request" in diag_comm
    assert "positive_responses" in diag_comm
    assert "negative_responses" in diag_comm
    assert "is_cyclic" in diag_comm
    assert "is_multiple" in diag_comm
    assert "addressing" in diag_comm
    assert "transmission_mode" in diag_comm
    assert "perma_id" in diag_comm
    assert "ephemeral_id" in diag_comm
    assert "class_name" in diag_comm
    assert diag_comm["class_name"] == "DiagService"


def test_get_single_diag_comm_from_incorrect_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_lazy" variant as well as the "headstand" diagComm from the "somersault_assiduous" variant
    somersault_lazy_variant_perma_id = get_somersault_perma_id("somersault_lazy", "somersault_lazy")
    assert somersault_lazy_variant_perma_id is not None

    diag_comm_headstand_perma_id = get_somersault_perma_id(
        "somersault_assiduous.service.headstand", "somersault_assiduous"
    )
    assert diag_comm_headstand_perma_id is not None

    # Try to get DiagComm "report_status" from "somersault_assiduous" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_lazy_variant_perma_id}/diag-comms/{diag_comm_headstand_perma_id}"
    )
    assert response.status_code == 400
