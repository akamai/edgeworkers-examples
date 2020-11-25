/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Repo: https://github.com/akamai/edgeworkers-examples/tree/master/cookie-geolocation
*/

// Import cookies library to provide helper functions
import { SetCookie } from 'cookies';
import { salesRegions } from 'data.js';

// Helper function to find a sales region by state.
function findRegionByState (state) {
  return salesRegions.find((region) => region.states.includes(state));
}

// Add cookie in the outgoing response to the browser
export function onClientResponse (request, response) {
  // Retrieve user location from the request object
  const userLocation = request.userLocation;

  // Extract country, region (e.g., U.S. state), and city from userLocation
  const country = userLocation.country || 'N/A';
  const region = userLocation.region || 'N/A';
  const city = userLocation.city || 'N/A';
  const salesRegion = findRegionByState(region);

  // Create a cookie, with location fields separate by '+'
  const locationCookieValue = `${country}+${region}+${city}`;

  // Create cookie with an expiration of 1 day (86,400 seconds)
  var cookie = new SetCookie({
    name: 'location',
    value: locationCookieValue,
    path: '/',
    maxAge: 86400
  });

  // Add cookie header to outgoing  response
  response.addHeader('Set-Cookie', cookie.toHeader());

  //  If sales region is found, then also add the salesRegion cookie
  if (salesRegion) {
    const regionDataCookieValue = `${salesRegion.name}:${salesRegion.population}`;
    var salesRegionCookie = new SetCookie({
      name: 'salesRegion',
      value: regionDataCookieValue,
      path: '/',
      maxAge: 86400
    });
    response.addHeader('Set-Cookie', salesRegionCookie.toHeader());
  }
}
