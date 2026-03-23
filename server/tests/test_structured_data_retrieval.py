# SPDX-License-Identifier: AGPL-3.0-only
"""
This module tests the generic retrieval of objects in a structured representation according to a given schema via the odex.viewer backend server API.
"""

from tests.utils import get_somersault_perma_id, json_dict_from_response

# ####################################################################################################################################
# Test cases for ephemeral-ID endpoints
# ####################################################################################################################################


def test_get_structured_data_by_ephemeral_id_diag_service(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_base_variant" and the "report_status" diagComm
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    diag_comm_report_status_perma_id = get_somersault_perma_id(
        "somersault.service.report_status", "somersault_base_variant"
    )
    assert diag_comm_report_status_perma_id is not None

    # Get DiagComm "report_status" from "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/diag-comms/{diag_comm_report_status_perma_id}"
    )
    response_diag_service = json_dict_from_response(response)
    assert response.status_code == 200
    assert "ephemeral_id" in response_diag_service
    diag_comm_report_status_ephemeral_id = response_diag_service["ephemeral_id"]

    schema_name = "DiagService"

    # Retrieve structured data via a target schema name and an ephemeral ID using GET /structured-data/{schema-name}/{ephemeral-id}
    response = diag_client.get(
        f"/v1/structured-data/{schema_name}/{diag_comm_report_status_ephemeral_id}"
    )
    assert response.status_code == 200
    diag_schema["/structured-data/{schema-name}/{ephemeral-id}"]["GET"].validate_response(response)

    diag_comm = json_dict_from_response(response)
    assert "short_name" in diag_comm
    assert diag_comm["short_name"] == "report_status"
    assert "odx_id" in diag_comm
    assert diag_comm["odx_id"]["local_id"] == "somersault.service.report_status"
    assert "sdgs" in diag_comm
    assert "functional_class_refs" in diag_comm
    assert "functional_classes" not in diag_comm
    assert "audience" in diag_comm
    assert "protocol_snrefs" in diag_comm
    assert "protocols" not in diag_comm
    assert "related_diag_comm_refs" in diag_comm
    assert "pre_condition_state_refs" in diag_comm
    assert "pre_condition_states" not in diag_comm
    assert "state_transition_refs" in diag_comm
    assert "state_transitions" not in diag_comm
    assert "semantic" in diag_comm
    assert diag_comm["semantic"] == "CURRENTDATA"
    assert "is_mandatory" in diag_comm
    assert "is_executable" in diag_comm
    assert "is_final" in diag_comm
    assert "comparam_refs" in diag_comm
    assert "comparams" not in diag_comm
    assert "request_ref" in diag_comm
    assert "request" not in diag_comm
    assert "pos_response_refs" in diag_comm
    assert "positive_responses" not in diag_comm
    assert "neg_response_refs" in diag_comm
    assert "negative_responses" not in diag_comm
    assert "is_cyclic" in diag_comm
    assert "is_multiple" in diag_comm
    assert "addressing" in diag_comm
    assert diag_comm["addressing"] == "PHYSICAL"
    assert "transmission_mode" in diag_comm
    assert "perma_id" in diag_comm
    assert diag_comm["perma_id"] == diag_comm_report_status_perma_id
    assert "ephemeral_id" in diag_comm
    assert diag_comm["ephemeral_id"] == diag_comm_report_status_ephemeral_id
    assert "class_name" in diag_comm
    assert diag_comm["class_name"] == "DiagService"


