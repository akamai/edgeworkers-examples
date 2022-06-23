/*
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 1.1
Purpose:  Shows Forward request headers via responseProvider
Repo: 
Notes: If query param: getForwardHeaders=body exists, it will output all the headers as the response body instead
of the original body. Else it outputs them as response headers with a prefix: x-fwd-
*/
import {httpRequest} from 'http-request';
import {createResponse} from 'create-response';
import URLSearchParams from 'url-search-params';

// Some headers aren't safe to forward from the origin response through an EdgeWorker on to the client
// For more information see the tech doc on create-response: https://techdocs.akamai.com/edgeworkers/docs/create-response
const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'];

/* 
Construct entire response body to include request and response headers
*/
function constructResponseBody(request, response) {
  let responseBody = "<html><body><h2>Request Headers:</h2><br>";

  // Get Request headers and append to response body
  Object.keys(request.getHeaders()).forEach((key) => {
    request.getHeaders()[key].forEach((headerval) => {
      responseBody += key + ": " + headerval + " <br>";
    });
  });

  responseBody += "<br><h2>Response Headers:</h2><br>";

  // Get Response headers and append to response body
  Object.keys(response.getHeaders()).forEach((key) => {
    response.getHeaders()[key].forEach((headerval) => {
      responseBody += key + ": " + headerval + " <br>";
    });
  });

  responseBody += "</body></html>";
  return responseBody;
}


/* 
Construct response headers by adding request headers prepended by x-fwd-
*/

function constructResponseHeaders(request, response) {

  //header array we'll eventually print, plus our own
  let finalHeaders = response.getHeaders();

  if (!finalHeaders) {
    finalHeaders = {}
  }

  finalHeaders = getSafeResponseHeaders(finalHeaders);
  
  //We look at all the request headers, and for each, we prepend x-fwd- and add them to the response headers array
  Object.keys(request.getHeaders()).forEach((headerName) => {
    const valuesForHeaderName = request.getHeaders()[headerName];
    var newHeaderName = 'x-fwd-' + headerName;
    finalHeaders[newHeaderName] = [];
    valuesForHeaderName.forEach((headerVal) => {
      finalHeaders[newHeaderName].push(headerVal);
    });
  });

  return finalHeaders;
}

/* 
Determines if query parameter getForwardHeaders=body exists. If exists, returns all headers in a constructed 
response body. Else, it returns request headers in the response headers, prepended by x-fwd-
*/
function returnInBody(request) {
  const queryParamName = 'getForwardHeaders';
  const params = new URLSearchParams(request.query);
  const paramValue = params.get(queryParamName);
  if (paramValue) {
    if (paramValue == "body") {
      return true;
    }
  }
  return false;
}

export function responseProvider(request) {
  const options = {}

  options.method = request.method;
  options.headers = request.getHeaders();
  delete options.headers["pragma"];
  delete options.headers["accept-encoding"];
  delete options.headers["host"];

  const reqUrl = request.scheme + '://' + request.host + request.url;

  return httpRequest(`${reqUrl}`, options).then(response => {
    if (returnInBody(request)) {
      return createResponse(
        response.status,
        getSafeResponseHeaders(response.getHeaders()),
        constructResponseBody(request, response)
      );
    } else {
      return createResponse(
        response.status,
        constructResponseHeaders(request, response),
        response.body
      );
    }
  });

}

// Find and replace stream changes the original content, some origin response headers are therefore no longer valid and should be removed
function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
      if (unsafeResponseHeader in headers){
          delete headers[unsafeResponseHeader]
      }
  }
  return headers;
}
