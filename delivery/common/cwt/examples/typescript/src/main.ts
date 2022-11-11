import { logger } from 'log';
import { crypto } from "crypto";
import { CWTJSON, CWTUtil, CWTValidator} from './cwt/cwt';
import { base16 } from 'encoding';


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

const cwtOptions =  {
  headerValidation: true
};

const cwtValidator = new CWTValidator(cwtOptions);

export async function onClientRequest (request: EW.ImmutableRequest & EW.HasRespondWith) {
  try {
    const secretKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    const sKey = await crypto.subtle.importKey(
      'raw',
      (base16.decode(secretKey as  string, 'Uint8Array') as Uint8Array).buffer,
      {
        name: 'HMAC',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    );
    const cwts = request.getHeader('Authorization');
    if (cwts){
      const cwt = cwts[0];
      const tokenBuf = base16.decode(cwt,'Uint8Array') as Uint8Array;
      const cwtJSON = await cwtValidator.validate(tokenBuf,[sKey as CryptoKey]) as CWTJSON;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const claims = CWTUtil.claimsTranslate(Object.fromEntries(new Map(cwtJSON.payload as any)),claimsLabelMap);
      request.respondWith(200, {}, JSON.stringify(claims));
    }
  } catch (error: unknown) {
    logger.log('Error: %s',(error as Error).message);
    request.respondWith(400, {}, JSON.stringify({error: (error as Error).message}));
  }
}
