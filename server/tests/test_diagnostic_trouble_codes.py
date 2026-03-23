# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests different aspects regarding the exploration of Diagnostic Trouble Code (DTC) objects from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_get_all_dtcs(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DTCs using GET /dtcs
    response = diag_client.get("/v1/dtcs")
    assert response.status_code == 200

    diag_schema["/dtcs"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "dtcs" in response_collection
    assert len(response_collection["dtcs"]) == 2
    for dtc_with_refs in response_collection["dtcs"]:
        assert "referencing_variant_perma_ids" in dtc_with_refs
        assert len(dtc_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in dtc_with_refs
        assert dtc_with_refs["diagnostic_data_set_id"] is not None

        assert "dtc" in dtc_with_refs
        dtc = dtc_with_refs["dtc"]
        assert "origin_layer_perma_id" in dtc
        assert "origin_layer_ephemeral_id" in dtc
        assert "origin_layer_short_name" in dtc
        assert "origin_layer_type" in dtc
        assert "origin_dtc_dop_perma_id" in dtc
        assert "origin_dtc_dop_ephemeral_id" in dtc
        assert "origin_dtc_dop_short_name" in dtc
        assert "short_name" in dtc
        assert "perma_id" in dtc
        assert "ephemeral_id" in dtc


def test_get_all_dtcs_with_filter(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DTCs but only containting selected fields using GET /dtcs?fields=...
    response = diag_client.get("/v1/dtcs?fields=trouble_code,level")
    assert response.status_code == 200

    diag_schema["/dtcs"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "dtcs" in response_collection
    assert len(response_collection["dtcs"]) == 2
    for dtc_with_refs in response_collection["dtcs"]:
        assert "referencing_variant_perma_ids" in dtc_with_refs
        assert len(dtc_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in dtc_with_refs
        assert dtc_with_refs["diagnostic_data_set_id"] is not None

        assert "dtc" in dtc_with_refs
        dtc = dtc_with_refs["dtc"]

        # All non filterable fields shall be present
        assert "origin_layer_perma_id" in dtc
        assert "origin_layer_ephemeral_id" in dtc
        assert "origin_layer_short_name" in dtc
        assert "origin_layer_type" in dtc
        assert "origin_dtc_dop_perma_id" in dtc
        assert "origin_dtc_dop_ephemeral_id" in dtc
        assert "origin_dtc_dop_short_name" in dtc
        assert "perma_id" in dtc
        assert "ephemeral_id" in dtc

        # Included fields shall be present
        assert "trouble_code" in dtc
        assert "level" in dtc

        # Non-included field shall not be present
        assert "short_name" not in dtc


def test_get_all_dtcs_with_wrong_filter(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DTCs with wrong fields filter using GET /dtcs?fields=test
    # Get all DTCs but only containting selected fields using GET /dtcs?fields=...
    response = diag_client.get("/v1/dtcs?fields=test")
    assert response.status_code == 200

    diag_schema["/dtcs"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "dtcs" in response_collection
    assert len(response_collection["dtcs"]) == 2
    for dtc_with_refs in response_collection["dtcs"]:
        assert "referencing_variant_perma_ids" in dtc_with_refs
        assert len(dtc_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in dtc_with_refs
        assert dtc_with_refs["diagnostic_data_set_id"] is not None

        assert "dtc" in dtc_with_refs
        dtc = dtc_with_refs["dtc"]

        # All non filterable fields shall be present
        assert "origin_layer_perma_id" in dtc
        assert "origin_layer_ephemeral_id" in dtc
        assert "origin_layer_short_name" in dtc
        assert "origin_layer_type" in dtc
        assert "origin_dtc_dop_perma_id" in dtc
        assert "origin_dtc_dop_ephemeral_id" in dtc
        assert "origin_dtc_dop_short_name" in dtc
        assert "perma_id" in dtc
        assert "ephemeral_id" in dtc

        # Non-included field shall not be present
        assert "short_name" not in dtc


def test_get_dtcs_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use the perma_ID to identify the base variant
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Get DTCs of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dtcs"
    )
    assert response.status_code == 200
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 2
    for dtc in response_collection["items"]:
        assert "origin_layer_perma_id" in dtc
        assert "origin_layer_ephemeral_id" in dtc
        assert "origin_layer_short_name" in dtc
        assert "origin_layer_type" in dtc
        assert "origin_dtc_dop_perma_id" in dtc
        assert "origin_dtc_dop_ephemeral_id" in dtc
        assert "origin_dtc_dop_short_name" in dtc
        assert dtc["origin_layer_perma_id"] == somersault_base_variant_perma_id
        assert dtc["origin_layer_short_name"] == "somersault_base_variant"
        assert dtc["origin_layer_type"] == "BASE-VARIANT"

        assert "perma_id" in dtc
        assert "ephemeral_id" in dtc
        assert "short_name" in dtc
        assert "trouble_code" in dtc
        assert "level" in dtc


def test_get_dtcs_of_variant_with_filter(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use the perma_ID to identify the base variant
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Get DOPs of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs?fields=...
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dtcs?fields=trouble_code,level"
    )
    assert response.status_code == 200
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 2
    for dtc in response_collection["items"]:
        assert "origin_layer_perma_id" in dtc
        assert "origin_layer_ephemeral_id" in dtc
        assert "origin_layer_short_name" in dtc
        assert "origin_layer_type" in dtc
        assert "origin_dtc_dop_perma_id" in dtc
        assert "origin_dtc_dop_ephemeral_id" in dtc
        assert "origin_dtc_dop_short_name" in dtc
        assert dtc["origin_layer_perma_id"] == somersault_base_variant_perma_id
        assert dtc["origin_layer_short_name"] == "somersault_base_variant"
        assert dtc["origin_layer_type"] == "BASE-VARIANT"

        # All non filterable fields shall be present
        assert "perma_id" in dtc
        assert "ephemeral_id" in dtc
        assert "class_name" in dtc

        # Included fields shall be present
        assert "trouble_code" in dtc
        assert "level" in dtc

        # Non-included field shall not be present
        assert "short_name" not in dtc


def test_get_single_dtc_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_base_variant" as well as the "uint8_scale_linear_multiple" DOP
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    dtc_perma_id = get_somersault_perma_id("somersault.DTC.dtc_1002", "somersault_base_variant")

    assert somersault_base_variant_perma_id is not None
    assert dtc_perma_id is not None

    # Get DTC "DTC_0130" of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs/{dtc-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dtcs/{dtc_perma_id}"
    )
    assert response.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs/{dtc-perma-id}"
    ]["GET"].validate_response(response)

    dtc = json_dict_from_response(response)

    assert "origin_layer_perma_id" in dtc
    assert "origin_layer_ephemeral_id" in dtc
    assert "origin_layer_short_name" in dtc
    assert "origin_layer_type" in dtc
    assert "origin_dtc_dop_perma_id" in dtc
    assert "origin_dtc_dop_ephemeral_id" in dtc
    assert "origin_dtc_dop_short_name" in dtc
    assert dtc["origin_layer_perma_id"] == somersault_base_variant_perma_id
    assert dtc["origin_layer_short_name"] == "somersault_base_variant"
    assert dtc["origin_layer_type"] == "BASE-VARIANT"

    assert "perma_id" in dtc
    assert "ephemeral_id" in dtc
    assert "class_name" in dtc
    assert "short_name" in dtc
    assert "trouble_code" in dtc
    assert "display_trouble_code" in dtc
    assert "text" in dtc
    assert "level" in dtc

    assert dtc["class_name"] == "DiagnosticTroubleCode"
    assert dtc["short_name"] == "DTC_1002"
    assert dtc["trouble_code"] == 4098
    assert dtc["display_trouble_code"] == "B1002"
    assert dtc["level"] == 7

    text = dtc["text"]
    assert "ephemeral_id" in text
    assert "class_name" in text
    assert "text" in text
    assert text["text"] == "Energy level dropped below minimum."
