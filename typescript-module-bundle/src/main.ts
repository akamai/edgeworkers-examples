import { hash } from "./hash";

export function onClientRequest(
  request: EW.ImmutableRequest & EW.HasRespondWith,
  response: EW.Response
) {
  request.respondWith(
    200,
    {},
    "<html><body><h1>Hello World From Akamai EdgeWorkers</h1></body></html>"
  );
}

export function onClientResponse(
  request: EW.ImmutableRequest,
  response: EW.Response
) {
  /**
   * Example of using custom modules. "hash" is a ES module in TypeScript and
   * it consumes a npm CommonJS module. Rollup is able to bundle both type of
   * modules into one single file "main.js" and it is ready for the rest of
   * the build process and deployment.
   */
  const hashedMessage = hash("From Akamai EdgeWorkers");
  response.setHeader("X-Hello-World", hashedMessage);
}
