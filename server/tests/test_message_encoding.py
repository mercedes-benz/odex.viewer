# SPDX-License-Identifier: AGPL-3.0-only
"""Tests for diagnostic-message encoding and decoding endpoints."""


from tests.utils import get_somersault_perma_id, json_dict_from_response


def test_encode_and_decode_report_dtc_messages(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    variant_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    service_id = get_somersault_perma_id(
        "somersault.service.ReportDTCByStatusMask", "somersault_base_variant"
    )
    assert variant_id is not None
    assert service_id is not None

    service_response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{variant_id}/diag-comms/{service_id}"
    )
    assert service_response.status_code == 200
    service = json_dict_from_response(service_response)
    codec_path = (
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{variant_id}"
        f"/diag-comms/{service_id}/messages"
    )
    request_values = dict.fromkeys(
        (
            "TestFailed",
            "TestFailedThisOperationCycle",
            "PendingDTC",
            "ConfirmedDTC",
            "TestNotCompletedSinceLastClear",
            "TestFailedSinceLastClear",
            "TestNotCompletedThisOperationCycle",
            "WarningIndicatorRequested",
        ),
        "false",
    )

    request_id = service["request"]["perma_id"]
    encode_response = diag_client.post(
        f"{codec_path}/{request_id}/encode", json={"parameter_values": request_values}
    )
    assert encode_response.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}/messages/{message-perma-id}/encode"
    ]["POST"].validate_response(encode_response)
    encoded_request = json_dict_from_response(encode_response)
    assert encoded_request["hex_message"] == "19 02 00"
    assert encoded_request["parameter_values"]["SID_RQ"] == 0x19

    decode_response = diag_client.post(
        f"{codec_path}/{request_id}/decode",
        json={"hex_message": encoded_request["hex_message"]},
    )
    assert decode_response.status_code == 200
    decoded_request = json_dict_from_response(decode_response)
    assert decoded_request["parameter_values"] == encoded_request["parameter_values"]

    positive_response = service["positive_responses"][0]
    positive_values = request_values | {
        "DTCAndStatusRecord": [
            {
                "DTCRecord": 4097,
                "TestFailed": "true",
                "ConfirmedDTC": "true",
                "TestNotCompletedSinceLastClear": "false",
                "TestFailedSinceLastClear": "true",
            }
        ]
    }
    positive_encode = diag_client.post(
        f"{codec_path}/{positive_response['perma_id']}/encode",
        json={
            "parameter_values": positive_values,
            "request_parameter_values": request_values,
        },
    )
    assert positive_encode.status_code == 200
    encoded_positive = json_dict_from_response(positive_encode)
    assert encoded_positive["hex_message"].startswith("59 02")
    assert encoded_positive["parameter_values"]["DTCAndStatusRecord"][0]["DTCRecord"] == 4097

    negative_response = service["negative_responses"][0]
    negative_encode = diag_client.post(
        f"{codec_path}/{negative_response['perma_id']}/encode",
        json={
            "parameter_values": {"response_code": 49},
            "request_parameter_values": request_values,
        },
    )
    assert negative_encode.status_code == 200
    encoded_negative = json_dict_from_response(negative_encode)
    assert encoded_negative["hex_message"] == "7F 19 31"
    assert encoded_negative["parameter_values"]["rq_sid"] == 0x19

    missing_triggering_request = diag_client.post(
        f"{codec_path}/{negative_response['perma_id']}/encode",
        json={"parameter_values": {"response_code": 49}},
    )
    assert missing_triggering_request.status_code == 400

    invalid_hex = diag_client.post(
        f"{codec_path}/{request_id}/decode", json={"hex_message": "19 02 0"}
    )
    assert invalid_hex.status_code == 400


