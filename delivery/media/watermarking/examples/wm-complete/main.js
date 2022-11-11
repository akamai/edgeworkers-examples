import { logger } from 'log';
import { TokenType, Watermarking} from './media-delivery-watermarking.js';
const watermarking = new Watermarking( { tokenType: TokenType.CWT});

const variantSubPath= [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];

//extract token type from URL
function getTokenType(path) {
  const paths = path.split('/');
  for (const p of paths) {
    if (p.includes('$1$')){
      return { tokenType: 1, token: p.substring(p.indexOf('$1$')+3)};
    } else if (p.includes('$2$')){
      return { tokenType: 2, token: p.substring(p.indexOf('$2$'))+3};
    }
  }
  return null;
}

export async function onClientRequest (request) {
  
  try {
    let wmJSON;
    //hmac verification key used to sign CWT token
    const cwtAuthTokenHmacKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    //hmac key used to sign short token
    const shortTokenHmacKey = request.getVariable('PMUSER_SHORTTOKEN_HMAC_KEY');
    //irdeto key
    const secretKey = request.getVariable('PMUSER_IRDETO_KEY');
    const rangeHeaders = request.getHeader('Range');
    const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
    if (request.path.includes('.mp4') || request.path.includes('.m4a') ){
      //fetch token type details from URL.
      //Example of short token format: /some/path/$1$<shorttoken>/to/filename.mp4
      //Example of short token format: /some/path/$2$<longtoken>/to/filename.mp4
      const token = getTokenType(request.path);
      if (token === null) {
        request.respondWith(400, {}, "Failed to obtain token from request URL");
      }
      //short token
      if (token.tokenType == 1) {
        const shorttoken = await watermarking.validateShortToken(token.token,[shortTokenHmacKey]);
        //set required constants
        shorttoken['wmidtyp'] = 1;
        shorttoken['wmvnd'] = 'irdeto';
        shorttoken['wmopid'] = 40;
        shorttoken['wmidfmt'] = 'uint';
        shorttoken['wmpatlen'] = 2048;
        wmJSON.payload = shorttoken;

      } else {
        //CWT token is assumed to be passed as hex encoded. if not, pass it as binary (i.e Uint8Array) after decoding it appropriating.
        wmJSON = await watermarking.validateToken(token.token,[cwtAuthTokenHmacKey]);
      }
      if (!rangeHeader) {
        request.respondWith(400, {}, "Failed to obtain range header from request!");
      }
      const path = await watermarking.getWMPathWithVariant(request.path, wmJSON.payload, secretKey, variantSubPath,rangeHeader);
      logger.log('D:forwardedPath= %s', path);
      request.route({path: path});
    }
  } catch(error) {
    logger.log('D:error=%s', error.message);
    request.respondWith(400, {}, JSON.stringify({ error: error.message}));
  }
}
