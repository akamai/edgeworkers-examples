# Akamai EdgeKV Examples
Akamai Edge Key-Value (EdgeKV) is a low-latency, distributed key-value store built to compliment EdgeWorkers. EdgeKV enables you to build data-driven JavaScript applications that require fast, frequent reads and infrequent writes. The code snippets in this repository are a great way to start learning about EdgeKV, and how it integrates with EdgeWorkers.

> :warning: **Warning!**
> Customers are responsible for maintaining control over the data hosted on this service and for appropriately using the data returned by EdgeKV. EdgeKV does not support storage of sensitive information where the consequence of an unauthorized disclosure would be a serious business or compliance issue. Customers should not use sensitive information when creating namespaces, groups, keys, or values.


## Resources
For more information on EdgeWorkers, please refer to the following resources:
* [EdgeKV Getting Started Guide](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html)
* [EdgeKV API Guide](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/apis/readme.md)
* [EdgeWorkers User Guide](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-4CC14D7E-D92D-4F2D-9292-17F8BE6E2DAE.html)
* [EdgeWorkers API Guide](https://developer.akamai.com/api/web_performance/edgeworkers/v1.html)

## Subfolder organization
* **/apis**: EdgeKV administrative API documentation for Tech Preview
* **/examples**: EdgeWorker examples implementing various EdgeKV use cases
* **/lib**: EdgeKV JS API helper library and documentation 
* **/utils**: EdgeKV helper utilities

# Guidelines to contributors
Everyone is welcome to contribute examples of implementing their use cases using EdgeWorkers and EdgeKV. We ask that you please follow these guidelines and submit a Pull Request (PR) for your example so it can be review by the team:
* Each use case should be in a separate example folder and must contain all code required to run the example (i.e. no external dependencies outside of EdgeWorkers & EdgeKV).
* Create separate PRs for each example. We will not be accepting PRs that contain multiple examples.
* Do not include the edgeKV library JS file (edgekv.js) in your example bundle. You can point users to the latest version [here](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js). 
* Make sure to test your example with the latest edgekv lib version available at the time of publishing and also indicate in your readme the edgekv lib version this example was tested against.
* Do not include the EdgeKV access token value in the *edgekv_tokens.js* file. You may however provide a sample of that file with the token value ommitted.
* Provide clear documentation of the use case in the readme along with any dependencies the example has outside EdgeWorkers and EdgeKV (e.g. property manager configurations, specific configuration of other Akamai products).
* If applicable, provide links to external documentation that may be required for the user to understand how to configure and run this example.

## Reporting Issues
These are working code samples that you may use, modify and extend at your discretion. If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.
