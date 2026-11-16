# SPDX-License-Identifier: AGPL-3.0-only
"""Tests for diagnostic-message encoding and decoding endpoints."""

from pathlib import Path

import odxtools
import pytest
from diag_server.message_layout import _bit_ranges, trace_message_layout
from odxtools.compumethods.limit import Limit
from odxtools.determinenumberofitems import DetermineNumberOfItems
from odxtools.dynamicendmarkerfield import DynamicEndmarkerField
from odxtools.dynamiclengthfield import DynamicLengthField
from odxtools.dynenddopref import DynEndDopRef
from odxtools.endofpdufield import EndOfPduField
from odxtools.environmentdata import EnvironmentData
from odxtools.environmentdatadescription import EnvironmentDataDescription
from odxtools.multiplexer import Multiplexer
from odxtools.multiplexercase import MultiplexerCase
from odxtools.multiplexerdefaultcase import MultiplexerDefaultCase
from odxtools.multiplexerswitchkey import MultiplexerSwitchKey
from odxtools.nameditemlist import NamedItemList
from odxtools.odxlink import OdxLinkId, OdxLinkRef
from odxtools.parameters.tablekeyparameter import TableKeyParameter
from odxtools.parameters.tablestructparameter import TableStructParameter
from odxtools.parameters.valueparameter import ValueParameter
from odxtools.request import Request
from odxtools.staticfield import StaticField
from odxtools.structure import Structure
from tests.utils import get_somersault_perma_id, json_dict_from_response


@pytest.mark.parametrize(
    "byte_position,bit_position,bit_length,reverse_bytes,expected",
    [
        (0, 0, 8, False, [{"start_bit": 0, "bit_length": 8}]),
        (2, 0, 1, False, [{"start_bit": 23, "bit_length": 1}]),
        (2, 7, 1, False, [{"start_bit": 16, "bit_length": 1}]),
        (1, 4, 12, False, [{"start_bit": 8, "bit_length": 12}]),
        (1, 0, 12, True, [
            {"start_bit": 8, "bit_length": 8},
            {"start_bit": 20, "bit_length": 4},
        ]),
    ],
)
def test_message_bit_ranges(
    byte_position, bit_position, bit_length, reverse_bytes, expected
) -> None:
    assert _bit_ranges(byte_position, bit_position, bit_length, reverse_bytes) == expected


@pytest.fixture
def layout_definitions():
    database = odxtools.load_pdx_file(Path(__file__).with_name('somersault.pdx'))
    layer = database.diag_layers.somersault_base_variant
    uint8 = layer.diag_data_dictionary_spec.data_object_props.uint8

    def identifier(name):
        return OdxLinkId(f'layout.{name}', uint8.odx_id.doc_fragments)

    def value(name, dop, position=0):
        return ValueParameter(short_name=name, byte_position=position, dop_ref=OdxLinkRef.from_id(dop.odx_id))

    record = Structure(short_name='Record', odx_id=identifier('Record'), parameters=NamedItemList([value('Value', uint8)]))
    record_ref = OdxLinkRef.from_id(record.odx_id)
    static = StaticField(short_name='Pair', odx_id=identifier('Pair'), structure_ref=record_ref, fixed_number_of_items=2, item_byte_size=1)
    length = DynamicLengthField(
        short_name='Counted', odx_id=identifier('Counted'), structure_ref=record_ref, offset=1,
        determine_number_of_items=DetermineNumberOfItems(byte_position=0, dop_ref=OdxLinkRef.from_id(uint8.odx_id)),
    )
    marker = DynamicEndmarkerField(
        short_name='Terminated', odx_id=identifier('Terminated'), structure_ref=record_ref,
        dyn_end_dop_ref=DynEndDopRef(uint8.odx_id.local_id, uint8.odx_id.doc_fragments, termination_value_raw='255'),
    )
    end = EndOfPduField(short_name='Remaining', odx_id=identifier('Remaining'), structure_ref=record_ref, min_number_of_items=0)
    envelope = Structure(short_name='Envelope', odx_id=identifier('Envelope'), parameters=NamedItemList([value('Rows', length)]))
    nested = StaticField(short_name='Envelopes', odx_id=identifier('Envelopes'), structure_ref=OdxLinkRef.from_id(envelope.odx_id), fixed_number_of_items=2, item_byte_size=3)
    mux = Multiplexer(
        short_name='Choice', odx_id=identifier('Choice'), byte_position=1,
        switch_key=MultiplexerSwitchKey(byte_position=0, dop_ref=OdxLinkRef.from_id(uint8.odx_id)),
        cases=NamedItemList([
            MultiplexerCase(short_name='Primary', lower_limit=Limit(value_raw='1'), upper_limit=Limit(value_raw='1'), structure_ref=OdxLinkRef.from_id(envelope.odx_id)),
            MultiplexerCase(short_name='Empty', lower_limit=Limit(value_raw='3'), upper_limit=Limit(value_raw='3')),
        ]),
        default_case=MultiplexerDefaultCase(short_name='Fallback', structure_ref=record_ref),
    )
    common = EnvironmentData(short_name='Common', odx_id=identifier('Common'), all_value=True, parameters=NamedItemList([value('CommonValue', uint8)]))
    specific = EnvironmentData(short_name='Specific', odx_id=identifier('Specific'), dtc_values=[1], parameters=NamedItemList([value('SpecificValue', uint8)]))
    environment = EnvironmentDataDescription(short_name='Snapshot', odx_id=identifier('Snapshot'), param_snref='DTC', env_datas=NamedItemList([common, specific]))
    definitions: list[Structure | StaticField | DynamicLengthField | DynamicEndmarkerField | EndOfPduField | Multiplexer | EnvironmentDataDescription] = [record, static, length, marker, end, envelope, nested, mux, environment]

    def request(parameters):
        message = Request(short_name='Layout', odx_id=identifier('Request'), parameters=NamedItemList(parameters))
        for definition in [*definitions, message]:
            database.odxlinks.update(definition._build_odxlinks())
        for definition in [*definitions, message]:
            definition._resolve_odxlinks(database.odxlinks)
        return message

    return {
        'static': static, 'length': length, 'marker': marker, 'end': end,
        'nested': nested, 'mux': mux, 'environment': environment,
        'uint8': uint8, 'layer': layer, 'request': request, 'value': value,
        'identifier': identifier,
    }


