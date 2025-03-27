import { logger } from 'log';
import { CWTGenerator, CWTUtil } from './cwt.js';
import { AlgoLabelMap, CatURILabelMap, ClaimsLabelMap, HeaderLabelMap, MatchTypeLabelMap, CAT, CatRLabelMap } from './cat.js';
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
        let body = '';
        const decoder = new TextDecoder();
        for await (let chunk of request.body) {
          body += decoder.decode(chunk, { stream: true });
        }
        logger.log('D: body: %s', body);
        body = JSON.parse(body);
        //decode catu
        let catu = body['catu']
        if (catu) {
          const catuMap = CWTUtil.claimsTranslate(catu, CatURILabelMap);
          for (const [key, value] of catuMap) {
            const uriComponentMatch = new Map();
    				for (const a in value) {
              if (a === MatchTypeLabelMap.sha256 || a === MatchTypeLabelMap.sha512) {
              	const decodedValue = base16.decode(value[a]);
                uriComponentMatch.set(a, decodedValue);
              } else {
                uriComponentMatch.set(a, value[a]);
              }
    				}
            catuMap.set(key, uriComponentMatch);
          }
          body['catu'] = catuMap
        }
        //decode catalpn
        let catalpn = body['catalpn']
        if (catalpn) {
         const catalpns = []
         if (Array.isArray(catalpn)) {
           for (const c of catalpn) {
             catalpns.push(new TextEncoder().encode(c))
           }
           body['catalpn'] = catalpns;
         } else {
           body['catalpn'] = new TextEncoder().encode(catalpn);
         }
        }
        let catr = body['catr']
        if (catr) {
          const catrenewal = new Map();
          catrenewal.set(CatRLabelMap.renewal_type, catr['renewabletype'])
          if (catr['expext']) {
            catrenewal.set(CatRLabelMap.exp_extension, catr['expext'])
          }
          if (catr['deadline']) {
            catrenewal.set(CatRLabelMap.renewal_deadline, catr['deadline'])
          }
          body['catr'] = catrenewal
        }
        const now = Math.floor(Date.now()/1000)
        const payload = CWTUtil.claimsTranslate(body, ClaimsLabelMap);  
        payload.set(ClaimsLabelMap.iat, now);
        payload.set(ClaimsLabelMap.nbf, now);
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