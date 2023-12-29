/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Modify an HTML streamed response by adding a script before the closing head tag.

*/

import { ReadableStream, WritableStream } from 'streams';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';

// Some headers aren't safe to forward from the origin response through an EdgeWorker on to the client
// For more information see the tech doc on create-response: https://techdocs.akamai.com/edgeworkers/docs/create-response
const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'];

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
        return completeProcessing;
      },
      close (controller) {
        return completeProcessing.then(() => readController.close());
      }
    });
  }
}

export function responseProvider (request) {
  return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(response => {
    return createResponse(
      response.status,
      getSafeResponseHeaders(response.getHeaders()),
      response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new HTMLStream()).pipeThrough(new TextEncoderStream())
    );
  });
}

function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
      if (unsafeResponseHeader in headers) {
          delete headers[unsafeResponseHeader]
      }
  }
  return headers;
}
