# origin-overload

*Keyword(s):* constructed-response, error-handling<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example translates a HTTP 503 status code (service unavailable) coming from an overloaded origin into a HTML page presenting the information in a more user friendly way. It also includes javascript to retry after the period indicated by the 'Retry-After' header coming from origin, if present. Otherwise it'll retry after a default number of seconds. 
Note that even if the content from origin is dynamic it makes sense to configure the property such that the HTTP error responses are cached at least for a short duration. 

## Usage Examples

    /index.html (HTTP Status 503, Retry-After: 5)
    // Response coming from Origin

    /index.html (HTTP Status 200, Generated HTML will show error message and included js will retry after 5 seconds)
    // Response delivered to the user

The `HTTP Status 503` triggers the functionality of the EW, and the value of the `Retry-After` is used in the javascript in the constructed response message. 

## Similar Uses

A similar EdgeWorker could react to other HTTP error codes, such as `500` or `404` and present user friendly information instead.

Information passed in response headers from origin can also be used, either standardized headers (as in this example) or custom headers. 

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.



 
