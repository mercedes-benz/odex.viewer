# SPDX-License-Identifier: AGPL-3.0-only
import os
from pathlib import Path

import pytest
from connexion import FlaskApp
from schemathesis import openapi
from schemathesis.specs.openapi.schemas import OpenApiSchema
from starlette.testclient import TestClient

from diag_server.model_utils import get_diag_data_set_perma_id
from diag_server.odx_util import DatabaseWithID
from diag_server.openapi_server import __main__ as server
from tests.utils import json_dict_from_response

pdx_file_path = Path(os.path.dirname(os.path.realpath(__file__))).joinpath("somersault.pdx")


@pytest.fixture(scope="module")
def diag_server() -> tuple[FlaskApp, TestClient, OpenApiSchema]:
    app = server.create_app()
    client = app.test_client()
    openapi_file = client.get("/v1/openapi.json")
    return (
        app,
        client,
        openapi.from_file(
            openapi_file.text,
        ),
    )


@pytest.fixture(scope="module")
def diag_server_app(diag_server) -> FlaskApp:
    return diag_server[0]


@pytest.fixture(scope="module")
def diag_client(diag_server) -> TestClient:
    return diag_server[1]


@pytest.fixture(scope="module")
def diag_schema(diag_server) -> OpenApiSchema:
    return diag_server[2]


@pytest.fixture(scope="module")
def somersault_data_set_perma_id() -> str:
    # Load the PDX file into an ODX database and get the perma_id of the data set for the tests.
    odx_db = DatabaseWithID()

    odx_db.add_pdx_file(pdx_file_path)
    odx_db.refresh()

    return get_diag_data_set_perma_id(odx_db=odx_db, file_name=pdx_file_path.name)


@pytest.fixture(scope="function")
def upload_pdx_data(diag_client):
    upload_endpoint = "/v1/diagnostic-data-sets/PDX"

    pdx_upload_files = {
        "file_content": (
            "somersault.pdx",
            pdx_file_path.read_bytes(),
            "application/octet-stream",
        )
    }
    pdx_upload_data = {"display_name": "Somersault ECU"}
    response = diag_client.post(
        upload_endpoint,
        data=pdx_upload_data,
        files=pdx_upload_files,
    )

    assert response.status_code == 201
    resp_dict = json_dict_from_response(response)
    assert resp_dict is not None
    assert "id" in resp_dict

    # Extract the id for the following requests
    db_id = resp_dict["id"]

    yield

    # Check if PDX data is present or not
    response = diag_client.get(upload_endpoint)
    assert response.status_code == 200
    resp_dict = json_dict_from_response(response)
    assert "items" in resp_dict

    if len(resp_dict["items"]) > 0:
        db_endpoint = "".join([upload_endpoint, "/", db_id])
        # Cleanup uploaded PDX data by deleting it via the API
        response = diag_client.delete(db_endpoint)
        assert response.status_code == 204
