## Overview

This repository contains the code for the Voyage core web extension. For details, refer to the [RFC](https://www.notion.so/RFC-003-Voyage-Extension-v1-3cb5e310977442e08d1f3f0ea137207f).

## Getting Started

```shell
npm i
npm run start
```

## Stack
* TypeScript
* React 17
* Webpack 5
* Manifest version 3
* Mantine

# Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. All compiled assets will be in `build`. To preview the extension, load it into Chrome.

Note that the extension, including background and content scripts, are automatically hot reloaded thanks to [@voyage-finance/webpack-ext-loader](https://github.com/voyage-finance/webpack-ext-reloader), our fork of [SimplifyJob/webpack-ext-reloader](https://github.com/SimplifyJobs/webpack-ext-reloader).

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\

## Architecture

![architecture](docs/architecture.svg)

Voyage Extension has a few major components:
* UI -- React code that powers the popup and tab views. Communicates with background using `PortStream` + `ObjectMultiplex`
* Background -- houses `VoyageController`, the central API for both UI and `contentscript`
* ContentScript -- enables the extension to manipulate the DOM. Communicates with backgound using `PortStream` + `ObjectMultiplex`

### Voyage Controller

* This is the main entrypoint for business logic and persistent state.
* This is the right place to set up handlers for `sendMessage` listeners.
* `VoyageController` has **privileged** access to **private keys**. Never allow access to its methods from unknown sources (third party extensions and websites).
* It exposes its API via client/server in `src/rpc/virtual`, an RPC abstraction over Chrome's message passing. This is how `contentscript` and `ui` call `VoyageController`
    * Calling methods via `RPCClient` may seem like magic, but only serializable data can be passed. This means returning a `Promise` is not going to work! 

### VoyageRpcService

* This responds to all RPC method calls coming from `contentscript` and `ui` via `BaseProvider`. 
* It only gets called for methods like `eth_accounts`, which needs to return the Vault address (for example).
* More methods will be handled here, such as `eth_sign`, etc.

### ControllerStore

* Reactive store based on `mobx`. It sends state updates to the UI via `sendUpdate` on `VoyageController`.
* On the UI side, this state is managed using `Redux`, because it is far easier to update the entire state tree using it.
* Note that all state that needs to be exposed should be returned from each sub-store's `get state()` getter. These must then be called in the `get state()` of the root `ControllerStore`. This ensures that the UI will be automatically updated when any sub-store is updated.

### UI

* The UI is a very typical React/Redux application that you have seen dozens of times before.
* The only store right now is `core`. It holds all `VoyageController` state and is updated each time something changes in `VoyageController`. State that is local to the UI can be handled, as far as possible, within component functions with hooks.
* If you need to add more app-wide state, don't add it to `core`, as that is isolated and reserved for `VoyageController` state.
* Like the Web UI, it runs on `mantine`. We should probably extract the custom components into a common shared library at some stage.
* The only interesting bits are in `src/ui/web3/init.ts` -- which is responsible for establishing a connection to the `background` script via `PortStream`.
* Additionally, because the global object is a bit wonky in extensions, we use `globalThis` instead of `window` or `global`.
* `provider` and `controller` are always available in the UI context, globally.
