# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests different aspects regarding the exploration of Data-Object-Property (DOP) objects from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_get_all_dops(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DOPs using GET /dops
    response = diag_client.get("/v1/dops")
    assert response.status_code == 200

    diag_schema["/dops"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "dops" in response_collection
    assert len(response_collection["dops"]) == 26
    for dop_with_refs in response_collection["dops"]:
        assert "referencing_variant_perma_ids" in dop_with_refs
        assert len(dop_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in dop_with_refs
        assert dop_with_refs["diagnostic_data_set_id"] is not None

        assert "dop" in dop_with_refs
        dop_with_layer_info = dop_with_refs["dop"]
        assert "dop" in dop_with_layer_info
        dop = dop_with_layer_info["dop"]
        assert "origin_layer_perma_id" in dop_with_layer_info
        assert "origin_layer_ephemeral_id" in dop_with_layer_info
        assert "origin_layer_short_name" in dop_with_layer_info
        assert "origin_layer_type" in dop_with_layer_info
        assert "short_name" in dop
        assert "perma_id" in dop
        assert "ephemeral_id" in dop
        assert "class_name" in dop


def test_get_all_dops_with_filter(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DOPs but only containting selected fields using GET /dops?fields=...
    response = diag_client.get("/v1/dops?fields=long_name")
    assert response.status_code == 200

    diag_schema["/dops"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "dops" in response_collection
    assert len(response_collection["dops"]) == 26
    for dop_with_refs in response_collection["dops"]:
        assert "referencing_variant_perma_ids" in dop_with_refs
        assert len(dop_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in dop_with_refs
        assert dop_with_refs["diagnostic_data_set_id"] is not None

        assert "dop" in dop_with_refs
        dop_with_layer_info = dop_with_refs["dop"]
        assert "dop" in dop_with_layer_info
        dop = dop_with_layer_info["dop"]

        # All non filterable fields shall be present
        assert "origin_layer_perma_id" in dop_with_layer_info
        assert "origin_layer_ephemeral_id" in dop_with_layer_info
        assert "origin_layer_short_name" in dop_with_layer_info
        assert "origin_layer_type" in dop_with_layer_info
        assert "perma_id" in dop
        assert "ephemeral_id" in dop
        assert "class_name" in dop

        # Non-included field shall not be present
        assert "short_name" not in dop


def test_get_all_dops_with_wrong_filter(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all DOPs with wrong fields filter using GET /dops?fields=test
    response = diag_client.get("/v1/dops?fields=test")
    assert response.status_code == 200

    diag_schema["/dops"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "dops" in response_collection
    assert len(response_collection["dops"]) == 26
    for dop_with_refs in response_collection["dops"]:
        assert "referencing_variant_perma_ids" in dop_with_refs
        assert len(dop_with_refs["referencing_variant_perma_ids"]) > 0
        assert "diagnostic_data_set_id" in dop_with_refs
        assert dop_with_refs["diagnostic_data_set_id"] is not None

        assert "dop" in dop_with_refs
        dop_with_layer_info = dop_with_refs["dop"]
        assert "dop" in dop_with_layer_info
        dop = dop_with_layer_info["dop"]

        # All non filterable fields shall be present
        assert "origin_layer_perma_id" in dop_with_layer_info
        assert "origin_layer_ephemeral_id" in dop_with_layer_info
        assert "origin_layer_short_name" in dop_with_layer_info
        assert "origin_layer_type" in dop_with_layer_info
        assert "perma_id" in dop
        assert "ephemeral_id" in dop
        assert "class_name" in dop

        # All additional fields shall not be present
        assert "short_name" not in dop


def test_get_dops_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use the perma_ID to identify the base variant
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Get DOPs of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dops"
    )
    assert response.status_code == 200
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 24
    for dop_with_layer_info in response_collection["items"]:
        assert "origin_layer_perma_id" in dop_with_layer_info
        assert "origin_layer_ephemeral_id" in dop_with_layer_info
        assert "origin_layer_short_name" in dop_with_layer_info
        assert "origin_layer_type" in dop_with_layer_info
        assert dop_with_layer_info["origin_layer_perma_id"] == somersault_base_variant_perma_id
        assert dop_with_layer_info["origin_layer_short_name"] == "somersault_base_variant"
        assert dop_with_layer_info["origin_layer_type"] == "BASE-VARIANT"

        assert "dop" in dop_with_layer_info
        dop = dop_with_layer_info["dop"]
        assert "perma_id" in dop
        assert "ephemeral_id" in dop
        assert "class_name" in dop
        assert "short_name" in dop


def test_get_dops_of_variant_with_filter(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use the perma_ID to identify the base variant
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    # Get DOPs of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops?fields=...
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dops?fields=long_name"
    )
    assert response.status_code == 200
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops"][
        "GET"
    ].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 24
    for dop_with_layer_info in response_collection["items"]:
        assert "origin_layer_perma_id" in dop_with_layer_info
        assert "origin_layer_ephemeral_id" in dop_with_layer_info
        assert "origin_layer_short_name" in dop_with_layer_info
        assert "origin_layer_type" in dop_with_layer_info
        assert dop_with_layer_info["origin_layer_perma_id"] == somersault_base_variant_perma_id
        assert dop_with_layer_info["origin_layer_short_name"] == "somersault_base_variant"
        assert dop_with_layer_info["origin_layer_type"] == "BASE-VARIANT"

        assert "dop" in dop_with_layer_info
        dop = dop_with_layer_info["dop"]

        # All non filterable fields shall be present
        assert "perma_id" in dop
        assert "ephemeral_id" in dop
        assert "class_name" in dop

        # Non-included field shall not be present
        assert "short_name" not in dop


def test_get_single_dop_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_base_variant" as well as the "uint8_scale_linear_multiple" DOP
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    uint8_scale_linear_multiple_perma_id = get_somersault_perma_id(
        "somersault.DOP.uint8_scale_linear_multiple", "somersault_base_variant"
    )

    assert somersault_base_variant_perma_id is not None
    assert uint8_scale_linear_multiple_perma_id is not None

    # Get DOP "uint8_scale_linear_multiple" of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops/{dop-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dops/{uint8_scale_linear_multiple_perma_id}"
    )
    assert response.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops/{dop-perma-id}"
    ]["GET"].validate_response(response)
    dop_with_layer_info = json_dict_from_response(response)

    assert dop_with_layer_info["origin_layer_perma_id"] == somersault_base_variant_perma_id
    assert dop_with_layer_info["origin_layer_ephemeral_id"] is not None
    assert dop_with_layer_info["origin_layer_short_name"] == "somersault_base_variant"
    assert dop_with_layer_info["origin_layer_type"] == "BASE-VARIANT"

    # Specific checks for "uint8_scale_linear_multiple" DOP
    dop = dop_with_layer_info["dop"]

    assert "perma_id" in dop
    assert "ephemeral_id" in dop
    assert "class_name" in dop
    assert "short_name" in dop
    assert "diag_coded_type" in dop
    assert "physical_type" in dop
    assert "compu_method" in dop

    assert dop["class_name"] == "DataObjectProperty"
    assert dop["short_name"] == "uint8_scale_linear_multiple"

    diag_coded_type = dop["diag_coded_type"]
    assert "class_name" in diag_coded_type
    assert diag_coded_type["class_name"] == "StandardLengthType"
    assert "base_data_type" in diag_coded_type
    assert diag_coded_type["base_data_type"] == "A_UINT32"
    assert "bit_length" in diag_coded_type
    assert diag_coded_type["bit_length"] == 8

    physical_type = dop["physical_type"]
    assert "class_name" in physical_type
    assert physical_type["class_name"] == "PhysicalType"
    assert "base_data_type" in physical_type
    assert physical_type["base_data_type"] == "A_UINT32"

    compu_method = dop["compu_method"]
    assert "class_name" in compu_method
    assert compu_method["class_name"] == "ScaleLinearCompuMethod"
    assert "category" in compu_method
    assert compu_method["category"] == "SCALE-LINEAR"
    assert "internal_type" in compu_method
    assert compu_method["internal_type"] == "A_UINT32"
    assert "physical_type" in compu_method
    assert compu_method["physical_type"] == "A_UINT32"

    assert "compu_internal_to_phys" in compu_method
    compu_internal_to_phys = compu_method["compu_internal_to_phys"]
    assert "compu_scales" in compu_internal_to_phys
    assert len(compu_internal_to_phys["compu_scales"]) == 4
