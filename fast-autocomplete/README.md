# fast-autocomplete

*Keyword(s):* data, dictionary, search, lookup<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This use-case serves responses for popular search terms at the Edge. Search terms are typically long tail and the chance that an item is in cache is typically small. 

Using the EdgeWorker CLI the most popular search terms can be updated on a regularl basis.

This EdgeWorker tests for `/ajax/autocomplete?term=` in the URI path in
order to act. It will then respond to a GET parameter named `term` and returning an
array of matching category entities, serialized as JSON.

The example code uses JSON formats seen in [Jquery UI](https://jqueryui.com/autocomplete/) or [Awesomplete](https://leaverou.github.io/awesomplete/).

Because the response is generated at the Edge, the origin will not be
contacted for popular search terms, and the request will be fully resolved at the first Edge
server that answers it.

For less popular search terms the request will be forwarded.


## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
