/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Respond with empty JSON if cart cookie not part of request.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/empty-cart
*/

import { Cookies, SetCookie } from 'cookies';

export function onClientRequest (request) {
  const cookies = new Cookies(request.getHeader('Cookie'));
  var cartCookie = cookies.get('cart');

  if (!cartCookie) {
    request.respondWith(200, { 'Content-Type': ['application/json; charset=utf-8'] }, '{}');
  }
}
