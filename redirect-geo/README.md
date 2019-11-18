# redirect-geo-example

*Keyword(s):* redirect, geo-fencing, i18n<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

EdgeWorker example to redirect visitors based on the location of the request to present location relevant pages.

## Usage Examples
    // Request originates from Canada 
    GET / HTTP/1.1
    Host: www.example.com

    HTTP/1.1 302 Moved Temporarily
    Location: http://www.example.ca/

    // Request originates from United Kingdom 
    GET / HTTP/1.1
    Host: www.example.com

    HTTP/1.1 302 Moved Temporarily
    Location: http://www.example.co.uk/

    // Request originates from United States 
    GET / HTTP/1.1
    Host: www.example.ca
    
    HTTP/1.1 302 Moved Temporarily
    Location: http://www.example.com/

## Similar Uses
Similar logic could be crafted to consider language (from the Accept-Language request header) and country to provide the user more specific content

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.