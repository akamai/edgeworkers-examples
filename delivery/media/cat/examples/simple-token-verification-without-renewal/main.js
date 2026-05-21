import { logger } from 'log';
import { CWTValidator } from './cwt.js';
import { HeaderLabelMap, CAT} from './cat.js';
import { TextDecoder, base16, base64url } from 'encoding';
import { crypto } from 'crypto';
import URLSearchParams from 'url-search-params';
import { Cookies } from 'cookies';

const hs256KeyHex = '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388';

const cat = new CAT({
  isCoseCborTagAdded: true,
  isCWTTagAdded: true,
  clockTolerance: 0
});

// token expiry and not before checks will be made as part of cat token validator.
const cwtValidator = new CWTValidator({ isCWTTagAdded: true, isCoseCborTagAdded: true, headerValidation: false, ignoreExpiration: true, ignoreNotBefore: true });

export async function onClientRequest (request) {
  
  let finalQs;
  // Media request 
  if ((request.path.includes('.mpd') || request.path.includes('.m3u8') || request.path.includes('.ts') || request.path.includes('.m4s') || 
  request.path.includes('.m4a') || request.path.includes('.m4v') || request.path.includes('.mp4')) && request.method === 'GET') {

    let catToken;
    // Find CAT token from cookie 
    const cookie = request.getHeader('cookie');
    if (cookie !== null && cookie !== undefined) {
      let cookies = new Cookies(cookie)
      catToken = cookies.get('Common-Access-Token')
      if (catToken !== undefined) {
        logger.log('CAT obtained from cookie')
      }
    }
    if ((catToken === null || catToken === undefined) && (request.getHeader('Common-Access-Token') !== null && request.getHeader('Common-Access-Token') !== undefined)) {
      catToken = request.getHeader('Common-Access-Token')[0];
      if (catToken !== undefined) {
        logger.log('CAT obtained from header')
      }
    } else {
      const querys_params = new URLSearchParams(request.query);
      catToken = querys_params.get('CAT')
    }
    if (catToken !== null && catToken !== undefined) {
      try {
        let verificationKey;
        catToken = catToken.trim();
        //decode cat token to load appropriate verification key based on kid
        const catTokenBuf = base64url.decode(catToken);
        const catJSON = cat.decode(catTokenBuf);

        // Get the kid from unprotected map, we could also determine the key based on iss_kid as two issuers might use same kid. As of now the kid is considered to be unique.
        const kid = new TextDecoder().decode(catJSON.header.u.get(HeaderLabelMap.kid));
        if (kid === 'akamai_key_hs256') {
          // Load hs256 key
          verificationKey = await crypto.subtle.importKey(
            'raw',
            base16.decode(hs256KeyHex, 'Uint8Array').buffer,
            {
              name: 'HMAC',
              hash: 'SHA-256'
            },
            false,
            ['verify']
          )
        } else {
          // kid not found in unprotected header
          request.respondWith(400, {}, `Unable to load verification key with kid=${kid}`)
        }
        // Check if CAT claim set is well formed. Not mandatory if token generator is considered to be valid authority and can be avoided to save time.  
        let result = cat.isCATWellFormed(catJSON.payload);
        logger.log("result: %o", result)
        if (result.status === true) {
          try {
            // Perform signature verification with expiry and nbf field check
            await cwtValidator.validate(catTokenBuf,[{ key: verificationKey }]);
            // Check is CAT claim set is acceptable. 
            result = await cat.isCATAcceptable(catJSON.payload, request);
            logger.log("result: %o", result)
            if (result.status === true) {
              request.respondWith(200, {}, "Token validation successfull, proceed futher!")
            } else {
              request.respondWith(401, {}, result.errMsg)
            }
          } catch(error) {
            logger.log("error: %s", error.message)
            request.respondWith(401, {}, 'Common access token signature verification failed')
          }
        } else {
          // Token is not well formed. (i.e syntax errors)
          request.respondWith(401, {}, result.errMsg)
        }
      } catch(error) {
        request.respondWith(401, {}, error.message)
      }
    } else {
      request.respondWith(403, {}, 'Common access token is not found in cookie {name=\'Common-Access-Token\'} or query string {cat=<token>}')
    }
  }
}