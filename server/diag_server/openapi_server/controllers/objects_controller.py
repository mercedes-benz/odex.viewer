# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server.models.object_metadata import ObjectMetadata  # noqa: E501
from diag_server.openapi_server import util


def get_metadata_by_perma_id_from_diagnostic_data_set(diag_data_set_id, perma_id, resolve_main_diag_layer=None, body=None):  # noqa: E501
    """get_metadata_by_perma_id_from_diagnostic_data_set

    Returns metadata for the given object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str
    :param resolve_main_diag_layer: Whether the main diagnostic layer container of a diagnostic data object shall be resolved automatically or not.
    :type resolve_main_diag_layer: bool
    :param body: The raw request body

    :rtype: ObjectMetadata
    """
    return response_mapping.get_metadata_by_perma_id_from_diagnostic_data_set(diag_data_set_id, perma_id, resolve_main_diag_layer=resolve_main_diag_layer)


def get_metadata_of_object_by_ephemeral_id(ephemeral_id, resolve_main_diag_layer=None, body=None):  # noqa: E501
    """get_metadata_of_object_by_ephemeral_id

    Returns metadata for the given object. # noqa: E501

    :param ephemeral_id: The ephemeral ID of the object to fetch
    :type ephemeral_id: int
    :param resolve_main_diag_layer: Whether the main diagnostic layer container of a diagnostic data object shall be resolved automatically or not.
    :type resolve_main_diag_layer: bool
    :param body: The raw request body

    :rtype: ObjectMetadata
    """
    return response_mapping.get_metadata_of_object_by_ephemeral_id(ephemeral_id, resolve_main_diag_layer=resolve_main_diag_layer)


def get_object_by_ephemeral_id(ephemeral_id, body=None):  # noqa: E501
    """get_object_by_ephemeral_id

    Returns the given object from the Server # noqa: E501

    :param ephemeral_id: The ephemeral ID of the object to fetch
    :type ephemeral_id: int
    :param body: The raw request body

    :rtype: object
    """
    return response_mapping.get_object_by_ephemeral_id(ephemeral_id)


def get_object_by_perma_id_from_diagnostic_data_set(diag_data_set_id, perma_id, body=None):  # noqa: E501
    """get_object_by_perma_id_from_diagnostic_data_set

    Returns the given object from the Server # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str
    :param body: The raw request body

    :rtype: object
    """
    return response_mapping.get_object_by_perma_id_from_diagnostic_data_set(diag_data_set_id, perma_id)
