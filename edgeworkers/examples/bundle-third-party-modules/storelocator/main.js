import URLSearchParams from 'url-search-params';

import KDBush from 'kdbush';
import geokdbush from 'geokdbush';

import locations from './data/locations.json';

// Initialize index of locations
const indexedLocations = new KDBush(locations.elements, (p) => p.lon, (p) => p.lat);

export function onClientRequest (request) {
  // Extract longitude and latitude from query string
  const params = new URLSearchParams(request.query);
  const lat = Number(params.get('lat'));
  const lon = Number(params.get('lon'));

  // Respond with an error if lat or lon are not passed in.
  if (!lon || !lat) {
    request.respondWith(
      400,
      { 'Content-Type': ['application/json;charset=utf-8'] },
      JSON.stringify({ error: 'lat and lon parameters must be provided' })
    );
    return;
  }
  // var nearest = geokdbush.around(indexedLocations, -83.259, 42.292, 2);

  // Find 2 closest locations
  const nearest = geokdbush.around(indexedLocations, lon, lat, 2);

  if (!nearest) {
    request.respondWith(
      400,
      { 'Content-Type': ['application/json;charset=utf-8'] },
      JSON.stringify({ error: `Error locating nearby locations. lat:${lat}, lon:${lon}` })
    );
    return;
  }

  const result = [];
  for (var i = 0; i < nearest.length; i++) {
    const location = nearest[i];
    // calulate distance and convert to miles
    const distance = geokdbush.distance(lon, lat, location.lon, location.lat) / 1.609;
    // add distance and location to the result
    result.push({ distance: distance, location: location });
  }

  // Respond with json result containing nearest locations
  request.respondWith(
    200,
    { 'Content-Type': ['application/json;charset=utf-8'] },
    JSON.stringify(result, null, 2));
}
