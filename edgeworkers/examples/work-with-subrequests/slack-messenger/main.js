import URLSearchParams from "url-search-params";
import { httpRequest } from "http-request";

export function onClientRequest(request) {
  let params = new URLSearchParams(request.query);
  let data = '{"text":"' + (params.get("message") || "no message details") + '"}';
  let url = `${request.scheme}://${request.host}/webhookpath/`;
  try {
    httpRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    });
  } catch (error) {
    logger.log(`Error: ${error.toString()}`);
  }
}
