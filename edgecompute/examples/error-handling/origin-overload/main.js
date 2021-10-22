/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.
Version: 0.1
Purpose:  Present a useful error page to the user, instead of a plain 503, and include js to automatically retry after the period indicated in the 'Retry-After' header.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/origin-overload
*/

/*
onOriginResponse: This event happens as the origin response is created.
The event only happens if the response is not served from cache and not constructed on the edge.
Use this event if you want to modify the response before it is cached.
*/
export function onOriginResponse (request, response) {
  response.addHeader('Origin-Response-Status', response.status);

  if (response.status === 503) {
    var retry = parseInt(response.getHeader('Retry-After')) || 10;
    request.respondWith(200, { 'Content-Type': ['text/html'] }, '<html><script> setTimeout(function () { window.location.href="' + escape(request.path) + '"; }, ' + retry + '*1000);</script> <body>The origin server is currently overloaded, please retry in ' + retry + ' seconds </body></html>');
  }
}
