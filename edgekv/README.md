# Akamai EdgeKV 
Akamai Edge Key-Value (EdgeKV) is a low-latency, distributed key-value store built to complement EdgeWorkers. EdgeKV enables you to build data-driven JavaScript applications that require fast, frequent reads and infrequent writes. This repo contains the API documentation for EdgeKV, the helper library for EdgeWorker bundles, and utilities to make using the product easier. Joint EdgeWorker/EdgeKV code samples that implement various EdgeKV use cases can be found [here](https://github.com/akamai/edgeworkers-examples/tree/master/edgecompute/examples).

> :warning: **Warning!**
> EdgeKV is a distributed key-value store that enables JavaScript developers to build data-driven EdgeWorkers applications for latency-sensitive use cases. The current release of EdgeKV is not designed for handling personal, confidential, proprietary data, or any other type of data where unauthorized access to or disclosure of such data would result in loss, legal or regulatory liability, or other harm to Customers or their end users (“Sensitive Data”). EdgeKV should not, therefore, be used to store Sensitive Data. In addition, do not use data returned from EdgeKV to influence workflows that are in scope for compliance frameworks which mandate specific requirements for the handling of Sensitive Data without conducting an appropriate impact review. Customers of EdgeKV are responsible for maintaining control over the data loaded into EdgeKV and for review of applicable information security, privacy, and compliance requirements to determine the appropriateness of their use of this service.

## Subfolder organization
* **/apis**: Link to EdgeKV API documentation
* **/lib**: EdgeKV JS API helper library and documentation 
* **/utils**: EdgeKV helper utilities

## Resources
For more information on EdgeWorkers, please refer to the following resources:
* [EdgeKV Product Documentation](https://techdocs.akamai.com/edgekv/docs)
* [EdgeKV API Guide](https://techdocs.akamai.com/edgekv/reference/api)
* [EdgeKV Release Notes](https://techdocs.akamai.com/edgekv/changelog)
* [EdgeKV Command-Line Interface (CLI)](https://github.com/akamai/cli-edgeworkers/blob/master/docs/edgekv_cli.md)
* [EdgeKV Recipes](https://techdocs.akamai.com/edgekv/recipes/send-a-constructed-response-to-a-web-page)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.

For information on using EdgeWorkers and EdgeKV, please review Akamai's product policy (https://www.akamai.com/site/en/documents/akamai/2022/edgeworkers-and-edgekv-supplemental-product-policy.pdf)
