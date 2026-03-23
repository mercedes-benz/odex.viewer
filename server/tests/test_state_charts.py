# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests different aspects regarding the exploration of State Chart objects from a PDX file via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_get_all_state_charts(diag_schema, diag_client, upload_pdx_data) -> None:
    # Get all state charts using GET /state-charts
    response = diag_client.get("/v1/state-charts")
    assert response.status_code == 200

    diag_schema["/state-charts"]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)

    assert "items" in response_collection
    assert len(response_collection["items"]) == 2
    for state_chart_with_metadata in response_collection["items"]:
        assert "meta_data" in state_chart_with_metadata
        meta_data = state_chart_with_metadata["meta_data"]
        assert "state_chart_perma_id" in meta_data
        assert "state_chart_ephemeral_id" in meta_data
        assert "referencing_variants" in meta_data
        assert len(meta_data["referencing_variants"]) > 0
        assert "diagnostic_data_set_ref" in meta_data
        assert "origin_layer" in meta_data

        assert "state_chart" in state_chart_with_metadata
        state_chart = state_chart_with_metadata["state_chart"]
        assert "state_transitions" in state_chart
        assert "states" in state_chart


def test_get_state_charts_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_lazy_variant_perma_id = get_somersault_perma_id("somersault_lazy", "somersault_lazy")
    assert somersault_lazy_variant_perma_id is not None

    # Get State charts of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_lazy_variant_perma_id}/state-charts"
    )
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts"
    ]["GET"].validate_response(response)
    response_collection = json_dict_from_response(response)
    assert response.status_code == 200
    assert "items" in response_collection
    assert len(response_collection["items"]) == 2
    for state_chart in response_collection["items"]:
        assert "short_name" in state_chart
        assert "state_transitions" in state_chart
        assert "states" in state_chart
        assert len(state_chart["state_transitions"]) > 0
        assert len(state_chart["states"]) > 0


def test_get_single_state_chart_of_variant(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    somersault_lazy_variant_perma_id = get_somersault_perma_id("somersault_lazy", "somersault_lazy")
    assert somersault_lazy_variant_perma_id is not None

    annoyed_state_chart_perma_id = get_somersault_perma_id(
        "charts.annoyed.chart", "somersault_lazy"
    )
    assert annoyed_state_chart_perma_id is not None

    # Get state chart "annoyed" of "somersault_lazy" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts/{state-chart-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_lazy_variant_perma_id}/state-charts/{annoyed_state_chart_perma_id}"
    )
    assert response.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts/{state-chart-perma-id}"
    ]["GET"].validate_response(response)

    state_chart_with_metadata = json_dict_from_response(response)

    assert "state_chart" in state_chart_with_metadata
    state_chart = state_chart_with_metadata["state_chart"]
    assert "short_name" in state_chart
    assert "state_transitions" in state_chart
    assert "states" in state_chart
    assert len(state_chart["state_transitions"]) == 6
    assert len(state_chart["states"]) == 4

    assert "meta_data" in state_chart_with_metadata
    meta_data = state_chart_with_metadata["meta_data"]
    assert "state_chart_perma_id" in meta_data
    assert "state_chart_ephemeral_id" in meta_data
    assert "referencing_variants" in meta_data
    assert len(meta_data["referencing_variants"]) == 1
    assert "diagnostic_data_set_ref" in meta_data
    assert "origin_layer" in meta_data
    assert meta_data["origin_layer"]["perma_id"] == somersault_lazy_variant_perma_id

    assert "referencing_transitions" in state_chart_with_metadata
    assert len(state_chart_with_metadata["referencing_transitions"]) > 0
