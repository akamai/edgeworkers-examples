/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Modify an HTML streamed response by adding a script before the closing head tag.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/response-manipulaton-stream
*/

import { ReadableStream, WritableStream } from 'streams';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';

class HTMLStream {
  constructor () {
    let readController = null;

    const script = '<script>alert("added by EdgeWorker");</script>';
    const tag = '</head>';

    this.readable = new ReadableStream({
      start (controller) {
        readController = controller;
      }
    });

    async function handleTemplate (text) {
      const startIndex = text.indexOf(tag);
      if (startIndex === -1) {
        readController.enqueue(text);
      } else {
        readController.enqueue(text.substring(0, startIndex));
        readController.enqueue(script);
        readController.enqueue(text.substring(startIndex));
      }
    }

    let completeProcessing = Promise.resolve();

    this.writable = new WritableStream({
      write (text) {
        completeProcessing = handleTemplate(text, 0);
      },
      close (controller) {
        completeProcessing.then(() => readController.close());
      }
    });
  }
}

export function responseProvider (request) {
  return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(response => {

    // Get headers from response
    let headers = response.getHeaders();
    // Remove content-encoding header.  The response stream from EdgeWorkers is not encoded.
    // If original response contains `Content-Encoding: gzip`, then the Content-Encoding header does not match the actual encoding.
    delete headers["content-encoding"];
    // Remove `Content-Length` header.  Modifying HTML is likely to change the content length.
    // Leaving the Length of the original content would be incorrect.
    delete headers["content-length"];

    return createResponse(
      response.status,
      headers,
      response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new HTMLStream()).pipeThrough(new TextEncoderStream())
    );
  });
}
