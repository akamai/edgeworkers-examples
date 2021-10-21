# empty-cart

*Keyword(s):* constructed-response, reduce-origin-requests, generated-api-response<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements an EdgeWorker that will respond with an empty JSON for an empty shopping cart. In this case when the user adds an item to their cart the client will increment a cookie with product and quantity information.

## Usage Examples

    Missing Cookie
    /empty-cart
    {}
 
## Similar Uses

A similar EdgeWorker could response to other cases where a cookies, headers are missing from the request.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.

