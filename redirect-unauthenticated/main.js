/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Redirect to login page if request unauthenticated.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/redirect-unauthenticated
*/

// import the Cookies helper module
import {Cookies} from 'cookies';

const loginPageURL = 'http://www.example.com/signin?redirect_url=';

export function onClientRequest(request) {
    
  // create a Cookie jar from incoming request
  let cookieJar = new Cookies(request.getHeader('Cookie'));

  // get value of session identidentier cookie if exists
  let sessionCookie = cookieJar.get('session-id');

  let encodedRequestURL = encodeURIComponent(request.scheme + '://' + request.host + request.url) ;

  if (!sessionCookie) {

    request.respondWith(302, {
      'Location'   : loginPageURL + encodedRequestURL
      },'');
  }

}