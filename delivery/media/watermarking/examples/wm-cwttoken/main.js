import { logger } from 'log';
import { TokenType, Watermarking} from './media-delivery-watermarking.js';
import { base16 } from 'encoding';
const watermarking = new Watermarking( { tokenType: TokenType.CWT});

const variantSubPath= [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];

export async function onClientRequest (request) {

  try {
    //Fetch the hmac verification key in hex encoded foramt
    const cwtAuthTokenHmacKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    //Fetch the irdeto specifc key. This is required to execute the irdeto algorithm for variant computation
    const secretKey = request.getVariable('PMUSER_IRDETO_KEY');
    //Fetch the cwt token in hex encoded from the request
    const authTokens = request.getHeader('Authorization');
    //Fetch byte range
    const rangeHeaders = request.getHeader('Range');
    if (authTokens) {
      const authToken = authTokens[0];
      if (request.path.includes('.mp4') || request.path.includes('.m4a') ){
        const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
        if (cwtAuthTokenHmacKey && secretKey && authToken && rangeHeader) {
          //This is example of CWT token that can be passed as Uint8Array (binary) or Hex encoded string.
          //Incase of JWT the token passed must be of type string seperated by .
          const authTokenBuf = base16.decode(authToken, 'Uint8Array');
          //Validate the token
          const wmJSON = await watermarking.validateToken(authTokenBuf,[cwtAuthTokenHmacKey]);
          logger.log('D:wmJSON= %s', JSON.stringify(wmJSON.payload));
          //Compute watermarking variant
          const path = await watermarking.getWMPathWithVariant(request.path, wmJSON.payload, secretKey, variantSubPath,rangeHeader);
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
