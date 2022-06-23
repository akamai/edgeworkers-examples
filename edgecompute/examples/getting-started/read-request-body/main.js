/*
(c) Copyright 2022 Akamai Technologies, Inc. Licensed under Apache 2 license.

Purpose:  EdgeWorker that generates a simple response from the Edge, echoing the contents from the incoming request body
*/

import { createResponse } from 'create-response';

// using async event handler to allow "await" syntax
export async function responseProvider (request) {

    // Read request body as text.
    // "await" keyword is used to simplify code flow of handling the Promise returned from request.text()
    let bodytext = await request.text();
  
    // Create a simple response and return it to the client
    return createResponse(
        200, 
        { 'Powered-By': ['Akamai EdgeWorkers'] },
        `${request.method}: ${bodytext}`
    );
}
