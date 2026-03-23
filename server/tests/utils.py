# SPDX-License-Identifier: AGPL-3.0-only
import json
from typing import Any

from httpx import Response
from odxtools.element import IdentifiableElement
from odxtools.odxlink import DocType, OdxDocFragment, OdxLinkId

from diag_server.model_utils import get_perma_id


def json_dict_from_response(response: Response) -> Any:
    """
    Converts a response into JSON and returns a respective python object.

    :param response: The response of an HTTP-request to parse the body/data from.

    :returns: The parsed JSON value.
    """

    assert response.text is not None
    return json.loads(response.text)


def get_somersault_perma_id(obj_odx_id: str, parent_doc_fragment_name) -> str | None:
    """
    Resolves the permanent ID for a specific element from the somersault PDX based on the given ODX ID and its parent document fragment name.

    :param obj_odx_id: The odx-id of the element to get a permanent ID for.
    :param parent_doc_fragment_name: The name of the document fragment the requested element is located in.

    :returns: The permanent ID of the requested object, if one could be resolved, else None.
    """

    # Build required dict structure to resolve permanent ID with model_utils.get_perma_id() function, use dummy values for properties which are not relevant for resolving the permanent ID
    obj = IdentifiableElement(
        short_name="short_name",
        odx_id=OdxLinkId(
            obj_odx_id,
            (OdxDocFragment(parent_doc_fragment_name, DocType.CONTAINER),),
        ),
    )

    return get_perma_id(obj)
