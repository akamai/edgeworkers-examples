import { EdgeKV } from "./edgekv.js"; //include this file from the parent repository. https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js
import { logger } from "log";

const edgeKv = new EdgeKV({ namespace: "im", group: "pristine" });

export function onClientResponse(request, response) {
  if (response.status === 200) {
    let key = request.getVariable("PMUSER_PATH_SHA1");
    let size = 0;
    let header = response.getHeader("Content-Length");

    if (header) {
      size = header[0];

      try {
        edgeKv.putText({ item: key, value: size });
      } catch (error) {
        logger.log(`EKV: ${error.toString()} - Key is: ${key}`);
      }
    }
  }
}
