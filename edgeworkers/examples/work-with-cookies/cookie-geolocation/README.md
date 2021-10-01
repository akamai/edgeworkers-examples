# cookie-geolocation

*Keyword(s):* microservice, geo-location, cookies<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements an EdgeWorker to add a geoloation data to a cookie in the HTTP response.  This cookie returns location information about the client where the request originates, including a lookup from custom data.

## Usage Examples

````
// Incoming Request
GET / HTTP/1.1
Host: www.example.com

// Response to Browser
HTTP/1.1 200 OK
...
Set-Cookie: location=US%2BMI%2BDEARBORNHEIGHTS; Max-Age=86400; Path=/
Set-Cookie: salesRegion=Midwest%3A68329004; Max-Age=86400; Path=/
...
````
## Similar Uses

Geolocation can be also be performed in a separate service call, as in the [microservice-geolocation](../../respond-from-edgeworkers/respondwith/microservice-geolocation/) example.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
