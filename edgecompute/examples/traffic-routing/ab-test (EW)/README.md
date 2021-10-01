# a-b-testing

*Keyword(s):* cookies, a/b testing, route, query<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example will randomly assign a new user to a group for A/B testing.
The assignment will be stored in a cookie and will be passed to the origin in a query parameter.
To allow easy testing, the A/B group can be forced via a query string parameter.
The group names, percentage split, cookie name, and query parameter name are configured through constants in the EdgeWorker JavaScript module

## Usage Examples
````
// Incoming Request (Random assignment)
GET / HTTP/1.1
Host: www.example.com

// Request forwarded to Origin
GET /?testGroup=A HTTP/1.1
Host: www.example.com
Cookies: testGroup=A;

// Response to Browser
HTTP/1.1 200 OK
Set-Cookie: testGroup=A
X-True-Cache-Key: /D/1d/www.example.com/?testGroup=A
````

````
// Incoming Request (Forced assignment)
GET / HTTP/1.1
Host: www.example.com?testGroup=B

// Request forwarded to Origin
GET /?testGroup=B HTTP/1.1
Host: www.example.com
Cookies: testGroup=B;

// Response to Browser
HTTP/1.1 200 OK
Set-Cookie: testGroup=B
X-True-Cache-Key: /D/1d/www.example.com/?testGroup=B
````

## Similar Uses
Similar logic could be used to "personalize" content for a known group of users,
rather than randomly assigning groups for A/B testing.

The example could be extended to account for multivariate testing.

## Resources
See the repo [README](edgeworkers-examples/README.md#Resources) for additional guidance.
