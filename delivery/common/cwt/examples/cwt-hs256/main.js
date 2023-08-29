import { logger } from 'log';
import { CWTUtil, CWTValidator} from './cwt.js';
import { crypto } from 'crypto';
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
  200: 'wmver',
  201: 'wmvnd',
  202: 'wmidtyp',
  203: 'wmidfmt',
  204: 'wmpatlen',
  205: 'wmid',
  206: 'wmsegduration',
  207: 'wmidalg',
  208: 'wmidivlen',
  209: 'wmidivhex',
  210: 'wmidpid',
  211: 'wmidpalg',
  212: 'wmidkeyver',
  213: 'wmopid'
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
    const secretKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    const sKey = await crypto.subtle.importKey(
      'raw',
      base16.decode(secretKey, 'Uint8Array').buffer,
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
