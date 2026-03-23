# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server.models.odx_any import OdxAny  # noqa: E501
from diag_server.openapi_server.models.odx_schema_names import OdxSchemaNames  # noqa: E501
from diag_server.openapi_server import util


def get_structured_data_by_ephemeral_id(schema_name, ephemeral_id, body=None):  # noqa: E501
    """get_structured_data_by_ephemeral_id

    Structured data retrieval by providing the target schema name and the ephemeral object-id to be retrieved. # noqa: E501

    :param schema_name: Name of the schema to be retrieved
    :type schema_name: dict | bytes
    :param ephemeral_id: The ephemeral ID of the object to fetch
    :type ephemeral_id: int
    :param body: The raw request body

    :rtype: OdxAny
    """
    return response_mapping.get_structured_data_by_ephemeral_id(schema_name, ephemeral_id)


def get_structured_data_by_perma_id_from_diagnostic_data_set(diag_data_set_id, schema_name, perma_id, body=None):  # noqa: E501
    """get_structured_data_by_perma_id_from_diagnostic_data_set

    Structured data retrieval by providing the target schema name and the permanent object-id to be retrieved. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param schema_name: Name of the schema to be retrieved
    :type schema_name: dict | bytes
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str
    :param body: The raw request body

    :rtype: OdxAny
    """
    return response_mapping.get_structured_data_by_perma_id_from_diagnostic_data_set(diag_data_set_id, schema_name, perma_id)
