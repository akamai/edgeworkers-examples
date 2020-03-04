# fast-autocomplete

*Keyword(s):* data, dictionary, autocomplete, lookup<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This EdgeWorker serves responses for popular search terms at the Edge. Autocomplete requests are typically long tail and the chance that an item is in cache is small. Storing and serving the most popular search terms from the Edge will speed up responses significantly.

Using the EdgeWorker CLI the most popular search terms can be updated on a regular basis.

This EdgeWorker needs to be activated for your autocomplete service.  It takes the GET parameter `term=` and does a lookup in searchterms.js included in the budle. If a match is found we return the serialized JSON response, when there is no match the request is forwarded to origin.

The example code uses JSON formats seen in [Jquery UI](https://jqueryui.com/autocomplete/) or [Awesomplete](https://leaverou.github.io/awesomplete/).

`"red":[{"label":"Red socks (103 results)","value":"cat876",{"label":"Red shoes (203 results)","value":"cat124"},{"label":"Red shirts (34 results)","value":"cat89"}]`

Because the response is generated at the Edge, the origin will not be
contacted for popular search terms, and the request will be fully resolved at the first Edge
server that answers it.

For less popular search terms the request will be forwarded.


## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
