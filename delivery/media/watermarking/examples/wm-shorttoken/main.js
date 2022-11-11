import { logger } from 'log';
import { TokenType, Watermarking} from './media-delivery-watermarking.js';

const watermarking = new Watermarking( { tokenType: TokenType.JWT});

const variantSubPath= [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];

export async function onClientRequest (request) {

  try {
    //Fetch the HMAC verification key in hex encoded foramt
    const jwtHmacKey = request.getVariable('PMUSER_JWT_HMAC_KEY');
    //Fetch the irdeto specifc key. This is required to execute the irdeto algorithm for variant computation
    const secretKey = request.getVariable('PMUSER_IRDETO_KEY');
    //Fetch the short token from the request
    const authTokens = request.getHeader('Authorization');
    //Fetch byte range
    const rangeHeaders = request.getHeader('Range');
    if (authTokens) {
      const authToken = authTokens[0];
      if (request.path.includes('.mp4') || request.path.includes('.m4a') ){
        const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
        if (jwtHmacKey && secretKey && authToken && rangeHeader) {
          //This is example of JWT token that can be passed as string seperated by .
          //Validate the short token
          const wmShortToken = await watermarking.validateShortToken(authToken,[jwtHmacKey]);
          //Set constants
          wmShortToken['wmidtyp'] = 1;
          wmShortToken['wmvnd'] = 'irdeto';
          wmShortToken['wmopid'] = 40;
          wmShortToken['wmidfmt'] = 'uint';
          wmShortToken['wmpatlen'] = 2048;
          logger.log('D:wmShortToken= %s', JSON.stringify(wmShortToken));
          //Compute watermarking variant
          const path = await watermarking.getWMPathWithVariant(request.path, wmShortToken, secretKey, variantSubPath,rangeHeader);
          logger.log('D:forwardedPath= %s', path);
          //Change the request route 
          request.route({path: path});
        } else {
          request.respondWith(400, {}, "Failed to obtain authToken | secreyKey | token hmac key");
        }
      }
    } else {
      request.respondWith(400, {}, "Unable to find auth token from request header");
    }
  } catch(error) {
    logger.log('D:error=%s', error.message);
    request.respondWith(400, {}, JSON.stringify({ error: error.message}));
  }
}
