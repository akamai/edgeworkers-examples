# Akamai EdgeKV 
Akamai Edge Key-Value (EdgeKV) is a low-latency, distributed key-value store built to complement EdgeWorkers. EdgeKV enables you to build data-driven JavaScript applications that require fast, frequent reads and infrequent writes. This repo contains the API documentation for EdgeKV, the helper library for EdgeWorker bundles, and utilities to make using the product easier. Joint EdgeWorker/EdgeKV code samples that implement various EdgeKV use cases can be found [here](https://github.com/akamai/edgeworkers-examples/tree/master/edgecompute/examples).

> :warning: **Warning!**
> Akamai customers are responsible for maintaining control over the data hosted on this service and for appropriately using the data returned by EdgeKV. EdgeKV does not support storage of sensitive information where the consequence of an unauthorized disclosure would be a serious business or compliance issue. Do not use sensitive information when creating namespaces, groups, keys, or values.

## Subfolder organization
* **/apis**: EdgeKV administrative API documentation for Tech Preview
* **/lib**: EdgeKV JS API helper library and documentation 
* **/utils**: EdgeKV helper utilities

## Resources
For more information on EdgeWorkers, please refer to the following resources:
* [EdgeKV Product Documentation](https://techdocs.akamai.com/edgekv/docs)
* [EdgeKV API Guide](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/apis/readme.md)
* [EdgeKV Release Notes](https://techdocs.akamai.com/edgekv/changelog)
* [EdgeKV Command-Line Interface (CLI)](https://github.com/akamai/cli-edgeworkers/blob/master/docs/edgekv_cli.md)
* [EdgeKV Recipes](https://techdocs.akamai.com/edgekv/recipes/send-a-constructed-response-to-a-web-page)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.
