# clone-request-example

*Keyword(s):* request, route<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example will clone a request to two origin servers. It can be used to send the same POST data to two different origin servers.

## Usage Examples
    // Incoming Request
    POST /endpoint HTTP/1.1
    Host: www.example.com
    
    field=value

    // Request forwarded to Origin A
    POST /endpoint HTTP/1.1
    Host: www.origin-a.com
    
    field=value

    // Request forwarded to Origin B
    POST /endpoint HTTP/1.1
    Host: www.origin-b.com
    
    field=value

## Diagram
![Diagram](clone-request-diagram.png)


## Property Variable
![Property Variable](clone-request-property-variables.jpg)

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.

## Contributor
- Shubham Verekar