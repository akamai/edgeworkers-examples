/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Respond with allow or deny message depending on country of end user.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/traffic-allow-list
*/

// List of currently US embargoed countries, plus N/A indicating no country data found (rare, if any)
const embargoedCountries = ['IR', 'KP', 'SY', 'SD', 'CU', 'VE', 'N/A'];

export function onClientRequest (request) {
  // Collect the end user's country based on Akamai EdgeScape data
  const country = (request.userLocation.country) ? request.userLocation.country : 'N/A';

  // Check if end user's country is in embargo list
  const embargoed = embargoedCountries.includes(country);

  // Provide appropriate messaging based on embargo status
  if (!embargoed) {
    request.respondWith(200, { 'Content-Type': ['text/html;charset=utf-8'] }, '<html><body><h1>Hello ' + country + ' from Akamai EdgeWorkers!</h1></body></html>');
  } else {
    request.respondWith(403, { 'Content-Type': ['text/html;charset=utf-8'] }, '<html><body><h1>Sorry, users from ' + country + ' may not view this content</h1></body></html>', 'EW-embargo');
  }
}
