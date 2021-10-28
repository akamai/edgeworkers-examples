## Description
The examples in this section detail how to use EdgeWorkers and EdgeKV to perform traffic routing operations. This includes redirects and A/B testing.

## Subfolder organization
* **/ab-test(EKV)**: A/B testing using EdgeWorkers only
* **/ab-test**: A/B testing using EdgeWorkers and EdgeKV
* **/multivariate-test**: Test more than one variable to determine which combination leads to more conversions 
* **/redirect-geo**: Redirect visitors based on the location of the request 
* **/redirect-liquidator**: Transform 301/302 redirets into 200 responses at the Edge
* **/redirect-unauthenticated**: Validate if a request originates from an authenticated user  

## Related Resources
- [EdgeWorkers CLI](https://developer.akamai.com/cli/packages/edgeworkers.html)
- [EdgeWorkers documentation](https://techdocs.akamai.com/edgeworkers/docs)
- [EdgeKV documentation](https://techdocs.akamai.com/edgekv/docs)
