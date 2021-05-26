# jsonp-wrapper

*Keyword(s):* response-provider, response-manipulation, jsonp, streaming<br>

*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example demonstrates how an EdgeWorker can be used to wrap JSON response with dynamic unique callback function leveraging Response Provider and Stream API for efficient content transformation.

The EW should be enabled on JSON requests containing `callback` query parameter. This can easily be accomplished with match on file extension and query parameter match in Property Manager.  

When such request comes in, this EW removes the `callback` query param and makes a sub-request to fetch the JSON data, serving it as a stream. EW code adds prefix with callback function name captured from the query param and suffix. Both JSON data and transformed data can be cached and this can be achieved with standard "Caching" behavior in Property Manager (if caching is allowed in your use-case).

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
