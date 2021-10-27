# Description
This example demonstrates how to build an EdgeWorker written in TypeScript.

## Use Cases
- You are developing EdgeWorkers in TypeScript
- You are structuring your code in modules
- You have dependencies on third-party CommonJS modules

## Overview

Akamai EdgeWorkers provides [TypeScript support](https://techdocs.akamai.com/edgeworkers/docs/typescript). However, if we structure our code in modules, [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html), is not able to compile `import` statements to meets the way EdgeWorkers [import modules](https://techdocs.akamai.com/edgeworkers/docs/import-a-javascript-module) because all JavaScript module imports must include `.js` extension. Therefore, we need an additional build process to make our modules accessible in deployment. 

This example demonstrates how to compile `.ts` files and bundle all modules and third-party dependencies into a deployment-ready `main.js` file. 

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

## Related Resources

To learn more about setting up EdgeWorker with TypeScript, please see: 

- [TypeScript](https://www.typescriptlang.org/)
- [EdgeWorker User Guide: TypeScript](https://techdocs.akamai.com/edgeworkers/docs/typescript) 
- [EdgeWorkers documentation](https://techdocs.akamai.com/edgeworkers/docs)

To learn more about Rollup.js and the plugins used in this example, please see:

- [rollup.js](https://rollupjs.org/guide/en/)
- [Awesome Rollup](https://github.com/rollup/awesome)
- [@rollup/plugin-typescript](https://github.com/rollup/plugins/tree/master/packages/typescript)
- [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)

*Keyword(s):* typescript, rollup.js, code importing, es module, commonjs module, bundle<br>
