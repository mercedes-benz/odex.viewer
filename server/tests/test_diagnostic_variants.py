# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests different aspects regarding the exploration of Diagnostic Variant objects from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_get_all_variants_of_diagnostic_data_set(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get diagnostic data sets using GET /diagnostic-data-sets/PDX
    response = diag_client.get("/v1/diagnostic-data-sets/PDX")
    assert response.status_code == 200

    response_collection = json_dict_from_response(response)
    diag_schema["/diagnostic-data-sets/{data-type}"]["GET"].validate_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 1
    assert "perma_id" in response_collection["items"][0]

    # Extract perma_id of diagnostic data set
    data_set_perma_id = response_collection["items"][0]["perma_id"]

    # Read all diagnostic variants of diagnostic data set using GET /diagnostic-data-sets/{diag-data-set-id}/variants
    response = diag_client.get(f"/v1/diagnostic-data-sets/{data_set_perma_id}/variants")
    assert response.status_code == 200

    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants"]["GET"].validate_response(
        response
    )
    response_collection = json_dict_from_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 3

    for variant in response_collection["items"]:
        assert "short_name" in variant
        assert "long_name" in variant
        assert "description" in variant
        assert "variant_type" in variant
        assert "variant_patterns" in variant
        assert "perma_id" in variant
        assert "parent_refs" in variant

        if variant["short_name"] == "somersault_base_variant":
            assert variant["variant_type"] == "BASE-VARIANT"
        elif variant["short_name"] == "somersault_lazy":
            assert variant["variant_type"] == "ECU-VARIANT"
        elif variant["short_name"] == "somersault_assiduous":
            assert variant["variant_type"] == "ECU-VARIANT"
            assert "revision" in variant
            assert "revision_ephemeral_id" in variant


def test_get_single_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    somersault_lazy_variant_perma_id = get_somersault_perma_id("somersault_lazy", "somersault_lazy")
    assert somersault_lazy_variant_perma_id is not None

    somersault_assiduous_perma_id = get_somersault_perma_id(
        "somersault_assiduous", "somersault_assiduous"
    )
    assert somersault_assiduous_perma_id is not None

    somersault_base_variant_endpoint = f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}"
    somersault_lazy_variant_endpoint = f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_lazy_variant_perma_id}"
    somersault_assiduous_variant_endpoint = f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_assiduous_perma_id}"

    # Get "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_base_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_base_variant_perma_id
    assert response_json["short_name"] == "somersault_base_variant"

    # Get "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_lazy_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_lazy_variant_perma_id
    assert response_json["short_name"] == "somersault_lazy"

    # Get "somersault_assiduous" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_assiduous_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_assiduous_perma_id
    assert response_json["short_name"] == "somersault_assiduous"

def test_get_single_variant_parent_ref(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    somersault_lazy_variant_perma_id = get_somersault_perma_id("somersault_lazy", "somersault_lazy")
    assert somersault_lazy_variant_perma_id is not None

    somersault_lazy_variant_endpoint = f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_lazy_variant_perma_id}"

    # Get "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant_id}
    response = diag_client.get(somersault_lazy_variant_endpoint)
    diag_schema["/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}"][
        "GET"
    ].validate_response(response)
    response_json = json_dict_from_response(response)
    assert response.status_code == 200
    assert "short_name" in response_json
    assert "perma_id" in response_json
    assert response_json["perma_id"] == somersault_lazy_variant_perma_id
    assert response_json["short_name"] == "somersault_lazy"
    assert "parent_refs" in response_json
    assert len(response_json["parent_refs"]) == 1
    parent_ref = response_json["parent_refs"][0]
    assert "layer_ref" in parent_ref
    layer_ref = parent_ref["layer_ref"]
    assert "resolved_object_perma_id" in layer_ref
    assert layer_ref["resolved_object_perma_id"] == somersault_base_variant_perma_id
    assert "resolved_object_short_name" in layer_ref
    assert layer_ref["resolved_object_short_name"] == "somersault_base_variant"
    assert "resolved_object_ephemeral_id" in layer_ref
    assert layer_ref["resolved_object_ephemeral_id"] is not None
