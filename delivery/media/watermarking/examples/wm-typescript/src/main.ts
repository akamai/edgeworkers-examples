import { logger } from 'log';
import { base16 } from 'encoding';

import { TokenType, VariantSubPath, Watermarking, WMPayload} from './watermarking/media-delivery-watermarking';
import { vendorAlgorithm } from './vendor-algorithm/vendor-algorithm';

const vendorAlgoritms = new Map();
vendorAlgoritms.set(40, vendorAlgorithm);

const watermarking = new Watermarking( { tokenType: TokenType.CWT, validateWMClaims: true }, vendorAlgoritms);

const variantSubPath: Array<VariantSubPath> = [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];

function getURLByParts(url: string): { basedir: string; filename: string;} {
  const slashPos = url.lastIndexOf('/');
  const basedir = url.substring(0, slashPos);
  const filename = url.substring(slashPos + 1);
  return { basedir, filename };
}

export async function onClientRequest (request: EW.IngressClientRequest) {

  try {
    //Hmac verification key used to sign CWT token.
    const cwtAuthTokenHmacKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    //Vendor specific key to used to generate wmid
    const secretKey = request.getVariable('PMUSER_VENDOR_KEY');
    const rangeHeaders = request.getHeader('Range');
    const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
    //Fetch CWT token from request.
    //Assumption: CWT token is passed as Authorization header in hex format.
    const token = request.getHeader('Authorization')[0];
    if (token === null) {
      request.respondWith(400, {}, "Failed to obtain token from the request");
    }
    const wmJSON = await watermarking.validateToken(token,[cwtAuthTokenHmacKey], 'HS256');
    logger.log('D:wmJSON= %o', wmJSON);
    //If request is for media playback.
    //Other way to configure this is to add this rule in PM config rule to enable EW. This would save cost for requests for which watermarking is not required
    if (request.path.includes('.mp4') || request.path.includes('.m4a') || request.path.includes('.m3u8') || request.path.includes('.mpd') ){
      //Request is segment request
      if (request.path.includes('.mp4') || request.path.includes('.m4a')) {
        if (rangeHeader) {
          const variant = await watermarking.getWMPathWithVariant(reqPath, wmJSON.payload, secretKey, rangeHeader);
          logger.log('D:variant= %s', variant);
          const subPath = variantSubPath[variant].subPath;
          logger.log('D:subPath= %s', subPath);
          const { basedir, filename } = getURLByParts(request.path);
          const path =  `${basedir}/${subPath}/${filename}`;
          logger.log('D:path= %s', path);
          request.route({ path: path, query: request.query});
        } else {
          request.respondWith(400, {}, "Failed to obtain range header for segment request");
        }
      } else {
        //This would simply incur cost for customer as EW gets executed but does not need watermarking logic.
        request.route({ path: request.path, query: request.query});
      }
    } else {
      //This would simply incur cost for customer as EW gets executed but does not need watermarking logic.
      request.route({ path: request.path, query: request.query});
    }
  } catch(error) {
    logger.log('D:error=%s', (error as Error).message));
    request.respondWith(400, {}, JSON.stringify({ error: (error as Error).message}));
  }
}
