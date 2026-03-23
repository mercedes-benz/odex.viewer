# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests the functionality for managing diagnostic data sets via the odex.viewer backend server API.
"""

from tests.utils import json_dict_from_response


def test_get_diagnostic_data_sets(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all diagnostic data sets using GET /diagnostic-data-sets/PDX:
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{data-type}"]["GET"].validate_response(response)
    diagnostic_data_sets_collection = json_dict_from_response(response)

    assert "items" in diagnostic_data_sets_collection
    assert len(diagnostic_data_sets_collection["items"]) == 1
    somersault_pdx = diagnostic_data_sets_collection["items"][0]
    assert "display_name" in somersault_pdx
    assert somersault_pdx["display_name"] == "Somersault ECU"
    assert "file_name" in somersault_pdx
    assert somersault_pdx["file_name"] == "somersault.pdx"
    assert "diagnostic_layer_containers" in somersault_pdx
    assert len(somersault_pdx["diagnostic_layer_containers"]) == 1


def test_delete_diagnostic_data_sets_of_type(diag_schema, diag_client, upload_pdx_data) -> None:
    # Delete all diagnostic data sets using DELETE /diagnostic-data-sets/PDX:
    response = diag_client.delete("/v1/diagnostic-data-sets/PDX")
    assert response.status_code == 204

    # Get all diagnostic data sets using GET /diagnostic-data-sets/PDX and check that the list is empty
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{data-type}"]["GET"].validate_response(response)
    diagnostic_data_sets_collection = json_dict_from_response(response)
    assert "items" in diagnostic_data_sets_collection
    assert len(diagnostic_data_sets_collection["items"]) == 0


def test_delete_single_diagnostic_data_set(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all diagnostic data sets to resolve a valid diagnostic data set ID
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    diagnostic_data_sets_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in diagnostic_data_sets_collection
    assert len(diagnostic_data_sets_collection["items"]) == 1
    assert "perma_id" in diagnostic_data_sets_collection["items"][0]
    diagnostic_data_set_id = diagnostic_data_sets_collection["items"][0]["perma_id"]

    # Delete a specific diagnostic data set using DELETE /diagnostic-data-sets/{diag-data-set-id}:
    response = diag_client.delete(f"/v1/diagnostic-data-sets/PDX/{diagnostic_data_set_id}")
    assert response.status_code == 204

    # Get all diagnostic data sets using GET /diagnostic-data-sets/PDX and check that the list is empty
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{data-type}"]["GET"].validate_response(response)
    diagnostic_data_sets_collection = json_dict_from_response(response)
    assert "items" in diagnostic_data_sets_collection
    assert len(diagnostic_data_sets_collection["items"]) == 0