def test_get_structured_data_by_ephemeral_id_diag_service_resolved(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_base_variant" and the "report_status" diagComm
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    assert somersault_base_variant_perma_id is not None

    diag_comm_report_status_perma_id = get_somersault_perma_id(
        "somersault.service.report_status", "somersault_base_variant"
    )
    assert diag_comm_report_status_perma_id is not None

    # Get DiagComm "report_status" from "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/diag-comms/{diag_comm_report_status_perma_id}"
    )
    response_diag_service = json_dict_from_response(response)
    assert response.status_code == 200
    assert "ephemeral_id" in response_diag_service
    diag_comm_report_status_ephemeral_id = response_diag_service["ephemeral_id"]

    schema_name = "DiagServiceResolved"

    # Retrieve structured data via a target schema name and a permanent ID using GET /structured-data/{schema-name}/{ephemeral-id}
    response = diag_client.get(
        f"/v1/structured-data/{schema_name}/{diag_comm_report_status_ephemeral_id}"
    )
    assert response.status_code == 200
    diag_schema["/structured-data/{schema-name}/{ephemeral-id}"]["GET"].validate_response(response)

    diag_comm = json_dict_from_response(response)
    assert "short_name" in diag_comm
    assert diag_comm["short_name"] == "report_status"
    assert "odx_id" in diag_comm
    assert diag_comm["odx_id"]["local_id"] == "somersault.service.report_status"
    assert "sdgs" in diag_comm
    assert "functional_class_refs" in diag_comm
    assert "functional_classes" in diag_comm
    assert "audience" in diag_comm
    assert "protocol_snrefs" in diag_comm
    assert "protocols" in diag_comm
    assert "related_diag_comm_refs" in diag_comm
    assert "pre_condition_state_refs" in diag_comm
    assert "pre_condition_states" in diag_comm
    assert "state_transition_refs" in diag_comm
    assert "state_transitions" in diag_comm
    assert "semantic" in diag_comm
    assert diag_comm["semantic"] == "CURRENTDATA"
    assert "is_mandatory" in diag_comm
    assert "is_executable" in diag_comm
    assert "is_final" in diag_comm
    assert "comparam_refs" in diag_comm
    assert "comparams" in diag_comm
    assert "request_ref" in diag_comm
    assert "request" in diag_comm
    assert "pos_response_refs" in diag_comm
    assert "positive_responses" in diag_comm
    assert "neg_response_refs" in diag_comm
    assert "negative_responses" in diag_comm
    assert "is_cyclic" in diag_comm
    assert "is_multiple" in diag_comm
    assert "addressing" in diag_comm
    assert diag_comm["addressing"] == "PHYSICAL"
    assert "transmission_mode" in diag_comm
    assert "perma_id" in diag_comm
    assert diag_comm["perma_id"] == diag_comm_report_status_perma_id
    assert "ephemeral_id" in diag_comm
    assert diag_comm["ephemeral_id"] == diag_comm_report_status_ephemeral_id
    assert "class_name" in diag_comm
    assert diag_comm["class_name"] == "DiagService"


def test_get_structured_data_by_ephemeral_id_dtc(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "somersault_base_variant" as well as the "uint8_scale_linear_multiple" DOP
    somersault_base_variant_perma_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    dtc_perma_id = get_somersault_perma_id("somersault.DTC.dtc_1002", "somersault_base_variant")

    assert somersault_base_variant_perma_id is not None
    assert dtc_perma_id is not None

    # Get DTC "DTC_1002" from "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs/{dtc-perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{somersault_base_variant_perma_id}/dtcs/{dtc_perma_id}"
    )
    response_dtc = json_dict_from_response(response)
    assert response.status_code == 200
    assert "ephemeral_id" in response_dtc
    dtc_ephemeral_id = response_dtc["ephemeral_id"]

    # Get DTC "DTC_1002" of "somersault_base_variant" variant using GET /structured-data/{schema-name}/{ephemeral-id}
    schema_name = "DiagnosticTroubleCode"
    # Retrieve structured data via a target schema name and an ephemeral ID using GET /structured-data/{schema-name}/{ephemeral-id}
    response = diag_client.get(f"/v1/structured-data/{schema_name}/{dtc_ephemeral_id}")
    assert response.status_code == 200
    dtc = json_dict_from_response(response)

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


# ####################################################################################################################################
# Test cases for perma-ID endpoints
# ####################################################################################################################################


def test_get_structured_data_by_perma_id_diag_service(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "report_status" diagComm
    diag_comm_report_status_perma_id = get_somersault_perma_id(
        "somersault.service.report_status", "somersault_base_variant"
    )
    assert diag_comm_report_status_perma_id is not None

    schema_name = "DiagService"

    # Retrieve structured data via a target schema name and an ephemeral ID using GET /diagnostic-data-sets/{diag-data-set-id}/structured-data/{schema-name}/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/structured-data/{schema_name}/{diag_comm_report_status_perma_id}"
    )
    assert response.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/structured-data/{schema-name}/{perma-id}"
    ]["GET"].validate_response(response)

    diag_comm = json_dict_from_response(response)
    assert "short_name" in diag_comm
    assert diag_comm["short_name"] == "report_status"
    assert "odx_id" in diag_comm
    assert diag_comm["odx_id"]["local_id"] == "somersault.service.report_status"
    assert "sdgs" in diag_comm
    assert "functional_class_refs" in diag_comm
    assert "functional_classes" not in diag_comm
    assert "audience" in diag_comm
    assert "protocol_snrefs" in diag_comm
    assert "protocols" not in diag_comm
    assert "related_diag_comm_refs" in diag_comm
    assert "pre_condition_state_refs" in diag_comm
    assert "pre_condition_states" not in diag_comm
    assert "state_transition_refs" in diag_comm
    assert "state_transitions" not in diag_comm
    assert "semantic" in diag_comm
    assert diag_comm["semantic"] == "CURRENTDATA"
    assert "is_mandatory" in diag_comm
    assert "is_executable" in diag_comm
    assert "is_final" in diag_comm
    assert "comparam_refs" in diag_comm
    assert "comparams" not in diag_comm
    assert "request_ref" in diag_comm
    assert "request" not in diag_comm
    assert "pos_response_refs" in diag_comm
    assert "positive_responses" not in diag_comm
    assert "neg_response_refs" in diag_comm
    assert "negative_responses" not in diag_comm
    assert "is_cyclic" in diag_comm
    assert "is_multiple" in diag_comm
    assert "addressing" in diag_comm
    assert diag_comm["addressing"] == "PHYSICAL"
    assert "transmission_mode" in diag_comm
    assert "perma_id" in diag_comm
    assert diag_comm["perma_id"] == diag_comm_report_status_perma_id
    assert "ephemeral_id" in diag_comm
    assert "class_name" in diag_comm
    assert diag_comm["class_name"] == "DiagService"


