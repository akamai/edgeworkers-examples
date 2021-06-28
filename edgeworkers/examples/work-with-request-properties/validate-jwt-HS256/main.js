/*
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Validate JSON Web Tokens on client request to determine an enhanced experience header to be passed to origin.
*/

import JWT from './jwt.js';

/* HS256 uses symmetric key encryption. This key should be stored in a secret variable in the property */
const secretKey = "qwertyuiopasdfghjklzxcvbnm123456";

/*
 * onClientRequest handler to check JWT for enhanced role,
 * then set a header to origin with enhanced status and
 * set the cache key to observe this status.
 */
export function onClientRequest(request) {
  let token;
  try {
    /* get JWT from request, e.g. from a cookie or request header */
    token = request.getHeader("x-jwt")[0];
  } catch (e) {
    /* handle missing header */
    request.addHeader("x-enhanced",false);
    request.addHeader("x-reason","no x-jwt header");
  }
  /* validate token has correct structure */
  if (token.split(".").length == 3) {
    try {
      /* create new JWT instance */
      let jwt = new JWT(token,secretKey);
      let enhanced = false;
      let reason = "";

      /* detect enhanced experience entitlement, failing early to reduce CPU cycles */
      if (!jwt.body.hasOwnProperty("Role") || jwt.body.Role.toLowerCase() != 'enhanced') {
        reason = "no entitlement in jwt";
        request.addHeader("x-enhanced",false);
        request.addHeader("x-reason",reason);
      } else if (jwt.isExpired()) {
        reason = "jwt is expired";
        request.addHeader("x-enhanced",false);
        request.addHeader("x-reason",reason);
      } else if (!jwt.signatureMatches()) {
        reason = "signature mismatch";
        request.addHeader("x-enhanced",false);
        request.addHeader("x-reason",reason);
      } else {
        request.addHeader("x-enhanced",true);
        enhanced = true;
      }

      /* set PMUSER variable and add to the cache key (requires variable set in property) */
      request.setVariable("PMUSER_ENHANCED_EXPERIENCE",enhanced);
      request.setVariable("PMUSER_ENHANCED_REASON",reason);
      request.cacheKey.includeVariable('PMUSER_ENHANCED_EXPERIENCE');
    } catch (e) {
      /* handle failed JWT */
      request.addHeader("x-enhanced",false);
      request.addHeader("x-reason","failed JWT parse");
    }
  }
}

/*
 * demo function to expose data that would normally only be sent to origin 
 */

import { createResponse } from 'create-response';

export async function responseProvider(request,response) {
  let enhanced = request.getVariable("PMUSER_ENHANCED_EXPERIENCE") || "unknown";
  let reason = request.getVariable("PMUSER_ENHANCED_REASON") || "no reason";
  return createResponse(200,{'Content-Type':'text/plain'},`Enhanced: ${enhanced}. Reason: ${reason}.`);
}