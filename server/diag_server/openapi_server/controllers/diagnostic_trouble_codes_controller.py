# SPDX-License-Identifier: AGPL-3.0-only
import connexion

from diag_server import response_mapping
from typing import Dict
from typing import Tuple
from typing import Union

from diag_server.openapi_server.models.dtc_collection import DtcCollection  # noqa: E501
from diag_server.openapi_server.models.dtc_with_dop_info import DtcWithDopInfo  # noqa: E501
from diag_server.openapi_server.models.dtcs_of_variants_of_data_sets_collection import DtcsOfVariantsOfDataSetsCollection  # noqa: E501
from diag_server.openapi_server.models.json_problem import JsonProblem  # noqa: E501
from diag_server.openapi_server import util


def get_all_dtcs_from_all_diagnostic_data_sets(fields=None, body=None):  # noqa: E501
    """get_all_dtcs_from_all_diagnostic_data_sets

    Returns all diagnostic trouble codes from all existing BASE-VARIANT or ECU-VARIANT objects in all diagnostic data sets. # noqa: E501

    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id and ephemeral_id are always returned for any object.
    :type fields: List[str]
    :param body: The raw request body

    :rtype: DtcsOfVariantsOfDataSetsCollection
    """
    return response_mapping.get_all_dtcs_from_all_diagnostic_data_sets(fields=fields)


def get_dtc_by_perma_id(diag_data_set_id, variant_perma_id, dtc_perma_id, body=None):  # noqa: E501
    """get_dtc_by_perma_id

    Returns a diagnostic trouble code from the given BASE-VARIANT or ECU-VARIANT object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param dtc_perma_id: ID of the diagnostic trouble code to fetch
    :type dtc_perma_id: str
    :param body: The raw request body

    :rtype: DtcWithDopInfo
    """
    return response_mapping.get_dtc_by_perma_id(diag_data_set_id, variant_perma_id, dtc_perma_id)


def get_dtcs(diag_data_set_id, variant_perma_id, fields=None, body=None):  # noqa: E501
    """get_dtcs

    Returns the diagnostic trouble codes from the given BASE-VARIANT or ECU-VARIANT object. # noqa: E501

    :param diag_data_set_id: ID of the diagnostic data set to fetch
    :type diag_data_set_id: str
    :param variant_perma_id: ID of the variant object to fetch
    :type variant_perma_id: str
    :param fields: Filters the returned objects based on the list of given fields, i.e., only the fields specified are part of the object representation in the respone. Only the identification field, i.e. the perma_id and ephemeral_id are always returned for any object.
    :type fields: List[str]
    :param body: The raw request body

    :rtype: DtcCollection
    """
    return response_mapping.get_dtcs(diag_data_set_id, variant_perma_id, fields=fields)
