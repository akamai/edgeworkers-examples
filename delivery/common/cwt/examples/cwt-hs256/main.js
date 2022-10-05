import { logger } from 'log';
import { CWTUtil, CWTValidator} from './cwt.js';
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
    let cwt = request.getHeader('Authorization');
    if (cwt){
      cwt = cwt[0];
      const tokenBuf = base16.decode(cwt,'Uint8Array');
      const keys = [base16.decode(secretKey,'Uint8Array')];
      const cwtJSON = await cwtValidator.validate(tokenBuf,keys);
      const claims = CWTUtil.claimsTranslate(Object.fromEntries(new Map(cwtJSON.payload)),claimsLabelMap);
      request.respondWith(200, {}, JSON.stringify(claims));
    }
  } catch (error) {
    logger.log(error);
    request.respondWith(400, {}, error.message);
  }
}
