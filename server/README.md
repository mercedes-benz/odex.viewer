<!-- SPDX-License-Identifier: AGPL-3.0-only -->

# The odex.viewer Backend Server

The odex.viewer backend server provides a RESTfull HTTP API server to manage, retrieve and interact with automotive diagnostic data descriptions using the [ODX file format](https://www.asam.net/standards/detail/mcd-2-d/). It is implemented using the Python programming language, the [Flask](https://flask.palletsprojects.com/) HTTP server framework, and [`odxtools`](https://github.com/mercedes-benz/odxtools) for interacting with the ODX datasets.

## Prerequisites

The odex.viewer backend server requires **Python 3.10** or later.

You can verify if your Python installation is sufficient using the following command:

```shell
python --version
```

### List of Recommended/Tested Versions of all Requirements

- Python: v3.13.9
- Java: v21.0.5 (only needed for OpenAPI code generation)

## Getting Started

Clone this repository and after all [prerequisites](#prerequisites) are fulfilled, all required Python modules need to be installed before you are able to run the server. To do so, open a terminal run:

```shell
# ODEX_VIEWER_DIR is the top-level directory of your local clone of the
# odex.viewer repository
cd $ODEX_VIEWER_DIR/server; pip install -r requirements.txt
```

## Usage

The odex.viewer backend server can be started using the following command:

```shell
cd $ODEX_VIEWER_DIR/server; python -m diag_server.openapi_server
```

Once the backend server has been successfully started, a low-level OpenAPI/Swagger user interface is available on [http://localhost:8080/v1/ui] for development purposes.

As an alternative, one of the provided vscode [launch configurations](../.vscode/launch.json) can be used for starting and debugging the backend and frontend servers of odex.viewer out of the Visual Studio Code integrated development environment.

Further information about the the provided launch configurations can be found in the global [README.md](../README.md#launch-configurations-for-visual-studio-code) file.

### Embedded Serving of the User Interface

If the user interface has been [exported as static pages](../viewer/README.md#generating-static-ui-files), the odex.viewer backend server will provide them via HTTP and no separate node.js server is required for the user interface.

If this behaviour is undesired for some reason, serving the static page exports can be explicitly controlled using the `DIAG_SERVER_SERVE_UI_ENABLED` environment variable: Setting it `false` or `no` deactivates this functionality:

```shell
cd $ODEX_VIEWER_DIR/server; DIAG_SERVER_SERVE_UI_ENABLED=false python -m diag_server.openapi_server
```

## Tests

As a prerequisite to run the server tests and for code checking and linting, all test-related requirements have to be installed.
Therefore, open a terminal in the server folder and run:

```shell
pip install -r test-requirements.txt
```

### Test Execution

All tests can then be started via `pytest` using the following command:

```shell
pytest
```

Single specific tests can be executed with pytest by providing the relative path to the test:

```shell
pytest tests/test_pdx_management.py
```

### Linting and Static Type Checks

The server code can be linted using `ruff` with the following command:

```shell
ruff check .
```

To run static type checks for the server code, `mypy` can be executed using the following command:

```shell
python -m mypy .
```

## Dockerized Setup

The odex.viewer can also be containerized using Docker. Details and further instructions can be found in the global project [README.md](./../README.md#dockerized-setup).

## Developer Notes

### Server Stub Code Generation from OpenAPI specification

The server stub code for a new or updated version of the odex.viewer backend API is generated using an OpenAPI specificaton. Depending on the operating system used , two equivalent scripts (bat|sh) for code generation are provided:

The code generator will create a the `diag_server.openapi_server` subpackage. Afterwards, all generated files (models, controllers, tests and some helper scripts) can be found in the `$ODEX_VIEWER_DIR/server/openapi_server` directory. Auto-generated files must not be modified.

The following files are relevant for the code generator:

- `diag-server.yml` is the OpenAPI file of the server API to generate code for.
- `config.yaml` configures the code generater by defining package names and template directories
- All mustache template files in the `openapi-generator-templates` directory. These files can be used to customize the controller and model classes.

**Hint**: If components within the OpenAPI file are *removed* or *renamed*, e.g., a schema element is renamed, new Python files will be generated in the models subfolder for the renamed components whilst the files for the outdated/deleted components will not be deleted automatically. This has to be done manually, i.e., only files for existing components are overwritten.

#### Manually Managed Model Classes

The following list of fully-qualified paths to Python classes was initially generated from the [diag-server.yml](../diag-server.yml) OpenAPI file, but for various reasons they had to be modified manually. Therefore, each of the files listed below is added to the [OpenAPI generator ignore file](.openapi-generator-ignore) so that applied manual changes are not overwritten by the code generator:

- [openapi_server/models/special_data_group_values_inner.py]
- [openapi_server/models/compu_rational_coeffs_numerators_inner.py]
- [openapi_server/models/limit_value.py]
- [diag_server/openapi_server/models/comparam_instance_value_any_of_inner.py](diag_server/openapi_server/models/comparam_instance_value_any_of_inner.py)
- [diag_server/openapi_server/models/comparam_instance_value.py](diag_server/openapi_server/models/comparam_instance_value.py)
- [diag_server/openapi_server/models/function_node_group.py](diag_server/openapi_server/models/function_node_group.py)

#### Generating the Server Stub

The OpenAPI models for the odex.viewer backend server must be converted into executable python code.  This is done using the [Swagger](https://swagger.io/) code generator. The exact procedure depends on the operating system:

- On Windows: In the Windows terminal, run [`generateServerStub.bat`] in the directory where the odex.viewer backend server is located. This will download the `openapi-generator-cli.jar` (unless it is already present) and then run it. Note that this script requires a suiteable Java runtime to be installed on your system.
- On Linux or MacOS: Run [`cd $ODEX_VIEWER_DIR/server; ./generateServerStub.sh`] in the terminal. Like the Windows version of the script, this will download `openapi-generator-cli.jar` (if required) before executing it. Note that this procedure requires a suiteable Java runtime to be installed on your system.

### Generate JSON Schema Definitions for odxtools Data Model Classes

The bulk of the OpenAPI schema is extracted automatically from their corresponding [odxtools](https://github.com/mercedes-benz/odxtools) classes. If these auto-generated schema definitions need to be updated for some reason, this can be done using

´´´shell
cd $ODEX_VIEWER_DIR/server; python ./export_openapi_models.py
´´´

After this, the OpenAPI code must be regenerated:

´´´shell
cd $ODEX_VIEWER_DIR/server; ./generateServerStub.sh
´´´

#### Background

The JSON schema definitions are stored in the file (`odxtools-types.json`)[../odxtools-types.json] from where each schema element can be imported/referenced via a corresponding JSON specification according to [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0#relative-schema-document-example).

The following YAML snippet shows an example of such a reference from the [diag-server.yml](../diag-server.yml) API documentation file:

```yaml
DiagnosticVariant:
  description: A diagnostic variant.
  type: object
  required:
    - short_name
    - perma_id
    - ephemeral_id
  properties:
    short_name:
      type: string
    long_name:
      type: string
    description:
      type: string
    variant_type:
      $ref: "odxtools-types.json/#/components/schemas/DiagLayerType"
    revision:
      type: string
    revision_ephemeral_id:
      type: integer
    variant_patterns:
      $ref: "#/components/schemas/VariantPatternCollection"
    perma_id:
      type: string
    ephemeral_id:
      type: integer
    sdgs:
      type: array
      items:
        $ref: "odxtools-types.json/#/components/schemas/SpecialDataGroup"
    parent_refs:
      type: array
      items:
        $ref: "odxtools-types.json/#/components/schemas/ParentRef"
```

In the example above, the definition of `ParentRef` is defined by a corresponding reference to the generated JSON Schema definitions.

If changes are made to the generation logic of the OpenAPI models or a newer version of odxtools that features changes to its data classes gets used, the [`export_openapi_models.py`] script shall be run to update the [`odxtools-types.json`](../odxtools-types.json) file. In addition, in order to keep the `odex.viewer` backend data classes consistent with its OpenAPI specification, it is important that the backend server stub code is regenerated after the OpenAPI specification has been updated as described [Server Stub Code Generation from OpenAPI specification](#server-stub-code-generation-from-openapi-specification).
