import { TransformStream } from "streams";
import { httpRequest } from "http-request";
import { createResponse } from "create-response";
import URLSearchParams from "url-search-params";

// Some headers aren't safe to forward from the origin response through an EdgeWorker on to the client
// For more information see the tech doc on create-response: https://techdocs.akamai.com/edgeworkers/docs/create-response
const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'];

function str2uint8arr(s) {
    return Uint8Array.from(Array.from(s, (x) => x.charCodeAt(0)))
}

export function responseProvider(request) {
    let params = new URLSearchParams(request.query);
    let callbackName = params.get("callback");
    params.delete("callback");

    const jsonpTransformer = new TransformStream({
        transform(chunk, controller) {
            if (chunk) {
                controller.enqueue(chunk);
            }
        },
        start(controller) {
            controller.enqueue(str2uint8arr(callbackName + "("));
        },
        flush(controller) {
            controller.enqueue(str2uint8arr(")"));
        }
    });

    const options = { 'headers': {'Accept': 'application/json'} };
    return httpRequest(`${request.scheme}://${request.host}${request.path}?${params.toString()}`, options).then((response) => {
        return createResponse(
          response.status,
          getSafeResponseHeaders(response.getHeaders()),
          response.body.pipeThrough(jsonpTransformer)
        );
    });
}

function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
      if (unsafeResponseHeader in headers){
          delete headers[unsafeResponseHeader]
      }
  }
  return headers;
}
