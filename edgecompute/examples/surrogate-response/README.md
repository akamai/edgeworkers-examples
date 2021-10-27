## Description
This example implements an EdgeWorker that will respond with an empty JSON response for an empty shopping cart. When a user adds an item to their cart, the client will increment a cookie with product and quantity information without going to origin.

## Usage Examples

    Missing Cookie
    /empty-cart
    {}
 
## Similar Uses
A similar EdgeWorker could response to other cases where a cookie or headers are missing from the request.

## Related Resources
- [EdgeWorkers CLI](https://developer.akamai.com/cli/packages/edgeworkers.html)
- [EdgeWorkers documentation](https://techdocs.akamai.com/edgeworkers/docs)
- [EdgeKV documentation](https://techdocs.akamai.com/edgekv/docs)

*Keyword(s):* constructed-response, reduce-origin-requests, generated-api-response<br>
