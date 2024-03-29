# Akamai EdgeWorkers and EdgeKV

Akamai EdgeWorkers helps deliver superior web experiences by enabling developers to run JavaScript at the Edge. EdgeKV provides a global, low-latency key-value data store to complement EdgeWorkers. The code and tools in this repository provide a starting point to help you build applications that solve business problems with Akamai EdgeWorkers and EdgeKV.


## Subfolder organization
* **/examples**: EdgeWorker and EdgeKV code samples, organized by use-case
* **/edgekv**: EdgeKV helper library, API documentation, and utilities
* **/public_examples**: Customer-contributed code to enhance the EdgeWorker ecosystem

## Resources

For more information on EdgeWorkers and EdgeKV, refer to the following resources:

* [EdgeKV Documentation](https://techdocs.akamai.com/edgekv/docs)
* [EdgeWorkers Documentation](https://techdocs.akamai.com/edgeworkers/docs)
* [EdgeWorkers API Reference](https://techdocs.akamai.com/edgeworkers/reference/api)
* [Akamai CLI for EdgeWorkers/EKV](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
* [EdgeWorkers Developer Page](https://developer.akamai.com/edgeworkers)

If you have not already installed Postman, visit the [Postman website](https://www.postman.com/) and install the preferred version for your system. Click the "Run in Postman" button to import the EdgeCompute API Postman collection into Postman.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://god.gw.postman.com/run-collection/13085889-10b6ffa0-b947-4232-b70a-60bff7ef4d8e?action=collection%2Ffork&collection-url=entityId%3D13085889-10b6ffa0-b947-4232-b70a-60bff7ef4d8e%26entityType%3Dcollection%26workspaceId%3D74bbc495-bfd4-4528-9a71-325d746180c3#?env%5BAkamai%20%7C%20Edge%20Computing%5D=W3sia2V5IjoiaG9zdCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJhY2Nlc3NfdG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiY2xpZW50X3Rva2VuIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6ImNsaWVudF9zZWNyZXQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiYWNjb3VudFN3aXRjaEtleSIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJjb250cmFjdElkIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6Imdyb3VwSWQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoicmVzb3VyY2VUaWVySWQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiZWRnZVdvcmtlck5hbWUiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiZWRnZVdvcmtlcklkIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6InZlcnNpb24iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoibmV0d29yayIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJhY3RpdmF0aW9uSWQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoicmVwb3J0SWQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiZWRnZUtWX0NQQ29kZSIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJuYW1lc3BhY2VOYW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6InJldGVudGlvbkluU2Vjb25kcyIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJ0b2tlbk5hbWUiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoidG9rZW5FeHBpcnkiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiZWRnZUtWX2dyb3VwSWQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiZWRnZUtWX2l0ZW1JZCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJyZXBvcnRfU3RhcnRUaW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6InJlcG9ydF9FbmRUaW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6Imhvc3RuYW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6InByb3BlcnR5SWQiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoicHJvcGVydHlWZXJzaW9uIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6InByb2R1Y3RJZCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJjcENvZGVOYW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6ImNwQ29kZSIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX0seyJrZXkiOiJlZGdlSG9zdG5hbWUiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5Ijoibm90ZXMiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiZW1haWwiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWV9XQ==)


## Reporting Issues
These are working code samples that you may use, modify and extend at your discretion. If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.

For information on using EdgeWorkers and EdgeKV, please review [Akamai's product policy ](https://www.akamai.com/site/en/documents/akamai/2022/edgeworkers-and-edgekv-supplemental-product-policy.pdf)