# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests the registration and management of PDX files via the odex.viewer backend server API.
"""

import os
from pathlib import Path

from tests.utils import json_dict_from_response

pdx_file_path = Path(os.path.dirname(os.path.realpath(__file__))).joinpath("somersault.pdx")


def test_pdx_upload_sequence(diag_client) -> None:
    """Test a PDX upload and retrieval of resources from the PDX.
    1. Read all PDX diagnostic data set entries using GET /diagnostic-data-sets/PDX -> check item list is empty
    2. Upload a new PDX file using POST /diagnostic-data-sets/PDX
    3. Read all PDX diagnostic data set entries using GET /diagnostic-data-sets/PDX -> check item list is not empty and contains an entry for the uploaded somersault PDX
    4. Read "diagnostic variants" from PDX using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> check item list is not empty and contains the defined variants
    5. Try to upload the same PDX file again using POST /diagnostic-data-sets/PDX
    6. Read "diagnostic variants" from PDX using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> check item list is not empty and contains the defined variants
    7. Delete the first uploaded PDX using DELETE /diagnostic-data-sets/PDX/{diag-data-id}
    8. Read "diagnostic variants" from PDX using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> shall return 404
    9. Read all PDX diagnostic data set entries using GET /diagnostic-data-sets/PDX -> check item list is empty
    """

    diag_data_sets_pdx_endpoint = "/v1/diagnostic-data-sets/PDX"
    diag_data_sets_endpoint = "/v1/diagnostic-data-sets"
    diag_variants_path = "/variants"

    # 0. As a preparation step, delete any registered PDX using DELETE /diagnostic-data-sets/PDX
    response = diag_client.delete(diag_data_sets_pdx_endpoint)
    assert response.status_code == 204

    # 1. Read all PDX entries using GET /diagnostic-data-sets/PDX -> check item list is empty
    response = diag_client.get(diag_data_sets_pdx_endpoint)
    pdx_data_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in pdx_data_collection
    assert len(pdx_data_collection["items"]) == 0

    # 2. Upload a new PDX file using POST /diagnostic-data-sets/PDX
    pdx_upload_files = {
        "file_content": (
            "somersault.pdx",
            pdx_file_path.read_bytes(),
            "application/octet-stream",
        )
    }
    pdx_upload_data = {"display_name": "Somersault ECU"}
    response = diag_client.post(
        diag_data_sets_pdx_endpoint,
        data=pdx_upload_data,
        files=pdx_upload_files,
    )

    assert response.status_code == 201
    resp_dict = json_dict_from_response(response)
    assert resp_dict is not None
    assert "id" in resp_dict

    # Extract the id for the following requests
    data_set_id_1 = resp_dict["id"]
    data_sets_pdx_endpoint_1 = "".join([diag_data_sets_pdx_endpoint, "/", data_set_id_1])
    data_set_endpoint_1 = "".join([diag_data_sets_endpoint, "/", data_set_id_1])

    # 3. Read all PDX diagnostic data set entries using GET /diagnostic-data-sets/PDX -> check item list is not empty and contains an entry for the uploaded somersault PDX
    response = diag_client.get(diag_data_sets_pdx_endpoint)
    pdx_data_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in pdx_data_collection
    assert len(pdx_data_collection["items"]) == 1
    assert "display_name" in pdx_data_collection["items"][0]
    assert "file_name" in pdx_data_collection["items"][0]
    assert pdx_data_collection["items"][0]["display_name"] == "Somersault ECU"
    assert pdx_data_collection["items"][0]["file_name"] == "somersault.pdx"

    # 4. Read "diagnostic variants" from PDX using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> check item list is not empty and contains the defined variants
    diag_variants_endpoint_1 = "".join([data_set_endpoint_1, diag_variants_path])
    response = diag_client.get(diag_variants_endpoint_1)
    diag_variants_collection_1 = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in diag_variants_collection_1
    assert len(diag_variants_collection_1["items"]) == 3

    # 5. Try to upload the same PDX file again using POST /diagnostic-data-sets/PDX
    response = diag_client.post(
        diag_data_sets_pdx_endpoint,
        data=pdx_upload_data,
        files=pdx_upload_files,
    )

    assert response.status_code == 400
    resp_dict = json_dict_from_response(response)
    assert resp_dict is not None
    assert "instance" in resp_dict
    assert resp_dict["instance"] == "/problem/odx#duplicate-perma-id"

    # 6. Read "diagnostic variants" from PDX using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> check item list is not empty and contains the defined variants
    response = diag_client.get(diag_variants_endpoint_1)
    diag_variants_collection_1 = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in diag_variants_collection_1
    assert len(diag_variants_collection_1["items"]) == 3

    # 7. Delete the first uploaded PDX using DELETE /diagnostic-data-sets/PDX/{diag-data-id}
    response = diag_client.delete(data_sets_pdx_endpoint_1)
    assert response.status_code == 204

    # 8. Read "diagnostic variants" from PDX using GET /diagnostic-data-sets/{diag-data-set-id}/variants -> shall return 404
    response = diag_client.get(diag_variants_endpoint_1)
    assert response.status_code == 404

    # 9. Read all PDX diagnostic data set entries using GET /diagnostic-data-sets/PDX -> check item list is empty
    response = diag_client.get(diag_data_sets_pdx_endpoint)
    pdx_data_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in pdx_data_collection
    assert len(pdx_data_collection["items"]) == 0
