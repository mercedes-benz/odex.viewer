# SPDX-License-Identifier: AGPL-3.0-only
from connexion.apps.flask import FlaskApp

from diag_server.openapi_server import __main__ as server


def make_app() -> FlaskApp:
    return server.create_app()


server_app: FlaskApp = make_app()