def test_get_structured_data_by_perma_id_diag_service_resolved(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "report_status" diagComm
    diag_comm_report_status_perma_id = get_somersault_perma_id(
        "somersault.service.report_status", "somersault_base_variant"
    )
    assert diag_comm_report_status_perma_id is not None

    schema_name = "DiagServiceResolved"

    # Retrieve structured data via a target schema name and a permanent ID using GET /diagnostic-data-sets/{diag-data-set-id}/structured-data/{schema-name}/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/structured-data/{schema_name}/{diag_comm_report_status_perma_id}"
    )
    assert response.status_code == 200
    diag_schema["/structured-data/{schema-name}/{ephemeral-id}"]["GET"].validate_response(response)

    diag_comm = json_dict_from_response(response)
    assert "short_name" in diag_comm
    assert diag_comm["short_name"] == "report_status"
    assert "odx_id" in diag_comm
    assert diag_comm["odx_id"]["local_id"] == "somersault.service.report_status"
    assert "sdgs" in diag_comm
    assert "functional_class_refs" in diag_comm
    assert "functional_classes" in diag_comm
    assert "audience" in diag_comm
    assert "protocol_snrefs" in diag_comm
    assert "protocols" in diag_comm
    assert "related_diag_comm_refs" in diag_comm
    assert "pre_condition_state_refs" in diag_comm
    assert "pre_condition_states" in diag_comm
    assert "state_transition_refs" in diag_comm
    assert "state_transitions" in diag_comm
    assert "semantic" in diag_comm
    assert diag_comm["semantic"] == "CURRENTDATA"
    assert "is_mandatory" in diag_comm
    assert "is_executable" in diag_comm
    assert "is_final" in diag_comm
    assert "comparam_refs" in diag_comm
    assert "comparams" in diag_comm
    assert "request_ref" in diag_comm
    assert "request" in diag_comm
    assert "pos_response_refs" in diag_comm
    assert "positive_responses" in diag_comm
    assert "neg_response_refs" in diag_comm
    assert "negative_responses" in diag_comm
    assert "is_cyclic" in diag_comm
    assert "is_multiple" in diag_comm
    assert "addressing" in diag_comm
    assert diag_comm["addressing"] == "PHYSICAL"
    assert "transmission_mode" in diag_comm
    assert "perma_id" in diag_comm
    assert diag_comm["perma_id"] == diag_comm_report_status_perma_id
    assert "ephemeral_id" in diag_comm
    assert "class_name" in diag_comm
    assert diag_comm["class_name"] == "DiagService"


def test_get_structured_data_by_perma_id_dtc(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    # Use perma_IDs to identify the "uint8_scale_linear_multiple" DOP
    dtc_perma_id = get_somersault_perma_id("somersault.DTC.dtc_1002", "somersault_base_variant")
    assert dtc_perma_id is not None

    # Get DTC "DTC_1002" of "somersault_base_variant" variant using GET /diagnostic-data-sets/{diag-data-set-id}/structured-data/{schema-name}/{perma-id}
    schema_name = "DiagnosticTroubleCode"
    # Retrieve structured data via a target schema name and a permanent ID using GET /structured-data/{schema-name}/{perma-id}
    response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/structured-data/{schema_name}/{dtc_perma_id}"
    )
    assert response.status_code == 200
    dtc = json_dict_from_response(response)

    assert "perma_id" in dtc
    assert dtc["perma_id"] == dtc_perma_id
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