@pytest.mark.parametrize('kind,coded,offset', [
    ('static', '11 22', 0), ('length', '02 11 22', 8),
    ('marker', '11 22 FF', 0), ('end', '11 22', 0),
])
def test_layout_field_items(layout_definitions, kind, coded, offset):
    definitions = layout_definitions
    message = definitions['request']([definitions['value']('Items', definitions[kind])])
    layout = trace_message_layout(message, bytes.fromhex(coded))
    nodes = {node['path']: node for node in layout}
    assert nodes['Items[0]']['parent_path'] == 'Items'
    assert nodes['Items[1]']['parent_path'] == 'Items'
    assert nodes['Items[0].Value']['ranges'] == [{'start_bit': offset, 'bit_length': 8}]
    assert nodes['Items[1].Value']['ranges'] == [{'start_bit': offset + 8, 'bit_length': 8}]
    assert [node['physical_value'] for node in layout if node['node_type'] == 'item'] == [{'Value': 17}, {'Value': 34}]
    if kind == 'length':
        assert nodes['Items.$length']['ranges'] == [{'start_bit': 0, 'bit_length': 8}]
    if kind == 'marker':
        markers = [node for node in layout if node['node_type'] == 'end_marker']
        assert len(markers) == 1
        assert markers[0]['ranges'] == [{'start_bit': 16, 'bit_length': 8}]


def test_layout_nested_fields_and_empty_collection(layout_definitions):
    definitions = layout_definitions
    message = definitions['request']([definitions['value']('Items', definitions['nested'])])
    nodes = {node['path']: node for node in trace_message_layout(message, bytes.fromhex('02 11 22 02 33 44'))}
    assert nodes['Items[1].Rows[0]']['parent_path'] == 'Items[1].Rows'
    assert nodes['Items[1].Rows[1].Value']['physical_value'] == 68
    assert nodes['Items[1].Rows[1].Value']['ranges'] == [{'start_bit': 40, 'bit_length': 8}]
    empty = definitions['request']([
        definitions['value']('Header', definitions['uint8']),
        definitions['value']('Items', definitions['end'], 1),
    ])
    nodes = {node['path']: node for node in trace_message_layout(empty, bytes.fromhex('AA'))}
    assert nodes['Items']['physical_value'] == []
    assert nodes['Items']['ranges'] == []


@pytest.mark.parametrize('coded,case', [('01 02 11 22', 'Primary'), ('02 11', 'Fallback'), ('03', 'Empty')])
def test_layout_selected_multiplexer_branch(layout_definitions, coded, case):
    definitions = layout_definitions
    message = definitions['request']([definitions['value']('Payload', definitions['mux'])])
    nodes = {node['path']: node for node in trace_message_layout(message, bytes.fromhex(coded))}
    branch = nodes[f'Payload.{case}']
    assert branch['parent_path'] == 'Payload'
    assert branch['node_type'] == 'case'
    assert branch['related_parameter_path'] == 'Payload.$switch_key'
    assert not any(node['node_type'] == 'case' and node['short_name'] != case for node in nodes.values())
    if case == 'Primary':
        assert nodes['Payload.Primary.Rows[1].Value']['physical_value'] == 34


