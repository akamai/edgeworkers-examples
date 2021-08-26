/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 1.0.0

Purpose:
  Implements a simple "Hello World" Dynamic Content Assembly EW whereby the 
  response is dynamically constructed based on the Accept-Language header 
  in the request.
  For simplicity, the 1st Accept-Language header encountered is used as key
  to retrieve the corresponding language specific greeting from EdgeKV.
  
Repo: https://github.com/akamai/edgeworkers-examples/edgekv/examples/hello-world
*/

import { createResponse } from 'create-response';
import { EdgeKV } from './edgekv.js';

// Create simple Hello World Response based on request Accept-Language
async function hello_world_response(request) {
    
    // Defaults to use if item not in EdgeKV
    let default_greeting = "Hello World";
    let language = "en";
    let content_lang = "en-US";
    let greeting = "";
    let err_msg = ""
    
    // Retrieve Accept-Language header & extract language key
    let languages = request.getHeader('Accept-Language');
    if (languages && languages[0]) {
        content_lang = languages[0].split(',')[0];
        language = content_lang.split('-')[0];
    }
    let key = language.toLowerCase();
    
    // Set Up EdgeKV
    const edgeKv = new EdgeKV({namespace: "default", group: "greetings"});
    
    // Retrieve the greeting associated with the language using the latter 
    // as key. We use a default greeting if the item is not found.
    try {
        greeting = await edgeKv.getText({ item: key, 
                                          default_value: default_greeting });
    } catch (error) {
        // Catch the error and store the error message to use in a response
        // header for debugging. Use a default greeting as well in this case.
        err_msg = error.toString();
        greeting = default_greeting;
    }

    // Construct a simple html response with the greeting (and lang) in the body
    let html_body = '<!DOCTYPE html> \
                     <html lang="'+ language + '" xml:lang="' + language +'"> \
                     <head> \
                       <meta charset="UTF-8"> \
                     </head> \
                     <body><H1>' + greeting + '</H1></body>';
    
    // We choose to always send back a 200 OK with a default greeting
    // and just log any errors in the 'X-EKV-ERROR' response header
    let response = {status: 200, 
                    headers: 
                      {'Content-Type': ['text/html'], 
                       'Content-Language': [content_lang],
                       // Safely Encode the error message to remove unsafe chars
                       // but also replace some encoded strings with safe chars for readability
                       'X-EKV-ERROR': [encodeURI(err_msg).replace(/(%20|%0A|%7B|%22|%7D)/g, " ")]
                      },
                    body: html_body};
    
    // Send Response
    return createResponse(response.status,
                          response.headers,
                          response.body);
}

export async function responseProvider(request) {
    return hello_world_response(request)
}
