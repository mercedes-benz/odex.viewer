# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests the generic retrieval of data from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import json_dict_from_response


def test_get_diagnostic_data_sets_and_variants(diag_client, upload_pdx_data) -> None:
    # Read all diagnostic data sets using GET /diagnostic-data-sets/PDX -> check item list is not empty
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 1
    assert "perma_id" in response_collection["items"][0]

    # Extract diag_data_set perma_id
    diag_data_set_perma_id = response_collection["items"][0]["perma_id"]

    # Read all diagnostic variants of the diagnostic data set using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> check item list is not empty
    response = diag_client.get(f"/v1/diagnostic-data-sets/{diag_data_set_perma_id}/variants")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 3

    variant_id = None
    # Extract perma_id of "somersault_lazy" variant
    for variant in response_collection["items"]:
        if variant["short_name"] == "somersault_lazy":
            variant_id = variant["perma_id"]
            break
    assert variant_id is not None
    variant_endpoint = f"/v1/diagnostic-data-sets/{diag_data_set_perma_id}/variants/{variant_id}"

    # Get "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(variant_endpoint)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == variant_id
    assert "revision" not in response_json
    assert "revision_ephemeral_id" not in response_json

    # Get DiagComms of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms
    response = diag_client.get(f"{variant_endpoint}/diag-comms")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 7

    # Get DTCs of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs
    response = diag_client.get(f"{variant_endpoint}/dtcs")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 2

    # Get DOPs of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops
    response = diag_client.get(f"{variant_endpoint}/dops")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 24

    # Get StateCharts of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts
    response = diag_client.get(f"{variant_endpoint}/state-charts")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 2


def test_get_all_diag_comms(diag_client, upload_pdx_data) -> None:
    # Read all DiagComms using GET /diag-comms -> check item list is not empty
    response = diag_client.get("/v1/diag-comms")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "diagnostic_data_sets" in response_collection
    assert "variants" in response_collection
    assert "diag_comms" in response_collection
    assert len(response_collection["diagnostic_data_sets"]) == 1
    assert len(response_collection["variants"]) == 3
    assert len(response_collection["diag_comms"]) == 10


def test_get_all_dtcs(diag_client, upload_pdx_data) -> None:
    # Read all DTCs using GET /dtcs -> check response is not empty
    response = diag_client.get("/v1/dtcs")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "diagnostic_data_sets" in response_collection
    assert "variants" in response_collection
    assert "dtcs" in response_collection
    assert len(response_collection["diagnostic_data_sets"]) == 1
    assert len(response_collection["variants"]) == 3
    assert len(response_collection["dtcs"]) == 2


def test_get_all_dops(diag_client, upload_pdx_data) -> None:
    # Read all DOPs using GET /dops -> check response is not empty
    response = diag_client.get("/v1/dops")
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "diagnostic_data_sets" in response_collection
    assert "variants" in response_collection
    assert "dops" in response_collection
    assert len(response_collection["diagnostic_data_sets"]) == 1
    assert len(response_collection["variants"]) == 3
    assert len(response_collection["dops"]) == 26
