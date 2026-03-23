<!-- SPDX-License-Identifier: AGPL-3.0-only -->

<p align="center">
    <img alt="odex.viewer Logo" src="./viewer/public/odex.viewer-logo.svg" height="150" style="max-width:100%">
</p>
<p align="center">
    <a href="https://github.com/mercedes-benz/odex.viewer/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/mercedes-benz/odex.viewer?color=blue"></a>
    <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/mercedes-benz/odex.viewer?color=blue">
    <a href="https://github.com/mercedes-benz/odex.viewer/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/mercedes-benz/odex.viewer?color=blue"></a>
    <a href="https://github.com/mercedes-benz/odex.viewer/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/mercedes-benz/odex.viewer?color=blue"></a>
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/mercedes-benz/odex.viewer?color=blue">  
</p>
&nbsp; <!-- without this, github does not render the headline below correctly -->

# odex.viewer

This repository contains a web-based viewer for exploring automotive diagnostic data description files based on the file format described by ISO 22901. It consists of a [frontend](./viewer/README.md) and a [backend server](./server/README.md). The backend provides the underlying data via a RESTfull HTTP API, whilst the frontend visualizes said data within a web browser using web technologies.

This `README.md` provides a quick overview of the project; further details are given by the respective `README.md` files for the [user interface](./viewer/README.md) and the [backend server](./server/README.md).

## System Requirements

For deployment in stand-alone mode, odex.viewer currently only requires **Python** version **3.10** or later to be available on the system.

To build the project from scratch, the following software packages are required as well:

- **Node.js** version **22.0.0** or later
- **Python** version **3.10** or later
- ***Java** version 21.0.5 or later (only required for OpenAPI-based code generation)*

## Getting Started

First, clone this repository, and after all [system prerequisites](#system-requirements) for development have been satisfied, all `python` and `node.js` modules required by odex.viewer must be installed:

```shell
# ODEX_VIEWER_DIR is the top-level directory of your local clone of the
# odex.viewer repository
cd $ODEX_VIEWER_DIR/server; pip install -r requirements.txt
cd $ODEX_VIEWER_DIR/viewer; npm install
```

### Generating Static UI Files

Once the depencencies have been installed, the files required for stand-alone mode can be generated:

```shell
cd $ODEX_VIEWER_DIR/viewer; npm run build
```

(This is not required if you intend to exclusively run odex.viewer in development mode, i.e., using separate web servers for the user interface and the backend functionality.)

### Run in Stand-Alone Mode

Using a single "all-in-one" web server for the user interface requires the static files for the UI to be generated (see previous section). The server can then be started via

```shell
cd $ODEX_VIEWER_DIR/server; python -m diag_server.openapi_server
```

At this point, the odex.viewer user interface ought to be available on [http://localhost:8080/].

### Run in Development Mode

To start separate front- and backend servers for development, run the following in two speparate terminal windows:

```shell
# start backend server
cd $ODEX_VIEWER_DIR/server; python -m diag_server.openapi_server
```

and

```shell
# start frontend server
cd $ODEX_VIEWER_DIR/viewer; npm run dev
```

As an alternative, one of the provided Visual Studio Code [launch configurations](.vscode/launch.json) can be used for starting and debugging the viewer and/or the backend server.

After this, you should be able to open the following URLs in your web browser:

- [http://localhost:3000](http://localhost:3000): User interface
- [http://localhost:8080/v1/ui](http://localhost:8080/v1/ui): Low-level user interface of backend server

## Launch Configurations for Visual Studio Code

The respository contains a collection of Visual Studio Code launch configurations which can be used for automation of tasks such as code generation steps or ODX test data provisioning on server startup.

The following sections provide a list of all launch configurations with a short description, grouped by their underlying use cases.

### Running the Project

- **"Start Viewer and Server"**: Starts the server and viewer together and loads the viewer directly in a new browser window.

### Running Individual Parts

- **"Start Server via Uvicorn"**: Starts a new instance of the backend server using **uvicorn** ASGI server.
- **"Start Server"**: Starts a new instance of the backend server.
- **"Start Server/Open Browser"**: Starts a new instance of the backend server and opens a browser with the OpenAPI of the server in Swagger-UI.
- **"Start Server with Data"**: Starts a new instance of the backend server, uploads all PDX files contained in the `$ODEX_VIEWER_DIR/server/pdx-input/` input directory to the server and opens a browser with the OpenAPI of the server in Swagger-UI.
- **"Start Viewer"**: Starts a new instance of the user interface server via `npm run dev`.
- **"Start Viewer/Open Browser"**: Starts a new instance of the user interface server and opens it in a new browser window.

### Helpers

- **"Upload PDX files"**: Uploads all PDX files contained in the `$ODEX_VIEWER_DIR/server/pdx-input/` directory to a running instance of the backend server.

### Code Generation

- **"Generate JSON Schemas and OpenAPI code"**: Generates and updates all JSON schema definitions for odxtools dataclasses in [`odxtools-types.json`] (see [Generate JSON Schema Definitions for odxtools Data Model Classes](./server/README.md#generate-json-schema-definitions-for-odxtools-data-model-classes)) and triggers the OpenAPI server code generation described in [Server Stub Code Generation from OpenAPI Specification](./server/README.md#server-stub-code-generation-from-openapi-specification).
- **"Cleanup and regenerate OpenAPI code"**: Deletes all existing - potentially outdated - generated models and controllers and retriggers the OpenAPI generator to produce up-to-date code reflecting the definitions in `diag-server.yml`. This is necessary, for example, if schema names have changed since this introduces new classes during generation while the deprecated previous class definitions will still be present, if not deleted.

## Containerized Setup using Docker

To build and bundle a respective Docker container for odex.viewer, open a terminal and run:

```shell
cd $ODEX_VIEWER_DIR; docker build -t odex.viewer .
```

After successful creation of the Docker image, odex.viewer can be started using:

```shell
cd $ODEX_VIEWER_DIR; docker run -d -p 8080:8080 odex.viewer
```

You can then open the viewer in your browser with the following URL: [http://localhost:8080].
The low-level user interface of backend server uses Swagger and is provided with the server at [http://localhost:8080/v1/ui].

**Hint**: An overview of all docker CLI commands can be found in the [Docker documentation](https://docs.docker.com/engine/reference/commandline/docker/).

## Contributing

Any contributions to odex.viewer are highly welcome. If you want to contribute to the odex.viewer project, please read our [contributing guide](CONTRIBUTING.md).

## Code of Conduct

Please read our [Code of Conduct](https://github.com/mercedes-benz/foss/blob/main/CODE_OF_CONDUCT.md) as it is our base for interaction.

## Provider Information

Please visit <https://group.mercedes-benz.com/provider/> for more information on the provider Mercedes-Benz AG.

**Notice**: Before you use the odex.viewer program in productive use, please take all necessary precautions such as testing and verifying the program with regard to your specific use.
The source code has been tested solely for our own use cases, which might differ from yours.

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
