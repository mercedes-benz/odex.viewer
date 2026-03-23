<!-- SPDX-License-Identifier: AGPL-3.0-only -->

# odex.viewer

odex.viewer is a web-based viewer for exploring automotive diagnostic data sets based on the ISO-22901 (ODX) standard.

## Prerequisites

odex.viewer requires **Node.js** version **22.0.0** or later to be installed on your system.
You can verify your node.js version using the following command:

```bash
node --version
```

For the odex.viewer user interface to be useful, an instance of the **odex.viewer backend server** is required to be running on your local machine. See the server's [README.md](./../server/README.md) for more details on how to setup and run such an instance.

### List of Recommended/Tested Versions of All Requirements

- Node.js: v22.11.0

## Getting Started

Clone this repository and after all [prerequisites](#prerequisites) are fulfilled, the required node.js packages need to be installed.
For this, open a terminal and run:

```bash
cd $ODEX_VIEWER_DIR/viewer; npm install
```

where `$ODEX_VIEWER_DIR` corresponds to the directory where the clone of the odex.viewer respository is located.

## Usage

To start the odex.viewer user interface using a separate server (this is mostly relevant for development purposes), open a terminal and run:

```bash
cd $ODEX_VIEWER_DIR/viewer; npm run dev
```

You can then use the viewer via your web browser by opening [http://localhost:3000](http://localhost:3000).

As an alternative, one of the provided vscode [launch configurations](../.vscode/launch.json) can be used for starting and debugging the viewer.
Further information about the the provided launch configurations can be found in the project [README.md](../README.md#launch-configurations-for-vscode).

## Tests

As a prerequisite to run the viewer tests and for code checking and linting, all required packages have to be installed as described in [Getting started](#getting-started).

### Test Execution

To the test the viewer and its pages, we use the [Playwright](https://playwright.dev/) end-to-end test framework.
All defined test cases are located in the [/tests](./tests/) folder.

For running these tests with Playwright, there are two configurations defined:

- `playwright.config-dev.ts`: Runs the tests against the development server with the viewer only against the chromium project.
- `playwright.config.ts`: Runs the tests against the build pages of the viewer served as static pages against the chromium, firefox and webkit projects.

Depending on the configuration to be used, all tests can be started using one of the following commands:

- using `playwright.config-dev.ts` configuration:

  ```shell
  npm run test:dev
  ```

- using `playwright.config.ts` configuration:

  ```shell
  npm run test
  ```

Single specific tests can be executed with playwright by providing the filename of the test with the following command:

```shell
npx playwright test odx-d.spec.ts
```

### Linting, Type Checking and Formatting

The viewer code can be linted using `eslint` with the following command:

```shell
npm run lint
```

To run typescript type checks for the viewer code the following command can be used:

```shell
npm run test:ts
```

Formatting can be checked with the following command:

```shell
npm run prettier:check
```

To directly fix the formatting you can use the following command:

```shell
npm run prettier
```

## Build the odex.viewer as a Static Site

By default, the odex.viewer is configured to use a [static export](https://nextjs.org/docs/app/guides/static-exports) of the user interface code. This is configured by setting the `output` property in [next.config.js](next.config.js) to `export`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  ...
}

module.exports = nextConfig
```

To build the user interface and export it as a static site, open a terminal and run:

```bash
cd $ODEX_VIEWER_DIR/viewer; npm run build
```

After this, the backend server will directly serve the user interface.

Alternatively the exported static site can then be served using a `Node.js`-based webserver. To do so, open a terminal and run:

```bash
cd $ODEX_VIEWER_DIR/viewer; npm run serve-static
```

You can then open the viewer in your browser with the following URL: [http://localhost:3000](http://localhost:3000)

## Dockerized Setup

The odex.viewer can also be containerized using Docker. Details and further instructions can be found in the global project [README.md](./../README.md#dockerized-setup).

## OpenAPI-based API Communication/Integration

The communication with the [odex.viewer backend server](../server/README.md) is implemented via the exposed RESTful HTTP API which is documented in the [diag-server.yml](../diag-server.yml) OpenAPI file.

This file is used as the basis to establish the required HTTP calls to interact with the API.

As a basis, the OpenAPI file is used to generate a TypeScript definition file ([diag-server.d.ts](./api/diag-server.d.ts)) using the [openapi-typescript](https://openapi-ts.dev/introduction) library.

To (re-)generate the TypeScript definition file for the odex.viewer backend server API, e.g., after a change or extension of the server API documentation specified in [`diag-server.yml`](../diag-server.yml) at the root of the project, simply run:

```shell
cd $ODEX_VIEWER_DIR/viewer; npm run api-client-gen
```

The resulting [`diag-server.d.ts`](./api/diag-server.d.ts) is located in the [`api`](./api) folder.

The resulting file contains all relevant information for the API communication and is therefore used as input for conducting the required API calls via [SWR](https://swr.vercel.app/) using the [swr-openapi](https://openapi-ts.dev/swr-openapi/) library.

The documentation of [swr-openapi](https://openapi-ts.dev/swr-openapi/) also shows how to build the required wrapper hooks and integrate them in the UI pages.

Required SWR hooks for the API are defined in the following file: [./api/api-hooks.ts](./api/api-hooks.ts)

### Example use of SWR API hooks in a component

```ts
import { CircularProgress } from '@heroui/progress'

import { useQuery } from '@/api/api-hooks'
import ApiError from '@/components/api-error'

export function MyComponent() {
  const { data, error, isLoading } = useQuery('/dops', {
    params: {
      query: { include_details: true },
    },
  })

  if (error) return <ApiError error={error} />
  if (isLoading || !data) return <CircularProgress aria-label="Loading..." />

  return (
    <div>
      {data.items.map((dop) => (
        <p key={dop.short_name}>{dop.short_name}</p>
      ))}
    </div>
  )
}
```

## Additional Documentation, Decisions and Guidelines

Additional documentation, insights on decisions being made as well as further developer guidelines and documentation can be found in the [docs](./docs/README.md) folder.

## Further Hints

The initial code is based on the HeroUI [next-app-template](https://github.com/heroui-inc/next-app-template) project.
More information can be found on the [HeroUI](https://www.heroui.com/) website.
