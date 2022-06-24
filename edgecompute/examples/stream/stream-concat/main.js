/*
(c) Copyright 2022 Akamai Technologies, Inc. Licensed under Apache 2 license.

Purpose:  Concatenate multiple subrequests into a single output stream

*/

import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TransformStream } from 'streams';

async function concatSubrequestsToStream(urls, writableStream) {

  // Begin requests for all URLs, generating a list of promises
  const responsePromises = urls.map(url => httpRequest(url));

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
  const outputStream = new TransformStream();
  concatSubrequestsToStream(urls, outputStream.writable);
    
  return createResponse(
    200,
    { 'Content-Type': ['text/html'] },
    outputStream.readable
  );
}