# SPDX-License-Identifier: AGPL-3.0-only
import json

from connexion.jsonifier import Jsonifier

from .encoder import APIJSONEncoder


class APIJsonifier(Jsonifier): # type: ignore[misc]
    """
    Central point to serialize and deserialize to/from odxtools model types.
    """

    def __init__(self, json_=json, **kwargs): # type: ignore[no-untyped-def]
        super().__init__(json_=json_, **kwargs)
        self.dumps_args = kwargs
        self.dumps_args.setdefault("cls", APIJSONEncoder)
