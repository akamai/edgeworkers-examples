import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { logger } from 'log';

// Add/remove unsafe headers from this list as required. This headers will be removed form origin response before sending to client.
const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade', 'host'];

function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
    if (unsafeResponseHeader in headers) {
      delete headers[unsafeResponseHeader];
    }
  }
  return headers;
}

export async function responseProvider (request) {
  // Read Akamaized origin hostname from user defined variable.
  const originA = request.getVariable('PMUSER_ORIGINA_HOST');
  const originB = request.getVariable('PMUSER_ORIGINB_HOST');

  const headers = request.getHeaders();
  delete headers['host'];
  let options = {};

  options.method = request.method;
  options.headers = headers;
  options.body = await request.text();

  const promiseA = httpRequest(`${request.scheme}://${originA}${request.url}`, options);
  const promiseB = httpRequest(`${request.scheme}://${originB}${request.url}`, options);

  try {
    const [responseFromOriginA, responseFromOriginB] = await Promise.all([promiseA, promiseB]);

    return createResponse(
      responseFromOriginA.status,
      getSafeResponseHeaders(responseFromOriginA.getHeaders()),
      responseFromOriginA.body
    );
  } catch (error) {
    logger.log('Error: %s', error.message);
    throw error;
  }
}
