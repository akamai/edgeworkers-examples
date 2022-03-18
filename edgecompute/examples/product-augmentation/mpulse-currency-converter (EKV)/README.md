# response-body-manipulation-with-edgekv-input

_Keyword(s):_ response-provider, response-manipulation, streaming, edgekv<br>

_[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):_ 1.0

This example demonstrates how a response body can be manipulated with input from EdgeKV. The use case is currency conversion on an order confirmation page.
If an e-commerce site lets users purchase their items in multiple currencies you typically want the order value normalized to one currency to monitor conversion and revenue metrics.

The EdgeWorker takes the order value and currency symbol, fetches the conversion value from EdgeKV and finally injects a javascript that performs the normaliziation in the end-user browser.

Please include edgekv.js manually from the parent repository. https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js

## Working POC

- [mPulse currency converter](http://poc.klasen.se/projects/ew/mpulse-currency-normalizer.php)

The POC actually utilizes two EdgeWorkers, one with the EdgeKV but also a variant where the conversion value is fetched from an external service with httpRequest.

## More details on EdgeWorkers

- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
