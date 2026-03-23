# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server.models.revision_history import RevisionHistory  # noqa: E501
from diag_server.openapi_server import util


def get_revision_history_of_diagnostic_data_set(diag_data_set_id, body=None):  # noqa: E501
    """get_revision_history_of_diagnostic_data_set

    Returns the revision history of the main diagnostic layer container for a given diagnostic data set. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param body: The raw request body

    :rtype: RevisionHistory
    """
    return response_mapping.get_revision_history_of_diagnostic_data_set(diag_data_set_id)


def get_revision_history_of_variant(diag_data_set_id, perma_id, body=None):  # noqa: E501
    """get_revision_history_of_variant

    Returns the revision history of a given BASE-VARIANT or ECU-VARIANT object from the given diagnostic data set. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param perma_id: The permanent ID of the object to fetch
    :type perma_id: str
    :param body: The raw request body

    :rtype: RevisionHistory
    """
    return response_mapping.get_revision_history_of_variant(diag_data_set_id, perma_id)
