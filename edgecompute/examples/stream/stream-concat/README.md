# stream-concat

*Keyword(s):* response-provider, response-manipulation, streaming, concatenation<br>

This example demonstrates how an EdgeWorker can be used to concatenate the responses from multiple subrequests.  This may be useful as a starting point for:

* Bundling JavaScript and CSS files at the Edge
* Assembling page content at the Edge.  For example, A page could be split into two requests, the first request for a cacheable header and the second request for a non-cacheable body.  By streaming the cacheable header immediately, the browser can begin processing content while waiting on the slower, non-cacheable body.

 
## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai EdgeWorkers Techdocs](https://techdocs.akamai.com/edgeworkers/docs)
