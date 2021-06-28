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
        return createResponse(
            response.status,
            response.headers,
            response.body.pipeThrough(jsonpTransformer)
        );
    });
}
