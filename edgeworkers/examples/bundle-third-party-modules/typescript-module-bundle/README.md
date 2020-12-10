# typescript-module-bundle

*Keyword(s):* typescript, rollup.js, code importing, es module, commonjs module, bundle<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This is an example that demonstrates how to build an edge worker that is written in TypeScript.

## Use Cases

- You are developing EdgeWorkers in TypeScript.
- You are structuring your code in modules.
- You have dependencies on third-party CommonJS modules.

## Overview

Akamai EdgeWorkers provides [TypeScript support](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-EFA9EC25-AF64-4552-9D4D-BFE5E9D82752.html). However, if we structure our code in modules, [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) is not able to compile `import` statements to meets the way EdgeWorkers [import modules](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-19D21814-AB04-49C8-AC25-28CCC9CC2D47.html) because all JavaScript module imports must include `.js` extension. Therefore, we need an additional build process to make our modules accessible in deployment. 

This example demonstrates how to compile `.ts` files and bundle all modules and third-party dependencies into deployment-ready `main.js` file. 

## Quick Start

Please navigate to `typescript-module-bundle` example root,

```bash
cd edgeworkers-examples/typescript-module-bundle
```

and install dependencies with npm,

```bash
npm install
```

or with yarn,

```bash
yarn install
```

To build the project, please run

```bash
# with npm
npm run build

# or with yarn
yarn build
```

The built files is located at `/dist` directory.

To start dev mode, please run 

```bash
# with npm
npm run start

# or with yarn
yarn start
```

## Resources

See the repo [README](../../../../README.md#Resources) for additional guidance.

To learn more about setting up EdgeWorker with TypeScript, please see: 

- [TypeScript](https://www.typescriptlang.org/)
- [EdgeWorker User Guide: TypeScript](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-EFA9EC25-AF64-4552-9D4D-BFE5E9D82752.html) 
- [EdgeWorker User Guide: Use Case: Set up your Dev Environment](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-ECA2B985-1AE7-4B47-A128-97203D6929D5.html?hl=typescript) 

To learn more about Rollup.js and the plugins in this example, please see:

- [rollup.js](https://rollupjs.org/guide/en/)
- [Awesome Rollup](https://github.com/rollup/awesome)
- [@rollup/plugin-typescript](https://github.com/rollup/plugins/tree/master/packages/typescript)
- [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)