def test_layout_selected_environment_data(layout_definitions):
    definitions = layout_definitions
    message = definitions['request']([
        definitions['value']('DTC', definitions['uint8']),
        definitions['value']('Snapshot', definitions['environment'], 1),
    ])
    nodes = {node['path']: node for node in trace_message_layout(message, bytes.fromhex('01 11 22'))}
    assert nodes['Snapshot.Common']['parent_path'] == 'Snapshot'
    assert nodes['Snapshot.Specific']['node_type'] == 'environment_data'
    assert nodes['Snapshot.Specific']['related_parameter_path'] == 'DTC'
    assert nodes['Snapshot.Specific.SpecificValue']['ranges'] == [{'start_bit': 16, 'bit_length': 8}]


def test_layout_table_row_and_key(layout_definitions):
    definitions = layout_definitions
    table = definitions['layer'].diag_data_dictionary_spec.tables.last_flip_details
    key = TableKeyParameter(short_name='Key', odx_id=definitions['identifier']('Key'), table_ref=OdxLinkRef.from_id(table.odx_id))
    payload = TableStructParameter(short_name='Payload', byte_position=1, table_key_ref=OdxLinkRef.from_id(key.odx_id))
    message = definitions['request']([key, payload])
    nodes = {node['path']: node for node in trace_message_layout(message, bytes.fromhex('00 12'))}
    assert nodes['Payload.none']['node_type'] == 'row'
    assert nodes['Payload.none']['parent_path'] == 'Payload'
    assert nodes['Payload.none']['related_parameter_path'] == 'Key'
    assert nodes['Payload.none']['ranges'] == [{'start_bit': 8, 'bit_length': 8}]


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
    request_layout = {item["path"]: item for item in encoded_request["parameter_layout"]}
    assert request_layout["SID_RQ"]["ranges"] == [{"start_bit": 0, "bit_length": 8}]
    assert request_layout["TestFailed"]["ranges"] == [{"start_bit": 23, "bit_length": 1}]
    assert request_layout["WarningIndicatorRequested"]["ranges"] == [
        {"start_bit": 16, "bit_length": 1}
    ]

    decode_response = diag_client.post(
        f"{codec_path}/{request_id}/decode",
        json={"hex_message": encoded_request["hex_message"]},
    )
    assert decode_response.status_code == 200
    decoded_request = json_dict_from_response(decode_response)
    assert decoded_request["parameter_values"] == encoded_request["parameter_values"]
    assert decoded_request["parameter_layout"] == encoded_request["parameter_layout"]

    positive_response = service["positive_responses"][0]
    positive_values = request_values | {
        "DTCAndStatusRecord": [
            {
                "DTCRecord": 4097,
                "TestFailed": "true",
                "ConfirmedDTC": "true",
                "TestNotCompletedSinceLastClear": "false",
                "TestFailedSinceLastClear": "true",
            },
            {
                "DTCRecord": 4098,
                "TestFailed": "false",
                "ConfirmedDTC": "true",
                "TestNotCompletedSinceLastClear": "false",
                "TestFailedSinceLastClear": "false",
            },
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
    dtc_layout = next(
        item for item in encoded_positive["parameter_layout"]
        if item["path"] == "DTCAndStatusRecord[0].DTCRecord"
    )
    assert dtc_layout["ranges"] == [{"start_bit": 24, "bit_length": 24}]
    assert dtc_layout["physical_value"] == 4097
    second_dtc_layout = next(
        item for item in encoded_positive["parameter_layout"]
        if item["path"] == "DTCAndStatusRecord[1].DTCRecord"
    )
    assert second_dtc_layout["ranges"] == [{"start_bit": 56, "bit_length": 24}]
    assert second_dtc_layout["physical_value"] == 4098
    layout_by_path = {item["path"]: item for item in encoded_positive["parameter_layout"]}
    assert layout_by_path["DTCAndStatusRecord"]["dop_type"] == "EndOfPduField"
    assert layout_by_path["DTCAndStatusRecord[0]"]["parent_path"] == "DTCAndStatusRecord"
    assert layout_by_path["DTCAndStatusRecord[0]"]["node_type"] == "item"
    assert layout_by_path["DTCAndStatusRecord[1]"]["ranges"] == [
        {"start_bit": 56, "bit_length": 32}
    ]
    assert dtc_layout["parent_path"] == "DTCAndStatusRecord[0]"

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

    incomplete_request = diag_client.post(
        f"{codec_path}/{positive_response['perma_id']}/encode",
        json={
            "parameter_values": {"sault_time": 42},
            "request_parameter_values": {"num_flips": 3},
        },
    )
    assert incomplete_request.status_code == 400
    error = json_dict_from_response(incomplete_request)["exception"]
    assert "request_parameter_values" in error
    assert "forward_soberness_check" in error
    assert "request" in error.lower()
