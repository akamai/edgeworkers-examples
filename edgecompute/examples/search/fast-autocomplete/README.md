# fast-autocomplete

*Keyword(s):* data, dictionary, autocomplete, lookup<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This EdgeWorker serves responses for popular search terms at the Edge. Autocomplete requests are typically long tail and frequently changing. Without an EdgeWorker it is difficult to get up to date content from cache. Storing and serving the most popular search terms from the Edge will speed up responses significantly.

Using the EdgeWorker CLI the most popular search terms can be updated on a regular basis.

- This EdgeWorker needs to be activated for the path matching your autocomplete service.  
- It takes the GET parameter `term=` and does a lookup for the term in searchterms.js. 
- If a match is found we return the serialized JSON response, when there is no match the request is forwarded to origin.

The example code uses JSON formats seen in [Jquery UI](https://jqueryui.com/autocomplete/) or [Awesomplete](https://leaverou.github.io/awesomplete/).

`"red":[{"label":"Red socks (103 results)","value":"cat876"},{"label":"Red shoes (203 results)","value":"cat124"},{"label":"Red shirts (34 results)","value":"cat89"}]`

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
