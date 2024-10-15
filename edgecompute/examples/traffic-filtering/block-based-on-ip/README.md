# block-based-on-ip

*Keyword(s):* constructed-response, edge logic, blocklist, allow list<br>
*[Since](https://techdocs.akamai.com/edgeworkers/docs/about-the-javascript-api):* 1.0

This example implements a block list depending on ip addresses. If a user's IP address is on the list, a 403 deny will occur.

## Usage Examples
````
// Incoming Request
GET / HTTP/1.1
Host: www.example.com
(User's IP in a list)

// Response to Browser
HTTP/1.1 403 Forbidden
{}
````
## Similar Uses
Allowlist or blocklist capabilities can be setup based on other end user request context information such as connecting IP, Geo, Device Characteristics, Accept-Language, User-Agent, etc. 

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
