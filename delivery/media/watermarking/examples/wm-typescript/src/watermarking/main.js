import { logger } from 'log';
import { TokenType, Watermarking} from './media-delivery-watermarking.js';
//Required only for customer that needs to validate short token as per the spec.
import { ShortTokenValidator } from './short-token-validator.js';

//CWT Token will be used. Watermarking module also support JWT based token, set TokenType.JWT to enable JWT based tokens.
//register vendor specic algorithms in watermarking module
const watermarking = new Watermarking( { tokenType: TokenType.CWT, validateWMClaims: true });

const variantSubPath= [{ variant: 0, subPath: 'A' }, { variant: 1, subPath: 'B'}];

//extract token type from URL
function getTokenType(path) {
  const paths = path.split('/');
  for (const p of paths) {
    if (p.includes('$1$')){
      return { tokenType: 1, token: p.substring(p.indexOf('$1$')+ 3), filename: paths[paths.length-1]};
    } else if (p.includes('$2$')){
      return { tokenType: 2, token: p.substring(p.indexOf('$2$') + 3), filename: paths[paths.length-1]};
    }
  }
  return null;
}

function getURLByParts(url) {
  const slashPos = url.lastIndexOf('/');
  const basedir = url.substring(0, slashPos);
  const filename = url.substring(slashPos + 1);
  return { basedir, filename };
}

export async function onClientRequest (request) {
  
  try {
    let wmJSON = {}, reqPath;
    //hmac verification key used to sign CWT token
    const cwtAuthTokenHmacKey = request.getVariable('PMUSER_CWT_HMAC_KEY');
    //hmac key used to sign short token
    //const shortTokenHmacKey = request.getVariable('PMUSER_SHORTTOKEN_HMAC_KEY');
    //irdeto key
    const secretKey = request.getVariable('PMUSER_IRDETO_KEY');
    const rangeHeaders = request.getHeader('Range');
    const rangeHeader = rangeHeaders? rangeHeaders[0]: undefined;
    //Fetch token type details from URL.
    //Example of short token format: /some/path/$1$<shorttoken>/to/filename.mp4
    //Example of short token format: /some/path/$2$<longtoken>/to/filename.mp4
    const token = getTokenType(request.path);
    if (token === null) {
      request.respondWith(400, {}, "Failed to obtain token from request URL");
    }
    var outcome_url = (String(request.getVariable('PMUSER_AKA_PM_OUTCOME_URL')).split('?'))[0];

    //short token validation
    if (token.tokenType == 1) {
      //reqPath = request.path.replace('$1$' + token.token + '/','');
      reqPath = outcome_url.replace('$1$' + token.token + '/','');

      const shorttoken = await ShortTokenValidator.validateToken(token.token,[cwtAuthTokenHmacKey]);
      //set required constants
      shorttoken['wmvnd'] = 40;
      shorttoken['wmopid'] = 40;
      shorttoken['wmpatlen'] = 2048;
      wmJSON.payload = shorttoken;
    
    //Long token validation
    } else {
      //reqPath = request.path.replace('$2$' + token.token + '/','');
      reqPath = outcome_url.replace('$2$' + token.token + '/','');

      //CWT token is assumed to be passed as hex encoded. if not, pass it as binary (i.e Uint8Array) after decoding it appropriating.
      //'HS256' is the alogrithm used to genearte keys. 
      wmJSON = await watermarking.validateToken(token.token,[cwtAuthTokenHmacKey], 'HS256');
    }
    logger.log('D:reqPath= %s', reqPath);
    logger.log('D:wmJSON= %o', wmJSON);

    //if request is for media playback
    if (request.path.includes('.mp4') || request.path.includes('.m4a') || request.path.includes('.m3u8') || request.path.includes('.mpd') ){
      //title check
      if (token.filename !== wmJSON.payload.title) {
        request.respondWith(400, {}, 'Filename doesnt match title');
      }
      //Request is segment request
      if (request.path.includes('.mp4') || request.path.includes('.m4a')) {
        if (rangeHeader) {
          const variant = await watermarking.getWMPathWithVariant(reqPath, wmJSON.payload, secretKey,rangeHeader);
          logger.log('D:variant= %s', variant);
          const subPath = variantSubPath[variant].subPath;
          logger.log('D:subPath= %s', subPath);
          const {basedir, filename} = getURLByParts(reqPath);
          const path =  `${basedir}/${subPath}/${filename}`;
          logger.log('D:path= %s', path);

          // (2) Set PMUSER_WM_FWD_PATH with the new path
          request.setVariable('PMUSER_WM_FWD_PATH', path);

          request.route({ path: path, query: request.query});
        } else {
          request.respondWith(400, {}, "Failed to obtain range header for segment request");
        }
      } else {
        request.route({ path: reqPath, query: request.query});
      }
    } else {
      request.route({ path: reqPath, query: request.query});
    }
  } catch(error) {
    logger.log('D:error=%s', error.message);
    request.respondWith(400, {}, JSON.stringify({ error: error.message}));
  }
}