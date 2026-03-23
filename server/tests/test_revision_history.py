# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests the retrieval of a revision history of an object via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_get_revision_history_for_diag_data_set(diag_schema, diag_client, upload_pdx_data) -> None:
    # Read all diagnostic data sets using GET /diagnostic-data-sets/PDX -> check item list is not empty
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 1
    assert "perma_id" in response_collection["items"][0]

    # Extract diagnostic data set perma_id
    diag_data_set_perma_id = response_collection["items"][0]["perma_id"]

    # Get the revision history of a diagnostic data set object using GET /diagnostic-data-sets/{diag-data-set-id}/revision-history
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{diag_data_set_perma_id}/revision-history"
    )
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/revision-history"][
        "GET"
    ].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "container_name" in response_obj
    assert response_obj["container_name"] == "somersault"
    assert "container_type" in response_obj
    assert response_obj["container_type"] == "DIAG_LAYER_CONTAINER"
    assert "container_perma_id" in response_obj
    assert "container_ephemeral_id" in response_obj
    assert "language" in response_obj
    assert response_obj["language"] == "en-US"
    assert "revisions" in response_obj
    assert len(response_obj["revisions"]) == 3
    assert "company_datas" in response_obj
    assert len(response_obj["company_datas"]) == 2


def test_get_revision_history_by_perma_id_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_assiduous_perma_id = get_somersault_perma_id(
        "somersault_assiduous", "somersault_assiduous"
    )
    assert somersault_assiduous_perma_id is not None

    # Get the revision history of a variant object using GET /diagnostic-data-sets/{diag-data-set-id}/revision-history/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/revision-history/{somersault_assiduous_perma_id}"
    )
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/revision-history/{perma-id}"][
        "GET"
    ].validate_response(response)
    response_obj = json_dict_from_response(response)

    assert "container_name" in response_obj
    assert response_obj["container_name"] == "somersault_assiduous"
    assert "container_type" in response_obj
    assert response_obj["container_type"] == "ECU_VARIANT"
    assert "container_perma_id" in response_obj
    assert response_obj["container_perma_id"] == somersault_assiduous_perma_id
    assert "container_ephemeral_id" in response_obj
    assert "language" in response_obj
    assert response_obj["language"] == "en-US"
    assert "revisions" in response_obj
    assert len(response_obj["revisions"]) == 1
    assert "company_datas" in response_obj
    assert len(response_obj["company_datas"]) == 0


def test_get_revision_history_with_invalid_perma_id(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Try to get a revision history with an invalid perma_id using GET /diagnostic-data-sets/{diag-data-set-id}/revision-history/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/revision-history/test1234"
    )
    assert response.status_code == 404


def test_get_revision_history_from_invalid_object_type(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    uint8_scale_linear_multiple_perma_id = get_somersault_perma_id(
        "somersault.DOP.uint8_scale_linear_multiple", "somersault_base_variant"
    )
    assert uint8_scale_linear_multiple_perma_id is not None

    # Try to get a revision history from a DOP object type which does not have a revision history
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/revision-history/{uint8_scale_linear_multiple_perma_id}"
    )
    assert response.status_code == 400
