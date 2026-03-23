# Diagrams

This folder contains a collection of [PlantUML](https://plantuml.com/de/) diagrams.

The source `*.puml*` files are located in the root of the folder.
The resulting diagram images are located in respective folders next to the source files.

## Setup in vscode

To author and preview PlantUML files within vscode, we use the [jebbs.plantuml](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) vscode extension.

To enable/support a local preview, there are different options specified in the [Quick Start Guide to PlantUML](https://plantuml.com/de/starting).

By default, the local server option is configured in the project [settings](../../../.vscode/settings.json) as follows:

```json
{
  "plantuml.server": "http://localhost:9090/",
  "plantuml.render": "PlantUMLServer"
}
```

This requires, that a PlantUML server is running on the local machine with the specified port.
Using Docker, a corresponding Docker container exposing the required PlantUML server can be started with the following command:

```shell
docker run --rm -d -p 9090:8080 plantuml/plantuml-server:jetty
```

## Export PlantUML diagrams

By default, the diagram source and export output folder are configured in the project [settings](../../../.vscode/settings.json) as follows:

```json
{
  "plantuml.includepaths": ["server/docs/diagrams","viewer/docs/diagrams"],
  "plantuml.exportOutDir": ".",
}
```

Respective diagram images in various formats can be exported for individual or all diagram files in the source folder through the respective commands of the PlantUML extension.
An overview and further details are provided in the documentation of the [jebbs.plantuml](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) vscode plugin.

By default, diagram images shall be exported in **SVG** format.
