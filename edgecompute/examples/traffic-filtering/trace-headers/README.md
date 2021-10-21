# trace-headers

*Keyword(s):* response-provider, response-manipulation, debug-headers, trace-headers<br>

<!-- *[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0 -->


This example demonstrates how an **EdgeWorker** can be used to inspect the forward request headers that go through to an Origin (or Parent server) during the lifetime of a request. 

The default example will output the request headers as part of the final response headers to the requestor, and prepend `x-fwd-` to the header name.
If the `getForwardHeaders=body` query string parameter is sent in the original request, the EdgeWorker will *discard the real response body*, and instead output the Request + Response headers as the entire response body. **This should only be used for debugging purposes.**

 
 
## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
