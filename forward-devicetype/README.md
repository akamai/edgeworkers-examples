# forward-devicetype

*Keyword(s):* forward-url, device-type<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements modifies the forward origin path of the url to return device specific content.

## Usage Examples

     GET /index.html
     User-Agent: mobile device
     Host: mysite
     
     resulting url forwarded to the Origin
     /mobile/index.html

## Similar Uses

Allows decisions to be made using request information to modify the origin location for the content. Could be used to return 
device appropriate page resource files.   

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.

