/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Respond with protected details if the correct code is given as a GET param
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/conference-details
*/
import URLSearchParams from 'url-search-params';

export function onClientRequest (request) {
  var params = new URLSearchParams(request.query);
  if (params.get('key') === 'abc123') {
    request.respondWith(200, { 'Content-Type': ['text/html'] }, '<html>Welcome to the conference.<br>Here are the venue details:<br><b>123 Main Street, San Francisco, CA<br>Dec, 6th 2019 10pm sharp</b></html>');
  } else {
    request.respondWith(200, { 'Content-Type': ['text/html'] }, '<html>You have entered an incorrect code.</html>');
  }
}
