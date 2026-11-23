# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.decode_diagnostic_message_input import DecodeDiagnosticMessageInput  # noqa: E501
from diag_server.openapi_server.models.diagnostic_message_codec_result import DiagnosticMessageCodecResult  # noqa: E501
from diag_server.openapi_server.models.encode_diagnostic_message_input import EncodeDiagnosticMessageInput  # noqa: E501
from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server import util


def decode_diagnostic_message(diag_data_set_id, variant_perma_id, diag_comm_perma_id, message_perma_id, decode_diagnostic_message_input=None, body=None):  # noqa: E501
    """decode_diagnostic_message

    Decode hexadecimal message bytes using the request or response identified by message-perma-id. The message must belong to the selected diagnostic service, and the service must belong to the selected variant. Decoding returns physical parameter values, including constants and derived parameters. No triggering-request values or bytes are required for decoding. Matching-request parameters are extracted from the supplied message; they are not checked against an original request. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param diag_comm_perma_id: ID of the diagnostic communication to fetch
    :type diag_comm_perma_id: str
    :param message_perma_id:
    :type message_perma_id: str
    :param decode_diagnostic_message_input:
    :type decode_diagnostic_message_input: dict | bytes
    :param body: The raw request body

    :rtype: DiagnosticMessageCodecResult
    """
    if 'content-type' in connexion.request.headers:
        if body:
            if connexion.request.headers['content-type'] == 'application/json':
                decode_diagnostic_message_input = DecodeDiagnosticMessageInput.from_dict(body)  # noqa: E501
            else:
                decode_diagnostic_message_input = body
    return response_mapping.decode_diagnostic_message(diag_data_set_id, variant_perma_id, diag_comm_perma_id, message_perma_id, decode_diagnostic_message_input)


def encode_diagnostic_message(diag_data_set_id, variant_perma_id, diag_comm_perma_id, message_perma_id, encode_diagnostic_message_input=None, body=None):  # noqa: E501
    """encode_diagnostic_message

    Encode the request or response identified by message-perma-id using its ODX parameter definitions. The message must belong to the selected diagnostic service, and the service must belong to the selected variant. For a request message, parameter_values contains the request values and request_parameter_values must be omitted. For a response message, parameter_values contains the response values and request_parameter_values is required, including an empty object when the request has no required physical values. The backend first encodes the service request from request_parameter_values, then uses those bytes as the triggering request when encoding the response. This applies to positive and negative responses, including responses with matching-request parameters. Clients cannot supply encoded triggering-request bytes. This operation does not transmit data to an ECU. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param diag_comm_perma_id: ID of the diagnostic communication to fetch
    :type diag_comm_perma_id: str
    :param message_perma_id:
    :type message_perma_id: str
    :param encode_diagnostic_message_input:
    :type encode_diagnostic_message_input: dict | bytes
    :param body: The raw request body

    :rtype: DiagnosticMessageCodecResult
    """
    if 'content-type' in connexion.request.headers:
        if body:
            if connexion.request.headers['content-type'] == 'application/json':
                encode_diagnostic_message_input = EncodeDiagnosticMessageInput.from_dict(body)  # noqa: E501
            else:
                encode_diagnostic_message_input = body
    return response_mapping.encode_diagnostic_message(diag_data_set_id, variant_perma_id, diag_comm_perma_id, message_perma_id, encode_diagnostic_message_input)
