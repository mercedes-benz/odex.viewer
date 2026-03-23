# SPDX-License-Identifier: AGPL-3.0-only
#!/usr/bin/env python3
import importlib.resources as pkg_resources
import io
import mimetypes
import os

import connexion
from connexion.apps.flask import FlaskApp
from connexion.middleware import MiddlewarePosition
from diag_server import const
from diag_server.globals import logger
from diag_server.openapi_server import api_jsonifier
from flask import Response, send_file, send_from_directory
from starlette.middleware.cors import CORSMiddleware

frontend_path_rel = ''

DEFAULT_PKG_UI_STATIC_EXPORT_PATH = os.path.join(os.path.dirname(__file__), 'frontend')

def frontend(path: str | None = None) -> Response:
    _, ext = os.path.splitext(path) if path else (None, None)
    if const.DIAG_UI_STATIC_EXPORT_PATH == DEFAULT_PKG_UI_STATIC_EXPORT_PATH:
        mimetype = 'text/html'
        
        if not path or path == '' or path.startswith('index'):
            data = pkg_resources.files('diag_server.openapi_server.frontend').joinpath('index.html').read_bytes()
        elif ext is not None and len(ext) > 0 and not path.endswith('.html'):
            filename = os.path.basename(path)
            mime, _ = mimetypes.guess_type(filename)
            if mime:
                mimetype = mime
            data = pkg_resources.files('diag_server.openapi_server.frontend').joinpath(path).read_bytes()
        else:
            data = pkg_resources.files('diag_server.openapi_server.frontend').joinpath(f'{path}.html').read_bytes()
        return send_file(io.BytesIO(data), mimetype=mimetype)
    else:
        if not path or path == '' or path.startswith('index'):
            return send_from_directory(frontend_path_rel, 'index.html')
        elif ext is not None and len(ext) > 0 and not path.endswith('.html'):
            return send_from_directory(frontend_path_rel, path)
        else:
            return send_from_directory(frontend_path_rel, f'{path}.html')


def create_app() -> FlaskApp:
    # TODO: Deactivate response validation due to problems with the use of "oneOf" in schema definitions, e.g., for representing nesting in SDGs
    app = connexion.App(__name__, specification_dir='./openapi/', validate_responses=False)
    
    # Check if the resolved or default frontend export path does exist, if not look for "frontend" directory within the server folder, i.e., DEFAULT_UI_STATIC_PATH
    if not os.path.isdir(const.DEFAULT_DEV_UI_STATIC_EXPORT_PATH) or const.DIAG_UI_STATIC_EXPORT_PATH is None:
        logger.debug("The configured frontend export path does not exist: %s. Instead the default 'frontend' directory within the server folder is used.",
                const.DIAG_UI_STATIC_EXPORT_PATH)
        
        const.DIAG_UI_STATIC_EXPORT_PATH = DEFAULT_PKG_UI_STATIC_EXPORT_PATH
        logger.warning("The default frontend export path is used: %s. Please make sure to build the frontend of odex.viewer and export it to this path or set the environment variable 'DIAG_UI_STATIC_EXPORT_PATH' to the correct path.",
                const.DIAG_UI_STATIC_EXPORT_PATH)
        

    if const.DIAG_SERVER_SERVE_UI_ENABLED and os.path.isdir(const.DIAG_UI_STATIC_EXPORT_PATH) and os.listdir(const.DIAG_UI_STATIC_EXPORT_PATH):
        global frontend_path_rel
        
        logger.info("Serving the frontend of odex.viewer via the backend server is activated. Static files are served from the following folder: %s.",
                const.DIAG_UI_STATIC_EXPORT_PATH)
        
        # Due to the different 'current working directories' of the python interpretor and the Flask server, we have to resolve the actual relative path between them
        flask_path = os.path.abspath(app.app.root_path)
        frontend_files_path = os.path.abspath(const.DIAG_UI_STATIC_EXPORT_PATH)
        frontend_path_rel = os.path.relpath(frontend_files_path, flask_path)
        # Add a URL rule to the static export of the frontend
        app.add_url_rule("/", "frontend", frontend)
        app.add_url_rule("/<path:path>", "frontend", frontend)

    app.add_api('openapi.yaml',
                arguments={
                    'title': 'RESTful HTTP API documentation of the odex.viewer backend server'},
                pythonic_params=True, jsonifier=api_jsonifier.APIJsonifier()) # type: ignore[no-untyped-call]

    # Add CORS Middleware for handling CORS headers
    app.add_middleware(
        CORSMiddleware,
        position=MiddlewarePosition.BEFORE_EXCEPTION,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


def main() -> None:
    app = create_app()

    logger.info("The odex.viewer backend server is running. Open the entry page: %s",
                const.DIAG_SERVER_BASE_URI)
    logger.info("Or open the SwaggerUI of the OpenAPI documentation: %s/v1/ui",
                const.DIAG_SERVER_BASE_URI)

    app.run(host=const.DIAG_SERVER_SOCKET_ADDRESS,
            port=int(const.DIAG_SERVER_PORT), lifespan="on")


if __name__ == '__main__':
    main()
