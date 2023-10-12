import { logger } from 'log';
import { CWTUtil, CWTValidator} from './cwt.js';
import { crypto, pem2ab } from 'crypto';
import { base16 } from 'encoding';

//Integer keys mapping for CWT payload. This mapping is application specific, However keys from 1-7 are reserved
const claimsLabelMap = {

  1: 'iss',
  2: 'sub',
  3: 'aud',
  4: 'exp',
  5: 'nbf',
  6: 'iat',
  7: 'cti',
  300: 'wmver',
  301: 'wmvnd',
  302: 'wmpatlen',
  303: 'wmsegduration',
  304: 'wmpattern',
  305: 'wmid',
  306: 'wmopid',
  307: 'wmkeyver'
};

//advanced options for cwt validator
const cwtOptions =  {
  //perform header validation
  headerValidation: true,
  //check token expiry
  ignoreExpiration: false,
  //check token nbf
  ignoreNotBefore: false
};

const cwtValidator = new CWTValidator(cwtOptions);

export async function onClientRequest (request) {

  try {
    // Fetch hmac veification key from Propery Manager
    const pubKey = request.getVariable('PMUSER_CWT_ES256_KEY');
    const sKey = await crypto.subtle.importKey(
      'spki',
      pem2ab(pubKey),
      {
        name: 'HMAC',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    );
    //Fetch the Authorization header from request
    let cwt = request.getHeader('Authorization');
    if (cwt){
      cwt = cwt[0];
      //replace auth scheme before validating
      cwt = cwt.replace('Bearer ','');
      //Assumption: CWT token as passed as hex encoded in authorization header. We decode the hex to get the binary
      const tokenBuf = base16.decode(cwt,'Uint8Array');
      const cwtJSON = await cwtValidator.validate(tokenBuf,[sKey]);
      const claims = CWTUtil.claimsTranslate(Object.fromEntries(new Map(cwtJSON.payload)),claimsLabelMap);
      logger.log('cwtJSON %s: ',JSON.stringify(claims));
      request.respondWith(200, {}, JSON.stringify(claims));
    } else {
      //Return bad request of authorization header is not found
      request.respondWith(400, {}, 'Authorization header is missing!');
    }
  } catch (error) {
    logger.log(error);
    request.respondWith(400, {}, error.message);
  }
}
