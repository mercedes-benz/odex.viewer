# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.diagnostic_variant import DiagnosticVariant  # noqa: E501
from diag_server.openapi_server.models.diagnostic_variants_collection import DiagnosticVariantsCollection  # noqa: E501
from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server import util


def get_diagnostic_variant(diag_data_set_id, variant_perma_id, body=None):  # noqa: E501
    """get_diagnostic_variant

    Returns a single diagnostic variant with the given ID, if there exists one. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param body: The raw request body

    :rtype: DiagnosticVariant
    """
    return response_mapping.get_diagnostic_variant(diag_data_set_id, variant_perma_id)


def get_diagnostic_variants_of_diagnostic_data_set(diag_data_set_id, filter_variants_by_perma_ids=None, body=None):  # noqa: E501
    """get_diagnostic_variants_of_diagnostic_data_set

    Returns the list of diagnostic variants from the given diagnostic data set. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param filter_variants_by_perma_ids: Filters the collection of variants provided by a diagnostic data object based on the provided list of permanent object-ids.
    :type filter_variants_by_perma_ids: List[str]
    :param body: The raw request body

    :rtype: DiagnosticVariantsCollection
    """
    return response_mapping.get_diagnostic_variants_of_diagnostic_data_set(diag_data_set_id, filter_variants_by_perma_ids=filter_variants_by_perma_ids)
