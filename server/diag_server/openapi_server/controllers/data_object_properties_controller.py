# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.dop_collection import DopCollection  # noqa: E501
from diag_server.openapi_server.models.dop_with_origin_layer_info import DopWithOriginLayerInfo  # noqa: E501
from diag_server.openapi_server.models.dops_of_variants_of_data_sets_collection import DopsOfVariantsOfDataSetsCollection  # noqa: E501
from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server import util


def get_all_dops_from_all_diagnostic_data_sets(fields=None, body=None):  # noqa: E501
    """get_all_dops_from_all_diagnostic_data_sets

    Returns all data object properties from all existing BASE-VARIANT or ECU-VARIANT objects in all diagnostic data sets. # noqa: E501

    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id and ephemeral_id are always returned for any object.
    :type fields: List[str]
    :param body: The raw request body

    :rtype: DopsOfVariantsOfDataSetsCollection
    """
    return response_mapping.get_all_dops_from_all_diagnostic_data_sets(fields=fields)


def get_dop_by_perma_id(diag_data_set_id, variant_perma_id, dop_perma_id, body=None):  # noqa: E501
    """get_dop_by_perma_id

    Returns a data object property from the given BASE-VARIANT or ECU-VARIANT object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param dop_perma_id: ID of the diagnostic object property to fetch
    :type dop_perma_id: str
    :param body: The raw request body

    :rtype: DopWithOriginLayerInfo
    """
    return response_mapping.get_dop_by_perma_id(diag_data_set_id, variant_perma_id, dop_perma_id)


def get_dops(diag_data_set_id, variant_perma_id, fields=None, body=None):  # noqa: E501
    """get_dops

    Returns the data object properties from the given BASE-VARIANT or ECU-VARIANT object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id and ephemeral_id are always returned for any object.
    :type fields: List[str]
    :param body: The raw request body

    :rtype: DopCollection
    """
    return response_mapping.get_dops(diag_data_set_id, variant_perma_id, fields=fields)
