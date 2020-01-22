# remove-cookies-static-files

*Keyword(s):* cookies, request-reduction<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example will remove cookies from being set/sent on static files, reducing the request size to the origin. The 

## Usage Examples
    // Incoming Request
    GET /image.jpg HTTP/1.1
    Host: www.example.com
    Cookies: _ga=GA1.3.12345678.1234567890;site_cookie="some_data_here";
    
    // Request forwarded to Origin
    GET /image.jpg HTTP/1.1
    Host: www.example.com

    // Origin Response
    HTTP/1.1 200 OK
    Accept-Ranges: bytes
    Last-Modified: Tue, 29 May 2018 19:20:44 GMT
    Content-Type: image/jpeg
    Content-Length: 20016
    Cache-Control: public, max-age=86351
    Date: Mon, 20 Jan 2020 20:00:04 GMT
    Connection: keep-alive
    Set-Cookie: language=en; Path=/
    Set-Cookie: country=us; Path=/

    // Response to client
    HTTP/1.1 200 OK
    Accept-Ranges: bytes
    Last-Modified: Tue, 29 May 2018 19:20:44 GMT
    Content-Type: image/jpeg
    Content-Length: 20016
    Cache-Control: public, max-age=86351
    Date: Mon, 20 Jan 2020 20:00:04 GMT
    Connection: keep-alive

## Similar Uses
Similar logic could be crafted to add, modify or delete cookies that were received by the CDN edge or any other cookier filtering needs.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
