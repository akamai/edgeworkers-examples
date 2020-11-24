/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Using EdgeScape geo data, redirect user to country specific content
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/redirect-geo
*/
// define country top level domain mapping
const tldMap = {
  CA: '.ca',
  GB: '.co.uk',
  US: '.com'
};

export function onClientRequest (request) {
  // Break out sub domain from host
  const subDomain = request.host.split('.')[0];

  // Break out domain from host
  const domain = request.host.split('.')[1];

  // determine top level domain based on request origin country
  let tld = tldMap[request.userLocation.country];

  // if top level domain is supported default to .com
  if (tld === undefined) {
    tld = '.com';
  }

  // built up new domain
  const redirectDomain = subDomain + '.' + domain + tld;

  // check incoming host different against built up host
  if (request.host !== redirectDomain) {
    // redirect to new host
    request.respondWith(302, {
      Location: [request.scheme + '://' + redirectDomain + request.url]
    }, '');
  }
}
