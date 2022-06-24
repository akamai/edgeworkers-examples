/*
(c) Copyright 2022 Akamai Technologies, Inc. Licensed under Apache 2 license.

Purpose:  Concatenate multiple subrequests into a single output stream

*/

import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TransformStream } from 'streams';

const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'];

  function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
      if (unsafeResponseHeader in headers) {
          delete headers[unsafeResponseHeader]
      }
  }
  return headers;
}

async function concatSubrequestsToStream(urls, requestHeaders, writableStream) {

  // Begin requests for all URLs, generating a list of promises
  const responsePromises = urls.map(url => httpRequest(url, {headers: requestHeaders}));

  // iterate through each promise
  for (let responsePromise of responsePromises) { 
    // wait for response to be available
    let response = await responsePromise;
    if (response.ok) {
      // Pipe response to main output stream and wait.
      // Prevent default behavior of closing the main output stream
      await response.body.pipeTo(writableStream, {preventClose: true});
    }else{
      // Throw error if we receive an unsuccessful status code to abot processing
      throw `Received ${response.status}`
    }
  }
  
  // Close stream
  await writableStream.close();
}

export async function responseProvider (request) {
  // List of URLs to concatenate
  const urls = ["/example/url/1.js", "/example/url/2.js"]

  const requestHeaders = getSafeResponseHeaders(request.getHeaders());


  const outputStream = new TransformStream();
  concatSubrequestsToStream(urls, requestHeaders, outputStream.writable);
    
  return createResponse(
    200,
    { 'Content-Type': ['text/html'] },
    outputStream.readable
  );
}