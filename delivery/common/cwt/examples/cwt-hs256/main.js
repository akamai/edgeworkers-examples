import { logger } from 'log';
import { CWTUtil, CWTValidator, CWTGenerator, AlgorithmLabels, ClaimLabels, HeaderLabels} from './cwt.js';
import { crypto } from 'crypto';
import { base16 } from 'encoding';

//Integer keys mapping for CWT payload. This mapping is application specific, However keys from 1-7 are reserved
const claimsLabelMap = {
  1: 'iss',
  2: 'sub',
  3: 'aud',
  4: 'exp',
  5: 'nbf',
  6: 'iat'
};

//advanced options for cwt validator
const cwtOptions =  {
  //perform header validation
  headerValidation: false,
  //check token expiry
  ignoreExpiration: true,
  //check token nbf
  ignoreNotBefore: true
};

const cwtValidator = new CWTValidator(cwtOptions);

export async function onClientRequest (request) {

  try {
    const secretKey = '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388';
    const sKey = await crypto.subtle.importKey(
      'raw',
      base16.decode(secretKey, 'Uint8Array').buffer,
      {
        name: 'HMAC',
        hash: 'SHA-256'
      },
      false,
      ['sign','verify']
    );

    if (request.path == '/token' && request.method == 'POST') {
      const claims = { iss: 'mde_dev@akamai.com', iat: Date.now(), sub: "subject@akamai.com", aud: ["cdn@akamai.com"], exp: Date.now() + 86400, nbf: Date.now() - 86400};
      const claimsSet = CWTUtil.claimsTranslate(claims, ClaimLabels);
      const signer = {
        key: sKey
      };
      const cwtToken = await CWTGenerator.mac(claimsSet, signer, { p: CWTUtil.claimsTranslate({ alg: AlgorithmLabels.HS256 }, HeaderLabels)});
      const cwtTokenHex = base16.encode(new Uint8Array(cwtToken));
      request.respondWith(200, {}, cwtTokenHex);
    } else {
      //Fetch the Authorization header from request
      let cwtToken = request.getHeader('Authorization');
      if (cwtToken) {
        cwtToken = cwtToken[0];
        //replace auth scheme before validating
        cwtToken = cwtToken.replace('Bearer ','');
        //Assumption: CWT token as passed as hex encoded in authorization header. We decode the hex to get the binary
        const tokenBuf = base16.decode(cwtToken,'Uint8Array');
        const cwtJSON = await cwtValidator.validate(tokenBuf,[{ key: sKey }]);
        const claims = CWTUtil.claimsTranslate(cwtJSON.payload,claimsLabelMap);
        request.respondWith(200, {}, JSON.stringify(Object.fromEntries(claims)));
      } else {
        //Return bad request of authorization header is not found
        request.respondWith(400, {}, 'Authorization header is missing!');
      }
    }
  } catch (error) {
    logger.log(error);
    request.respondWith(400, {}, error.message);
  }
}
