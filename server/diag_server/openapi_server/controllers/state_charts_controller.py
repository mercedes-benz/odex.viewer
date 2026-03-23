# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server.models.state_chart_collection import StateChartCollection  # noqa: E501
from diag_server.openapi_server.models.state_chart_with_meta_data import StateChartWithMetaData  # noqa: E501
from diag_server.openapi_server.models.state_chart_with_meta_data_collection import StateChartWithMetaDataCollection  # noqa: E501
from diag_server.openapi_server import util


def get_all_state_charts_from_all_diagnostic_data_sets(body=None):  # noqa: E501
    """get_all_state_charts_from_all_diagnostic_data_sets

    Returns the collection of all state charts in all diagnostic data sets. # noqa: E501

    :param body: The raw request body

    :rtype: StateChartWithMetaDataCollection
    """
    return response_mapping.get_all_state_charts_from_all_diagnostic_data_sets()


def get_state_chart_by_perma_id(diag_data_set_id, variant_perma_id, state_chart_perma_id, body=None):  # noqa: E501
    """get_state_chart_by_perma_id

    Returns a state chart from the given BASE-VARIANT or ECU-VARIANT object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param state_chart_perma_id: ID of the state chart
    :type state_chart_perma_id: str
    :param body: The raw request body

    :rtype: StateChartWithMetaData
    """
    return response_mapping.get_state_chart_by_perma_id(diag_data_set_id, variant_perma_id, state_chart_perma_id)


def get_state_charts(diag_data_set_id, variant_perma_id, body=None):  # noqa: E501
    """get_state_charts

    Returns the state charts from the given BASE-VARIANT or ECU-VARIANT object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param body: The raw request body

    :rtype: StateChartCollection
    """
    return response_mapping.get_state_charts(diag_data_set_id, variant_perma_id)