def test_encode_and_decode_tester_present_messages(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    variant_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    service_id = get_somersault_perma_id(
        "somersault.service.tester_present", "somersault_base_variant"
    )
    assert variant_id is not None
    assert service_id is not None

    service_response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{variant_id}/diag-comms/{service_id}"
    )
    assert service_response.status_code == 200
    service = json_dict_from_response(service_response)
    assert service["short_name"] == "tester_present"

    codec_path = (
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{variant_id}"
        f"/diag-comms/{service_id}/messages"
    )
    request_id = service["request"]["perma_id"]
    request_encode = diag_client.post(
        f"{codec_path}/{request_id}/encode", json={"parameter_values": {}}
    )
    assert request_encode.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}/messages/{message-perma-id}/encode"
    ]["POST"].validate_response(request_encode)
    encoded_request = json_dict_from_response(request_encode)
    assert encoded_request["hex_message"] == "3E 00"

    request_decode = diag_client.post(
        f"{codec_path}/{request_id}/decode",
        json={"hex_message": encoded_request["hex_message"]},
    )
    assert request_decode.status_code == 200
    decoded_request = json_dict_from_response(request_decode)
    assert decoded_request["parameter_values"] == {"sid": 0x3E, "id": 0}

    positive_response = service["positive_responses"][0]
    response_encode = diag_client.post(
        f"{codec_path}/{positive_response['perma_id']}/encode",
        json={"parameter_values": {}, "request_parameter_values": {}},
    )
    assert response_encode.status_code == 200
    encoded_response = json_dict_from_response(response_encode)
    assert encoded_response["hex_message"] == "7E 00"

    response_decode = diag_client.post(
        f"{codec_path}/{positive_response['perma_id']}/decode",
        json={"hex_message": encoded_response["hex_message"]},
    )
    assert response_decode.status_code == 200
    decoded_response = json_dict_from_response(response_decode)
    assert decoded_response["parameter_values"]["status"] == 0


def test_encode_and_decode_forward_flips_messages(
    diag_schema, diag_client, upload_pdx_data, somersault_data_set_perma_id
) -> None:
    variant_id = get_somersault_perma_id(
        "somersault.base_variant", "somersault_base_variant"
    )
    service_id = get_somersault_perma_id(
        "somersault.service.do_forward_flips", "somersault_base_variant"
    )
    assert variant_id is not None
    assert service_id is not None

    service_response = diag_client.get(
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{variant_id}/diag-comms/{service_id}"
    )
    assert service_response.status_code == 200
    service = json_dict_from_response(service_response)
    assert service["short_name"] == "do_forward_flips"

    codec_path = (
        f"/v1/diagnostic-data-sets/{somersault_data_set_perma_id}/variants/{variant_id}"
        f"/diag-comms/{service_id}/messages"
    )
    request_values = {"forward_soberness_check": 18, "num_flips": 3}
    request_id = service["request"]["perma_id"]
    request_encode = diag_client.post(
        f"{codec_path}/{request_id}/encode", json={"parameter_values": request_values}
    )
    assert request_encode.status_code == 200
    diag_schema[
        "/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}/messages/{message-perma-id}/encode"
    ]["POST"].validate_response(request_encode)
    encoded_request = json_dict_from_response(request_encode)
    assert encoded_request["hex_message"] == "BA 12 03"

    request_decode = diag_client.post(
        f"{codec_path}/{request_id}/decode",
        json={"hex_message": encoded_request["hex_message"]},
    )
    assert request_decode.status_code == 200
    decoded_request = json_dict_from_response(request_decode)
    assert decoded_request["parameter_values"]["forward_soberness_check"] == 18
    assert decoded_request["parameter_values"]["num_flips"] == 3

    positive_response = service["positive_responses"][0]
    response_encode = diag_client.post(
        f"{codec_path}/{positive_response['perma_id']}/encode",
        json={
            "parameter_values": {"sault_time": 42},
            "request_parameter_values": request_values,
        },
    )
    assert response_encode.status_code == 200
    encoded_response = json_dict_from_response(response_encode)
    assert encoded_response["hex_message"] == "FA 03 2A"
    assert encoded_response["parameter_values"]["num_flips_done"] == 3
    assert encoded_response["parameter_values"]["sault_time"] == 42

    response_decode = diag_client.post(
        f"{codec_path}/{positive_response['perma_id']}/decode",
        json={"hex_message": encoded_response["hex_message"]},
    )
    assert response_decode.status_code == 200
    decoded_response = json_dict_from_response(response_decode)
    assert decoded_response["parameter_values"]["num_flips_done"] == 3
    assert decoded_response["parameter_values"]["sault_time"] == 42
