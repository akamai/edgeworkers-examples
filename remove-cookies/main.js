/*jshint esversion: 6 */

// import the Cookies helper module
import {Cookies} from 'cookies';

// list of cookies to remove
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