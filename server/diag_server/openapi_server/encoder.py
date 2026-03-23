# SPDX-License-Identifier: AGPL-3.0-only
import json
from typing import Any

from connexion.jsonifier import wrap_default
from diag_server.openapi_server.models.base_model import Model


class APIJSONEncoder(json.JSONEncoder):
    """The API JSON encoder. Handles custom API model types compared to the
    connexion :class:`connexion.jsonifier.JSONEncoder`.
    """
    include_nulls = False

    @wrap_default # type: ignore[untyped-decorator]
    def default(self, o: object) -> Any:
        if isinstance(o, Model):
            dikt = {}
            for attr in o.openapi_types:
                value = getattr(o, attr)
                if value is None and not self.include_nulls:
                    continue
                attr = o.attribute_map[attr]
                dikt[attr] = value
            return dikt
        return super().default(o)
