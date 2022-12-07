import { logger } from 'log';
import { base16 } from 'encoding';

import { TokenType, VariantSubPath, Watermarking, WMPayload} from './watermarking/media-delivery-watermarking';
import { vendorAlgorithm } from './vendor-algorithm/';

const vendorAlgoritms = new Map();
//vendorIdentifier should be same as wmvnd claim from watermarking token
vendorAlgoritms.set('<vendorIdentifier>',vendorAlgorithm);

//Map each vendor specific code with the vendor identifier. This identifier should be same as wmvnd field from the token.
//In Direct case i.e wmtype=0, this is not required and is handled internally by watermarking module.
const watermarking = new Watermarking( { tokenType: TokenType.CWT, validateWMClaims: true }, vendorAlgoritms);

const variantSubPath: Array<VariantSubPath> = [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];

export async function onClientRequest (request: EW.IngressClientRequest) {

  try {
    const cwtAuthTokenHmacKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    const secretKey = request.getVariable('PMUSER_VENDOR_SECRET_KEY');
    const authTokens = request.getHeader('Authorization');
    const rangeHeaders = request.getHeader('Range');
    if (authTokens) {
      const authToken = authTokens[0];
      if (request.path.includes('.mp4') || request.path.includes('.m4a') ){
        const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
        if (cwtAuthTokenHmacKey && secretKey && authToken && rangeHeader) {
          //This is example of CWT token that can be passed as Uint8Array (binary) or Hex encoded string.
          //Incase of JWT the token passed must be of type string seperated by .
          const authTokenBuf = base16.decode(authToken, 'Uint8Array');
          const wmJSON = await watermarking.validateToken(authTokenBuf,[cwtAuthTokenHmacKey],'HS256');
          logger.log('D:wmJSON= %s', JSON.stringify(wmJSON.payload));
          const path = await watermarking.getWMPathWithVariant(request.path, wmJSON.payload as WMPayload, secretKey, variantSubPath,rangeHeader);
          logger.log('D:forwardedPath= %s', path);
          request.route({path: path});
        } else {
          request.respondWith(400, {}, "Failed to obtain authToken | secreyKey | token hmac key");
        }
      }
    } else {
      request.respondWith(400, {}, "Unable to find auth token from request header");
    }
  } catch(error: unknown) {
    logger.log('D:error=%s', (error as Error).message);
    request.respondWith(400, {}, JSON.stringify({ error: (error as Error).message}));
  }
}
