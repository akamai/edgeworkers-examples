import URLSearchParams from 'url-search-params';
import { createResponse } from 'create-response';
import { EdgeKV } from './lib/edgekv.js';

function createErrorResponse(message) {
  return createResponse(
    400,
    {'Content-Type':['application/json;charset=utf-8']},
    JSON.stringify({error: message})
  );
}

function createInvalidCodeResponse() {
  return createResponse(
    404,
    {'Content-Type':['application/json;charset=utf-8']},
    JSON.stringify({error: 'Code is not valid'})
  );
}

function createValidCodeResponse(code) {
  return createResponse(
    200,
    {'Content-Type':['application/json;charset=utf-8']},
    JSON.stringify(code)
  );
}


export async function responseProvider(request) {
  const now = Date.now() / 1000;
  const params = new URLSearchParams(request.query);
  const promocode = params.get('code');

  // Respond with an error if code is not passed in.
  if(!promocode){
    return createErrorResponse('code parameter must be provided');
  }

  const edgeKv = new EdgeKV({namespace: "ecom", group: "promocodes"});
  try {
    // Lookup promo code from EdgeKV
    let promo = await edgeKv.getJson({ item: promocode});

    if (!promo || promo.valid_from > now || promo.valid_to < now) {
      // Respond with an error if promo is not found
      // or promo is not valid for current date
      return createInvalidCodeResponse();
    }

    // Valid promo found
    return createValidCodeResponse(promo);
  } catch (error) {
    return createErrorResponse(error.toString());
  }
}
