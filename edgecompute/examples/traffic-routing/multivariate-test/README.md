# multivariate-test

*Keyword(s):* cookies, multivariate testing, route, constructed-response<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example will enable multivariate testing.  Multiple tests are executed simultaneously.
A single variant is selected for each test.  Variants will be randomly assigned to a new user, with each selected variant stored in a cookie.
Each variant will also be passed to the origin in a query string parameter.
The probability of choosing each variant can be configured by adjusting the weight of each variant.
To allow easy testing, the variant can be forced via a query string parameter.

Custom actions to be executed in the request and/or response phase of each variant.
For example, a custom action can be used to route a variant to a different origin or to construct a response at the edge.


## Usage Examples
````
// Incoming Request (Random assignment)
GET / HTTP/1.1
Host: www.example.com

// Request forwarded to Origin
GET /?test1=1b&test2=2a HTTP/1.1
Host: www.example.com
Cookie: test1=1b; test2=2a

// Response to Browser
HTTP/1.1 200 OK
Set-Cookie: test1=1b; Path=/
Set-Cookie: test2=2a; Path=/
X-True-Cache-Key: /D/1d/www.example.com/?test1=1b&test2=2a
````

````
// Incoming Request (Forced assignment of a single variant)
GET / HTTP/1.1
Host: www.example.com?test2=2c

// Request forwarded to Origin
GET /?test1=1b&test2=2c HTTP/1.1
Host: www.example.com
Cookie: test1=1a; test2=2c

// Response to Browser
HTTP/1.1 200 OK
Set-Cookie: test1=1b; Path=/
Set-Cookie: test2=2c; Path=/
X-True-Cache-Key: /D/1d/www.example.com/?test1=1b&test2=2c
````

## Similar Uses
Similar logic could be used to "personalize" content for a known group of users,
rather than randomly assigning groups for A/B testing.

A simple [A/B testing example](edgeworkers-examples/edgecompute/examples/traffic-routing/ab-test%20(EW)/README.md) is also available.

## Resources
See the repo [README](edgeworkers-examples/README.md#Resources) for additional guidance.
