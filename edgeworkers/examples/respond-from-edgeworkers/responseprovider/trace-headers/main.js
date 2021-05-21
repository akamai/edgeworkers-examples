/*
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 1.0
Purpose:  Shows Forward request headers via responseProvider
Repo: 
Notes: If query param: getForwardHeaders=body exists, it will output all the headers as the response body instead
      of the original body. Else it outputs them as response headers with a prefix: x-fwd-
*/

import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from 'url-search-params';

function constructResponseBody(request,response){
  const lreq = Object.keys(request.getHeaders()).length
  let t = "<html><body><h2>Request Headers:</h2><br>";
  let i = 0;
  while (i < lreq) {
    const thiskey = Object.keys(request.getHeaders())[i];
    const arritself = request.getHeaders()[thiskey];
    let ii = 0;
    while (ii < arritself.length) {
      let headerval = arritself[ii];
      t += thiskey + ": " + headerval + " <br>";
      ii++;
    }
    i++;
  }
  
  const lres = Object.keys(response.getHeaders()).length
  t += "<br><h2>Response Headers:</h2><br>";
  let i = 0;
  while (i < lres) {
    const thiskey = Object.keys(response.getHeaders())[i];;

    const arritself = response.getHeaders()[thiskey];
    let ii = 0;
    while (ii < arritself.length) {
      let headerval = arritself[ii];
      t += thiskey + ": " + headerval + " <br>";
      ii++;
    }
    i++;
  }
  t += "</body></html>";
  return t;
}



function constructResponseHeaders(request, response){
  const lreq = Object.keys(request.getHeaders()).length
  let i = 0;
  let finalHeaders = response.getHeaders();
  if (!finalHeaders) {
    finalHeaders = {}
  }
  while (i < lreq) {
    const thiskey = Object.keys(request.getHeaders())[i];
    const arritself = request.getHeaders()[thiskey];
    let ii = 0;
    let newk = 'x-fwd-' + thiskey;
    finalHeaders[newk] = [];

    while (ii < arritself.length) {
      let headerval = arritself[ii];
      finalHeaders[newk].push(headerval);
      ii++;
    }
    i++;
  }
  
  return finalHeaders;
}

function returnInBody(request){
  const queryParamName = 'getForwardHeaders';
  const params = new URLSearchParams(request.query);
  const paramValue = params.get(queryParamName);
  if (paramValue) {
    if (paramValue == "body") {
      return true;
    }else{
      return false;
    }
  }
  return false;
}

export function responseProvider (request) {
  const options = {}
 
  options.method = request.method;
  options.headers = request.getHeaders();

  if (returnInBody(request)){
    return httpRequest(`${request.scheme}://${request.host}${request.url}`, options).then(response => {
      return createResponse(
        response.status,
        response.getHeaders(),
        constructResponseBody(request, response)
      );
    });
  }else{
    return httpRequest(`${request.scheme}://${request.host}${request.url}`, options).then(response => {
      return createResponse(
        response.status,
        constructResponseHeaders(request, response),
        response.body
      );
    });
  }
}