/*
onOriginResponse: This event happens as the origin response is created. 
The event only happens if the response is not served from cache and not constructed on the edge. 
Use this event if you want to modify the response before it is cached.
*/
export function onOriginResponse(request, response) {
  response.addHeader('Origin-Response-Status',response.status);
  
  if(response.status==503){
    var retry = parseInt(response.getHeader('Retry-After')) || 10;
    request.respondWith(200, {'Content-Type': ['text/html']  }, '<html>The origin server is currently overloaded, please retry in ' + retry + ' seconds <script> setTimeout(function () { window.location.href= "https://www.foundry.systems/originoverload/"; }, ' + retry + '*1000);</script></html>');
  }
}
