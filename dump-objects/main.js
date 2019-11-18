export function onClientRequest(request) {
  const header = request.getHeader("X-EW-Handler-Debug");
  if (header !== undefined && header[0] === "onClientRequest") {
    request.respondWith(
      200,
      { "Content-Type": ["text/html;charset=utf-8"] },
      "<html><body><pre>" +
        "onClientRequest(request)\n\n" +
        "Request Object:\n" +
        JSON.stringify(request) +
        "</pre></body></html>"
    );
  }
}

export function onOriginRequest(request) {
  // This handler does not support request.respondWith()
}

export function onOriginResponse(request, response) {
  const header = request.getHeader("X-EW-Handler-Debug");
  if (header !== undefined && header[0] === "onOriginResponse") {
    request.respondWith(
      200,
      { "Content-Type": ["text/html;charset=utf-8"] },
      "<html><body><pre>" +
        "onOriginResponse(request, response)\n\n" +
        "Request Object:\n" +
        JSON.stringify(request) +
        "\n\nResponse Object:\n" +
        JSON.stringify(response) +
        "</pre></body></html>"
    );
  }
}

export function onClientResponse(request, response) {
  // This handler does not support request.respondWith()
}
