import { logger } from 'log';
import { TokenType, Watermarking} from './media-delivery-watermarking.js';
//Obtained the required vendor specific code to generate TMID from the vendor
//Contact our representative to get more infomation on supported vendors.
import { vendorAlgoritm } from './vendor-algorithm.js';

//Map each vendor specific code with the vendor identifier. This identifier should be same as wmvnd field from the token.
//In Direct case i.e wmtype=0, this is not required and is handled internally by watermarking module.
const vendorAlgoritms = new Map();
//vendorIdentifier should be same as wmvnd claim from watermarking token
vendorAlgoritms.set('<vendorIdentifier>',vendorAlgorithm);

//CWT Token will be used. Watermarking module also support JWT based token, set TokenType.JWT to enable JWT based tokens.
//register vendor specic algorithms in watermarking module
const watermarking = new Watermarking( { tokenType: TokenType.CWT, validateWMClaims: true }, vendorAlgoritms);

const variantSubPath= [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];


export async function onClientRequest (request) {

  try {
    let wmJSON = {}, reqPath;
    //hmac verification key used to sign CWT token
    const cwtAuthTokenHmacKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    const secretKey = request.getVariable('PMUSER_VENDOR_SECRET_KEY');
    const rangeHeaders = request.getHeader('Range');
    const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
    //Fetch token from request Auth header.
    //We are considering CWT based token in this example
    const token = request.getHeader('Authorization')
    if (token === null) {
      request.respondWith(400, {}, "Failed to obtain token from request URL");
    }
    //validate the token
    wmJSON = await watermarking.validateToken(token.token,[cwtAuthTokenHmacKey], 'HS256');
    logger.log('D:wmJSON= %o', wmJSON);
    //if request is for media playback
    if (request.path.includes('.mp4') || request.path.includes('.m4a') || request.path.includes('.m3u8') || request.path.includes('.mpd') ){
      //Generate watermarking variant path only for video/audio segment request
      if (request.path.includes('.mp4') || request.path.includes('.m4a')) {
        if (rangeHeader) {
          const path = await watermarking.getWMPathWithVariant(reqPath, wmJSON.payload, secretKey, variantSubPath,rangeHeader);
          logger.log('D:forwardedPath= %s', path);
          request.route({ path: path, query: request.query});
        } else {
          request.respondWith(400, {}, "Failed to obtain range header for segment request");
        }
      } else {
        request.route({ path: request.path, query: request.query});
      }
    } else {
      request.route({ path: request.path, query: request.query});
    }
  } catch(error) {
    logger.log('D:error=%s', error.message);
    request.respondWith(400, {}, JSON.stringify({ error: error.message}));
  }
}
