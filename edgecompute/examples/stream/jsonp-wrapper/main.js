import { TransformStream } from "streams";
import { httpRequest } from "http-request";
import { createResponse } from "create-response";
import URLSearchParams from "url-search-params";

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

        // Get headers from response
        let headers = response.getHeaders();
        // Remove content-encoding header.  The response stream from EdgeWorkers is not encoded.
        // If original response contains `Content-Encoding: gzip`, then the Content-Encoding header does not match the actual encoding.
        delete headers["content-encoding"];
        // Remove `Content-Length` header.  Modifying JSON is likely to change the content length.
        // Leaving the Length of the original content would be incorrect.
        delete headers["content-length"];

        return createResponse(
          response.status,
          headers,
          response.body.pipeThrough(jsonpTransformer)
        );
    });
}
