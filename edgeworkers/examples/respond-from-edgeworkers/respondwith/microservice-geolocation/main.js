/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Respond with JSON formatted geographical location information.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/microservice-geolocation
*/

export function onClientRequest (request) {
  var info = {};

  info.continent = (request.userLocation.continent) ? request.userLocation.continent : 'N/A';
  info.country = (request.userLocation.country) ? request.userLocation.country : 'N/A';
  info.zip = (request.userLocation.zipCode) ? request.userLocation.zipCode : 'N/A';
  info.region = (request.userLocation.region) ? request.userLocation.region : 'N/A';
  info.city = (request.userLocation.city) ? request.userLocation.city : 'N/A';

  info.source = 'Akamai EdgeWorkers';

  request.respondWith(200, {}, JSON.stringify({ geoInfo: info }));
}
