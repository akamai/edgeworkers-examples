Akamai EdgeWorkers - URL Shortener
==================================

This is a demo of a URL shortner application that is fully contained within Akamai EdgeWorkers. The code used to serve the redirects and manage the redirects lives within an EdgeWorker application that you can review here. All of the Redirect mappings are stored in EdgeKV

**Testing redirects:**

URLs in the format with /r/\[name\] will attempt to perform a redirect by looking up the \[name\]. For example you can test the following URLs:

*   [https://edgeworkers.paulcalvano.com/r/paul](https://edgeworkers.paulcalvano.com/r/paul)
*   [https://edgeworkers.paulcalvano.com/r/goog](https://edgeworkers.paulcalvano.com/r/goog)

**Managing redirects:**

URLs in the format with /m/op=\[add|update|delete\] are used to manage redirects. The parameter name is used for the shortened URL, and url is used for the destination URL.

To create a redirect, you can use /m/op=add&name=\[name\]&url=\[url\]. If you exclude the name parameter, one will be created randomly for you.

*   /m/?op=add&url=https://test.com will create a redirect with a randomized name
*   /m/?op=add&url=https://test.com&name=test will create a redirect with the path /r/test

To update an existing redirect, you can use /m/op=update&name=\[name\]&url=\[url\].

*   /m/?op=update&url=https://example.com&name=test will create update the redirect at /r/test to point to https://example.com

To delete an existing redirect, you can use /m/op=delete&name=\[name\]

*   /m/?op=delete&name=test will delete the redirect at /r/test
