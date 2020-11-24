/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Remove unwanted Cookies from being sent to the Origin
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/remove-cookies
*/

// import the Cookies helper module
import { Cookies } from 'cookies';

// list of GA cookies to safely remove
const GACookieList =
    ['_ga', '_gat', '__utm.', 'utmctr', 'utmcmd.', 'utmccn.'];

// list of doubleClick cookies to safely remove
const doubleClickCookieList = ['__gads'];

// list of Quant Capital cookies to safely remove
const quantCapitalCookieList = ['__qc'];

// list of ADDThis cookies to safely remove
const addThisCookieList = ['__atuv.'];

// build list of cookies to remove
const removeCookieList = [...GACookieList, ...doubleClickCookieList, ...quantCapitalCookieList, ...addThisCookieList];

// remove cookies before being sent to origin
// use onClientRequest if wanting to remove incoming

export function onOriginRequest (request) {
  // create a Cookie jar from incoming request cookies
  const cookieJar = new Cookies(request.getHeader('Cookie'));

  // get all the cookie names from the Cookie jar
  const cookieNames = cookieJar.names();

  // built list of product cookies found in incoming cookie
  const removeCookies =
      cookieNames.filter(cookie => removeCookieList.includes(cookie));

  // if product cookies found remove each of them from cookie jar
  if (removeCookies) {
    removeCookies.forEach(cookie => cookieJar.delete(cookie));

    // replace the Cookie header with the resulting cookieJar
    request.setHeader('Cookie', cookieJar.toHeader());
  }
}
