import { crypto, pem2ab } from 'crypto';
import URLSearchParams from 'url-search-params';
import { TextEncoder, base64, atob } from 'encoding';
import { logger } from 'log';

const host = 'https://<YOUR HOST>'
const publicKey = `<YOUR PUBLIC KEY>`;
const keyPairId = '<YOUR KEY PAIR ID>';

export async function onClientRequest(request) {
  const url = host + request.path;
  const params = new URLSearchParams(request.query);

  // Check if Policy, Signature, and Key-Pair-Id exist
  if (!params.get('Policy') || !params.get('Signature') || params.get('Key-Pair-Id') !== keyPairId) {
    respondWithError(request, 'Invalid');
    return;
  }

  const policy = params.get('Policy');
  const replacedPolicy = policy.replace(/_/g, '');

  let decodedPolicy;
  try {
    decodedPolicy = atob(replacedPolicy);
  } catch (error) {
    respondWithError(request, 'Policy is invalid');
    return;
  }

  // Extract Resource
  const resourcePattern = /"Resource"\s*:\s*"([^"]+)"/;
  const resourceMatch = decodedPolicy.match(resourcePattern);
  const resource = resourceMatch && resourceMatch[1];

  // Check Resource
  if (url !== resource) {
    respondWithError(request, 'URL is wrong');
    return;
  }

  // Extract AWS:EpochTime
  const timePattern = /"AWS:EpochTime":(\d+)/;
  const timeMatch = decodedPolicy.match(timePattern);
  const expiresParam = parseInt(timeMatch[1], 10);
  const clockTimestamp = Math.floor(Date.now() / 1e3);

  // Check Expire
  if (clockTimestamp > expiresParam) {
    respondWithError(request, 'Token is expired');
    return;
  }

  const signatureParam = params.get('Signature');
  if (!await validateSignature(signatureParam, decodedPolicy)) {
    respondWithError(request, 'Signature is invalid');
    return;
  }
  logger.log('Valid');
}

async function validateSignature(signatureParam, decodedPolicy) {
  const replacedSignatureParam = signatureParam.replace(/-/g, '+').replace(/_/g, '=').replace(/~/g, '/');

  if (!isBase64Encoded(replacedSignatureParam)) {
    return false;
  }

  const signatureBuffer = base64.decode(replacedSignatureParam);
  const dataBuffer = new TextEncoder().encode(decodedPolicy);

  try {
    const cryptoKey = await crypto.subtle.importKey('spki', pem2ab(publicKey), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-1' }, false, ['verify']);
    return await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, cryptoKey, signatureBuffer, dataBuffer);
  } catch (error) {
    logger.log(error);
    return false;
  }
}

function isBase64Encoded(base64String) {
  const validBase64Regex = /^[A-Za-z0-9+/=]+$/;
  return validBase64Regex.test(base64String) && base64String.length % 4 === 0;
}

function respondWithError(request, message) {
  request.respondWith(403, { 'Content-Type': ['text/html'] }, message);
}