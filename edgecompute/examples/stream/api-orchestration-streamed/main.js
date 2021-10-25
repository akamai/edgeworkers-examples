/*
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Combine 3 api endpoints returning JSON into a single JSON response, using streams, so that larger files can be used.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/api-orchestration-streamed
*/

import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TransformStream } from 'streams';

const apiEndPoints = ['/api/example/endpoint1', '/api/example/endpoint2', '/api/example/endpoint3']

function getRequestPromise(url) {
  return httpRequest(`${url}`);
}
let outputStream = new TransformStream();

function concatenateStreams(readables) {
  outputStream = new TransformStream();
  let promise = Promise.resolve();
  let closedRequests = 0;
  let preventClose = true;

  for (const readable of readables) {//where readables is the array of responsePromises, and 'for of' waits for promises to resolve before moving on
    promise = readable.then(
       //success handler
      response => {
        if (++closedRequests === readables.length) {
          //if we're outputting the last request, we'll have the stream close down.
          preventClose = false;
        }
        // write the response stream
        response.body.pipeThrough(outputStream, { preventClose: preventClose })
      },
      //error handler
      reason => {
        return Promise.all([
          outputStream.writable.abort(reason),
          readable.cancel(reason)
        ]);
      }
    );
  }
  return outputStream.readable;
}


// The responseProvider function generates a response, acting as a "surrogate origin".
// The response may be cached according to the caching rules configured in the property.
export async function responseProvider (request) {
  
  // Make all requests in parallel to retrieve content.
  var jsonResponsePromises = apiEndPoints.map(file=>getRequestPromise(file));

  concatenateStreams(jsonResponsePromises);

  // Return merged JSON as the response.
  return Promise.resolve(createResponse(
    200,
    { 'Content-Type': ['application/json'] },
    outputStream.readable
  ));

}
