# html-rewriter

_Keyword(s):_ response-provider, response-manipulation, html-rewriter, streaming<br>

_[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):_ 1.0

This example demonstrates how an EdgeWorker can be utilize the built-in html-rewriter module to modify a response stream by referencing the head element, and appending a script tag to the end. The html-rewriter module contains a built-in parser that emulates HTML parsing and DOM-construction, making it easier to consume and rewrite HTML documents.

## Similar Uses

The html-rewriter type, class, attribute, and ID CSS selectors as well as child and descendent combinators. Similar use cases may range from rewriting specific images by class and rewriting them to load lazily. You could similarly remove specific content depending on a user no longer being authenticated to your site. Another scenario is experimenting with site changes by region, or even performing a sub-request to get item counts to reflect the number of items currently in a users shopping cart.

## More details on EdgeWorkers

-   [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
-   [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
-   [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
