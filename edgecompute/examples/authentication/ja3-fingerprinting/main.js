import * as util from './util.js';

export function onClientRequest(request) {
  const client_hello = request.getVariable('PMUSER_TLS_CLIENT_HELLO');
  const buffer = util.base64toUint8Array(client_hello);

  const JA3_fingerprint = util.getJA3Fingerprint(buffer);
  request.setVariable('PMUSER_JA3_FINGERPRINT', JA3_fingerprint);

  return JA3_fingerprint;
}
