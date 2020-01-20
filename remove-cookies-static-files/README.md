# remove-cookies-example

*Keyword(s):* cookies, request-reduction<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example will remove cookies from being set/sent on static files, reducing the response size to the client.

## Usage Examples
    // Incoming Request
    GET / HTTP/1.1
    Host: www.example.com
    Cookies: _ga=GA1.3.12345678.1234567890; site_cookie="some_data_here";
    
    // Request forwarded to Origin
    GET / HTTP/1.1
    Host: www.example.com
    Cookies: site_cookie="some_data_here";

## Similar Uses
Similar logic could be crafted to add, modify or delete cookies that were received by the CDN edge or any other cookier filtering needs.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
