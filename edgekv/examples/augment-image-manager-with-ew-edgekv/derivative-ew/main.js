import { EdgeKV } from "./edgekv.js"; //include this file from the parent repository. https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js
import { logger } from "log";

const edgeKv = new EdgeKV({ namespace: "im", group: "pristine" });

export async function onClientRequest(request) {
  let size = 0;
  try {
    let key = request.getVariable("PMUSER_PATH_SHA1"); //this variable is set in Property Manager for the delivery configuration and contains the hashed URL, protocol+domain typically excluded
    let value = await edgeKv.getText({ item: key });
    if (value !== null) {
      size = parseInt(value) || 0;
    }
  } catch (error) {
    logger.log(`EKV: ${error.toString()} - Key is: ${key}`);
  }
  request.setVariable("PMUSER_PRISTINE_SIZE", size); //this is the variable that will be used by Image Manager, also defined in Property Manager
}
