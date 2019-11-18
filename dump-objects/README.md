# Dump Request and Response Objects

Event handlers of EdgeWorkers are called with `request` and `response` objects. This example dumps the both objects as a text when the request header `X-EW-Handler-Debug` exists.

## Usage

You will get the dump of objects by addding `X-EW-Handler-Debug` header with the value `onClientRequest` or `onOriginResponse`.

## Examples
```
$ curl -D - -H "X-EW-Handler-Debug: onClientRequest" "https://www.example.com/debug/hello?foo=123&bar=456"
HTTP/2 200
content-type: text/html;charset=utf-8
content-length: 675
date: Mon, 18 Nov 2019 03:21:52 GMT
server-timing: cdn-cache; desc=HIT
server-timing: edge; dur=1

<html><body><pre>onClientRequest(request)

Request Object:
{"cpCode":356570,"url":"/debug/hello?foo=123&bar=456","query":"foo=123&bar=456","scheme":"https","path":"/debug/hello","method":"GET","host":"www.example.com","device":{"brandName":"cURL","modelName":"cURL","marketingName":"cURL","resolutionWidth":800,"resolutionHeight":600,"physicalScreenWidth":400,"physicalScreenHeight":400,"xhtmlSupportLevel":4,"isMobile":false,"isWireless":false,"isTablet":false,"hasCookieSupport":true,"hasAjaxSupport":true,"hasFlashSupport":true,"acceptsThirdPartyCookie":true},"userLocation":{"continent":"AS","country":"JP","region":"13","zipCode":"","city":"TOKYO"}}</pre></body></html>
```

```
$ curl -D - -H "X-EW-Handler-Debug: onOriginResponse" "https://www.example.com/debug/hello?foo=123&bar=456"
HTTP/2 200
content-type: text/html;charset=utf-8
x-akamai-transformed: 9 719 0 pmb=mRUM,3
date: Mon, 18 Nov 2019 03:26:28 GMT
content-length: 719
server-timing: cdn-cache; desc=MISS
server-timing: edge; dur=50
server-timing: origin; dur=23

<html><body><pre>onOriginResponse(request, response)

Request Object:
{"cpCode":356570,"url":"/debug/hello?foo=123&bar=456","query":"foo=123&bar=456","scheme":"https","path":"/debug/hello","method":"GET","host":"www.example.com","device":{"brandName":"cURL","modelName":"cURL","marketingName":"cURL","resolutionWidth":800,"resolutionHeight":600,"physicalScreenWidth":400,"physicalScreenHeight":400,"xhtmlSupportLevel":4,"isMobile":false,"isWireless":false,"isTablet":false,"hasCookieSupport":true,"hasAjaxSupport":true,"hasFlashSupport":true,"acceptsThirdPartyCookie":true},"userLocation":{"continent":"AS","country":"JP","region":"13","zipCode":"","city":"TOKYO"}}

Response Object:
{"status":404}
```

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [JavaScript Object reference](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html)
