# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.created_resource_reference import CreatedResourceReference  # noqa: E501
from diag_server.openapi_server.models.diagnostic_data_collection import DiagnosticDataCollection  # noqa: E501
from diag_server.openapi_server.models.diagnostic_data_type import DiagnosticDataType  # noqa: E501
from diag_server.openapi_server.models.diagnostic_data_type_collection import DiagnosticDataTypeCollection  # noqa: E501
from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server.models.upload_diagnostic_data_to_server_request_metadata import UploadDiagnosticDataToServerRequestMetadata  # noqa: E501
from diag_server.openapi_server import util


def delete_all_diagnostic_data_from_type(data_type, body=None):  # noqa: E501
    """delete_all_diagnostic_data_from_type

    Deletes all diagnostic data set for the specified data type of the server. # noqa: E501

    :param data_type: The type of diagnostic data to fetch
    :type data_type: dict | bytes
    :param body: The raw request body

    :rtype: None
    """
    return response_mapping.delete_all_diagnostic_data_from_type(data_type)


def delete_diagnostic_data_from_type(data_type, diag_data_set_id, body=None):  # noqa: E501
    """delete_diagnostic_data_from_type

    Deletes a specific diagnostic data set resource from the specified data type of the server. # noqa: E501

    :param data_type: The type of diagnostic data to fetch
    :type data_type: dict | bytes
    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param body: The raw request body

    :rtype: None
    """
    return response_mapping.delete_diagnostic_data_from_type(data_type, diag_data_set_id)


def get_diagnostic_data_collection_of_type(data_type, body=None):  # noqa: E501
    """get_diagnostic_data_collection_of_type

    Returns the collection of diagnostic data descriptors of a specific type of diagnostic data set of the Server # noqa: E501

    :param data_type: The type of diagnostic data to fetch
    :type data_type: dict | bytes
    :param body: The raw request body

    :rtype: DiagnosticDataCollection
    """
    return response_mapping.get_diagnostic_data_collection_of_type(data_type)


def get_diagnostic_data_types(body=None):  # noqa: E501
    """get_diagnostic_data_types

    Returns the collection of diagnostic data types of the server. # noqa: E501

    :param body: The raw request body

    :rtype: DiagnosticDataTypeCollection
    """
    return response_mapping.get_diagnostic_data_types()


def upload_diagnostic_data_to_server(data_type, metadata=None, file_content=None, body=None):  # noqa: E501
    """upload_diagnostic_data_to_server

    Upload diagnostic data set to the server. # noqa: E501

    :param data_type: The type of diagnostic data to fetch
    :type data_type: dict | bytes
    :param metadata: 
    :type metadata: dict | bytes
    :param file_content: 
    :type file_content: werkzeug.datastructures.FileStorage
    :param body: The raw request body

    :rtype: CreatedResourceReference
    """
    if 'content-type' in connexion.request.headers:
        if body:
            if connexion.request.headers['content-type'] == 'application/json':
                metadata = UploadDiagnosticDataToServerRequestMetadata.from_dict(body)  # noqa: E501
            else:
                metadata = body
    return response_mapping.upload_diagnostic_data_to_server(data_type, metadata=metadata, file_content=file_content)
