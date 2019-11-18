/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Remove unwanted Cookies from being sent to the Origin
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/remove-cookies
*/
// import the Cookies helper module
import {Cookies} from 'cookies';

// list of GA cookies to safely remove
const removeGACookieList =
    ['_ga', '_gat', '__utm.', 'utmctr', 'utmcmd.', 'utmccn.'];

// remove cookies before being sent to origin
// use onClientRequest if wanting to remove incoming

export function onOriginRequest(request) {
  // create a Cookie jar from request
  let cookieJar = new Cookies(request.getHeader('Cookie'));

  // get all cookie names from cookie jar
  let cookieNames = cookieJar.names();

  // built list of existing cookies included in removeGACookieList
  let removeCookies =
      cookieNames.filter(cookie => removeGACookieList.includes(cookie));

  // if extra cookies remove each of them from cookie jar
  // replace cookie header
  if (removeCookies) {
    for (var i = 0; i < removeCookies.length; i++) {
      // remove each cookie in the removeCookies list
      cookieJar.delete(removeCookies[i]);
    }

    // replace the Cookie header with the resulting cookieJar
    request.setHeader('Cookie', cookieJar.toHeader());
  }
}