# traffic-allow-list

*Keyword(s):* constructed-response, edge logic, geo-location, blacklist, whitelist, allow list<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements an allow list depending on the geographic locale of the end user.  If user is arriving from United States embargoed countries, a 403 deny will occur.

## Usage Examples
````
// Incoming Request
GET / HTTP/1.1
Host: www.example.com
(User Country not in IR, KP, SY, SD, CU, VE)

// Response to Browser
HTTP/1.1 200 OK
<html><body><h1>Hello (user country) From Akamai EdgeWorkers</h1></body></html>
````
````
// Incoming Request
GET / HTTP/1.1
Host: www.example.com
(User Country in IR, KP, SY, SD, CU, VE)

// Response to Browser
HTTP/1.1 403 Forbidden
<html><body><h1>Sorry, users from (user country) may not view this content</h1></body></html>
````

## Similar Uses
Whitelist or blacklist capabilities can be setup based on other end user request context information such as connecting IP, Geo, Device Characteristics, Accept-Language, User-Agent, etc. 

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.