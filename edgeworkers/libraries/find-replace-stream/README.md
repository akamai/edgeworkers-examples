# find-replace-stream

*Keyword(s):* response-provider, response-manipulation, streaming, find, replace<br>

*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example demonstrates how an EdgeWorker can be used to modify an HTTP response stream by performing a find & replace operation on the response. The example will search for a specific text, and replace it with another, across the entire response body. It receives an optional parameter to specify how many times a replement must be performed. If not specified, the replacement will take place as many times as possible.

**DISCLAIMER: This EdgeWorker code is intended to be used on text streams, so its execution must be scoped appropriately in Property Manager, by deciding to apply the EdgeWorker on a specific match (extension, path, etc) that yields a text-based response body.**

The current example extracts from two Property Manager variables in order to know what to find and replace with. This can be modified to hardcoded text or different variables depending on the use case. Also, a third variable is available (called howManyReplacements) and defines how many times the searched text should be replacedThe main.js file shows the following:

````
const tosearchfor =  request.getVariable('PMUSER_EWSEARCH');
const newtext =  request.getVariable('PMUSER_EWNEWTEXT');
````

Can be modified to:
````
const tosearchfor =  'A String to Search For';
const newtext =  'A String to Replace With';
````


## Similar Uses

This example could be modified to support adding of various types of script to other sections of the html. Add subrequest functionality to dynamically add content to the page. 
 
## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
