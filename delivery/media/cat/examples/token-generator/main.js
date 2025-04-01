import { logger } from 'log';
import { CWTGenerator, CWTUtil } from './cwt.js';
import { AlgoLabelMap, CatURILabelMap, ClaimsLabelMap, HeaderLabelMap, MatchTypeLabelMap, CAT } from './cat.js';
import { TextDecoder, TextEncoder, base16, base64url } from 'encoding';
import { crypto } from 'crypto';
import { createResponse } from 'create-response';

const hs256KeyHex = '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388';

const cat = new CAT({
  isCoseCborTagAdded: true,
  isCWTTagAdded: true
});

export async function responseProvider (request) {
    // request to generate CAT token
    if (request.path === '/token' && request.method === 'POST') {

      try {
        
        let body = await request.json()
        /*
        Accepted Request Body
        { 
          "iss": "backoffice.synamedia.com",
          "aud": "synamedia_cdn",
          "catu": {
            "scheme": {
              "exact": "http"
            },    
            "host": {
              "exact": "localhost:3070/synamedia"
            }
          },  
          "cath": {
            "userid": {
              "exact": "38vh7mmers45zq1csjplkd"
            }
          },
          "catm": [ "GET", "POST" ],
          "catgeoiso3166": [ "FR", "US" ],
          "catv": 1,
          "nbf": 1742567042,
          "exp": 1742567072,
          "iat": 1742567042 
        }
        */
        
        //decode catu
        let catu = body['catu']
        if (catu) {
          const catuMap = translateJsonToMap(catu, [CatURILabelMap, MatchTypeLabelMap], 0);
          body['catu'] = catuMap
        }
        let cath = body['cath']
        if (cath) {
          const cathMap = translateJsonToMap(cath, [{}, MatchTypeLabelMap], 0);
          body['cath'] = cathMap
        }
        const payload = CWTUtil.claimsTranslate(body, ClaimsLabelMap);    
        const isWellFormedPayload = cat.isCATWellFormed(payload);

        if (isWellFormedPayload.status) {
          const protectedHeader = new Map();
          protectedHeader.set(HeaderLabelMap.alg, AlgoLabelMap.HS256)
          const unprotectedHeaders = new Map();
          unprotectedHeaders.set(HeaderLabelMap.kid, new TextEncoder().encode("akamai_key_hs256"))
          const header = {
             p: protectedHeader,
             u: unprotectedHeaders
          }
          const sKey = await crypto.subtle.importKey(
            'raw',
            base16.decode(hs256KeyHex, 'Uint8Array').buffer,
           {
             name: 'HMAC',
             hash: 'SHA-256'
           },
           false,
           ['sign','verify']
         );
  
          const signer = {
           key: sKey
          }
          const cwtTokenBuf = await CWTGenerator.mac(payload, signer, header, {}, {isCoseCborTagAdded: true, isCWTTagAdded: true });
          const cwtTokenBase64 = base64url.encode(new Uint8Array(cwtTokenBuf));
          return Promise.resolve(createResponse(200, {'content-type': 'text/plain'}, cwtTokenBase64));
        } else {
          return Promise.resolve(createResponse(400, {}, isWellFormedPayload.errMsg));
        }
      } catch(err) {
        return Promise.resolve(createResponse(400, {}, err.message));
      }
    } 
}

// helper function to handle nested JSON object as payload and returns map with converted keys
function translateJsonToMap(payload, labelMaps, i) {
  const result = new Map()
  if (payload instanceof Map) {
      payload = Object.fromEntries(payload);
  } 
  for (const param in payload) {
      let value = payload[param]
      if (isJSONObject(value)) {
        value = translateJsonToMap(value, labelMaps, i+1)
      }
      const key = labelMaps[i][param] != undefined ? labelMaps[i][param] : param
      result.set(key, value);
  }
  return result;
}

function isJSONObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}