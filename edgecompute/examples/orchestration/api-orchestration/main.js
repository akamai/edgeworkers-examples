/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Combine 3 api endpoints returning JSON into a single JSON response.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/api-orchestration-buffered
*/

import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';

const endPoint1 = '/api/example/endpoint1';
const endPoint2 = '/api/example/endpoint2';
const endPoint3 = '/api/example/endpoint3';

async function getJSON (url) {
  const response = await httpRequest(`${url}`);
  if (response.ok) {
    return await response.json();
  } else {
    return { error: `Failed to return ${url}` };
  }
}

// The responseProvide function generates a response, acting as a "surrogate origin".
// The response may be cached according to the caching rules configured in the property.
export async function responseProvider (request) {
  const result = {};

  // Make all requests in parallel to retrieve content.
  const endPointResult1 = getJSON(endPoint1).then(json => { result.endPoint1 = json; });
  const endPointResult2 = getJSON(endPoint2).then(json => { result.endPoint2 = json; });
  const endPointResult3 = getJSON(endPoint3).then(json => { result.endPoint3 = json; });

  // Wait for all requests to complete.
  await Promise.all([endPointResult1, endPointResult2, endPointResult3]);

  // Return merged JSON as the response.
  return Promise.resolve(createResponse(
    200,
    { 'Content-Type': ['application/json'] },
    JSON.stringify(result)
  ));
}
