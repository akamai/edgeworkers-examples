import { logger } from 'log';
import { CWTGenerator, CWTValidator } from './cwt.js';
import { HeaderLabelMap, CAT, ClaimsLabelMap, CatRLabelMap, AlgoLabelMap } from './cat.js';
import { TextDecoder, TextEncoder, base16, base64url } from 'encoding';
import { crypto, pem2ab } from 'crypto';
import URLSearchParams from 'url-search-params';
import { Cookies } from 'cookies';

const hs256KeyHex = '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388';

const es256PrivJwk = {
  key_ops: ['sign'],
  ext: false,
  kty: 'EC',
  x: 'D5fNFnQYFBOjWa1ndpQK3ZrzXuHD77oGDgPaMNbtZ7s',
  y: 'Y4iS6G8atqp3x85xJOfCY997AVWHPy-dEgLk6CaNZ7w',
  crv: 'P-256',
  d: 'CyJoz5l2IG9cPEXvPATnU3BHrNS1Qx5-dZ4e_Z0H_3M'
};

const es256PubPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAED5fNFnQYFBOjWa1ndpQK3ZrzXuHD
77oGDgPaMNbtZ7tjiJLobxq2qnfHznEk58Jj33sBVYc/L50SAuToJo1nvA==
-----END PUBLIC KEY-----`

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
      // Remove cat token from query string before forwarding to origin
      querys_params.delete('CAT')
      finalQs = querys_params.toString();
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
        logger.log('kid: %s', kid)
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
        } else if (kid === 'akamai_key_es256') {
           // Load es256 key
          verificationKey = await crypto.subtle.importKey(
            'spki',
            pem2ab(es256PubPem),
            { name: "ECDSA", namedCurve: "P-256" },
            false,
            ['verify']
          );
        } else {
          // kid not found in unprotected header
          request.respondWith(400, {}, `Unable to load verification key with kid=${kid}`)
        }
        // Check if CAT claim set is well formed. Not mandatory if token generator is considered to be valid authority and can be avoided to save time. But  
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
              // check renewal
              const catr = catJSON.payload.get(ClaimsLabelMap.catr);
              const exp = catJSON.payload.get(ClaimsLabelMap.exp);
              const renewalType = catr.get(CatRLabelMap.renewal_type);
              const exp_extension = catr.get(CatRLabelMap.exp_extension);
              const exp_deadline = catr.get(CatRLabelMap.exp_deadline);
              logger.log("renewalType: %s", renewalType)
              logger.log("exp_extension: %s", exp_extension)
              logger.log("exp_deadline: %s", exp_deadline)
              logger.log("exp: %s", exp)
              // support for cookie and header renewable type
              if ((renewalType === 1 || renewalType === 2)  && exp_extension !== undefined && exp !== undefined) {
                let lowT;
                if (exp_deadline !== undefined) {
                  lowT = exp - exp_deadline * 60
                } else {
                  lowT = exp - 1 * 60 // 1 mins renewal window by default
                }
                const now = Math.floor(Date.now()/1000);
                logger.log("lowT: %s", lowT)
                logger.log("now: %s", now)
                // renew the token
                if (now >= lowT && now < exp) {
                  const new_exp = now + exp_extension
                  catJSON.payload.set(ClaimsLabelMap.exp, new_exp)
                  catJSON.payload.set(ClaimsLabelMap.iss, 'akamai.com')
                  catJSON.payload.set(ClaimsLabelMap.iat, now)
                  // renewal token is signed with different key
                  catJSON.header.u.set(HeaderLabelMap.kid, new TextEncoder().encode('akamai_key_es256'))
                  // change algo
                  catJSON.header.p.set(HeaderLabelMap.alg, AlgoLabelMap.ES256);
                  const esSignKey = await crypto.subtle.importKey(
                    'jwk',
                    es256PrivJwk,
                    {
                      name: 'ECDSA',
                      namedCurve: 'P-256'
                    },
                    false,
                    ['sign']
                  );
                  const cwtTokenBuf = await CWTGenerator.sign(catJSON.payload, { key: esSignKey }, catJSON.header, { isCoseCborTagAdded: true, isCWTTagAdded: true });
                  const cwtTokenBase64 = base64url.encode(new Uint8Array(cwtTokenBuf));
                  request.setVariable('PMUSER_RENEWED_CAT', cwtTokenBase64);
                  request.setVariable('PMUSER_RENEWAL_TYPE', renewalType);
                }
              }
              // Proceed and return the content
              request.route({ query: finalQs })
            } else {
              request.respondWith(401, {}, result.errMsg)
            }
          } catch(error) {
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

/** 
 The renewed token can be sent back to client in response using EW onClientResponse event handler. 
 However, same can also be achieved by applying necessary PM configuration rules without executing EW.
**/
// export function onClientResponse (request, response) {

//   const catRenewed = request.getVariable('PMUSER_RENEWED_CAT');
//   const renewalType = request.getVariable('PMUSER_RENEWAL_TYPE');
//   if (renewalType === 1) {
//     if (catRenewed !== undefined && catRenewed.length > 0) {
//       const cookie = new SetCookie({name: 'Common-Access-Token', value: catRenewed});
//       cookie.sameSite = 'None';
//       cookie.secure = true;
//       cookie.path = '/'
//       response.setHeader('Set-Cookie', cookie.toHeader());
//     }
//   } else if (renewalType === 2) {
//     if (catRenewed !== undefined && catRenewed.length > 0) {
//       response.setHeader('Common-Access-Token', catRenewed);
//     }
//   }
// }