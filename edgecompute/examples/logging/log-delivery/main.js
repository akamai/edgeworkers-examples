/*
(c) Copyright 2024 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.2
Purpose:  EdgeWorker that generates a simple html page at the Edge and adds a response header, with additional logging.
          To use - please provide a vaild ds2_id information in 'bundle.json' file.

*/

// Import logging module
import { logger } from 'log';

export function onClientRequest(request) {
  let random_value_0_to_10 = Math.floor(Math.random() * 10);
  if (random_value_0_to_10 > 5) { //  Simulate an error for some requests
    logger.error("Oh no, a seemingly random bug appeared! Value: %i", random_value_0_to_10);
  }
  logger.info("Responding with hello world from the path: %s", request.path);
  logger.debug("Request device - is mobile: %s", request.device.isMobile);

  request.respondWith(
    200, {},
    '<html><body>\
    <h1>Hello World From Akamai EdgeWorkers</h1>\
    </body></html>');
}

export function onClientResponse(request, response) {
  let data = {
    name: "EdgeWorkers",
    value: 1,
  };
  logger.info("Data object: %o", data)//Log complex object
}
