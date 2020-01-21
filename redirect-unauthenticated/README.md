# redirect-unauthenticated-request-example

*Keyword(s):* redirect, cookies, cookiejar<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example will check request originates from an authenticated user. If not will redirect to have the user login.

## Usage Examples
    // Incoming Request
    GET / HTTP/1.1
    Host: www.example.com
    
    // Response to client
    HTTP/1.1 302 Moved Temporarily
    Location: http://www.example.com/signin?redirect_url=http%3A%2F%2Fwww.example.com%2F
    Content-Type: text/html
    Content-Length: 0
    Date: Tue, 21 Jan 2020 16:18:19 GMT
    Connection: keep-alive

## Similar Uses
Similar logic could be crafted to validate headers, cookies, querystring parms that were received by the CDN edge.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.