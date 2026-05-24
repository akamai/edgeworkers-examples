import { logger } from 'log';
import { CWTUtil, CWTValidator, CWTGenerator, AlgorithmLabels, ClaimLabels, HeaderLabels, Signer, Verifier} from './cwt/cwt';
import { crypto, pem2ab } from 'crypto';
import { base16 } from 'encoding';

//Integer keys mapping for CWT payload. This mapping is application specific, However keys from 1-7 are reserved
const claimsLabelMap = {
  1: 'iss',
  2: 'sub',
  3: 'aud',
  4: 'exp',
  5: 'nbf',
  6: 'iat'
};
  
//advanced options for cwt validator
const cwtOptions =  {
  //perform header validation
  headerValidation: false,
  //check token expiry
  ignoreExpiration: true,
  //check token nbf
  ignoreNotBefore: true
};

export const es256PrivKey1 = {
  key_ops: ['sign'],
  ext: false,
  kty: 'EC',
  x: 'D5fNFnQYFBOjWa1ndpQK3ZrzXuHD77oGDgPaMNbtZ7s',
  y: 'Y4iS6G8atqp3x85xJOfCY997AVWHPy-dEgLk6CaNZ7w',
  crv: 'P-256',
  d: 'CyJoz5l2IG9cPEXvPATnU3BHrNS1Qx5-dZ4e_Z0H_3M'
};

const es256PubKey1 = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAED5fNFnQYFBOjWa1ndpQK3ZrzXuHD
77oGDgPaMNbtZ7tjiJLobxq2qnfHznEk58Jj33sBVYc/L50SAuToJo1nvA==
-----END PUBLIC KEY-----`;

const cwtValidator = new CWTValidator(cwtOptions);

export async function onClientRequest (request: EW.IngressClientRequest) {

  try {
    const signingKey = await crypto.subtle.importKey(
      'jwk',
      es256PrivKey1,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      !1,
      ['sign']
    );
    if (request.path == '/token' && request.method == 'POST') {
      const claims = { iss: 'mde_dev@akamai.com', iat: Date.now(), sub: "subject@akamai.com", aud: ["cdn@akamai.com"], exp: Date.now() + 86400, nbf: Date.now() - 86400};
      const claimsSet = CWTUtil.claimsTranslate(claims, ClaimLabels);
      const signer: Signer = {
        key: signingKey as CryptoKey
      };
      const cwtToken = await CWTGenerator.sign(claimsSet, signer, { p: CWTUtil.claimsTranslate({ alg: AlgorithmLabels.ES256 }, HeaderLabels)});
      const cwtTokenHex = base16.encode(new Uint8Array(cwtToken));
      request.respondWith(200, {}, cwtTokenHex);
    } else {
      const verifyKey = await crypto.subtle.importKey(
        'spki',
        pem2ab(es256PubKey1),
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ['verify']
      );
      //Fetch the Authorization header from request
      let cwtToken = request.getHeader('Authorization');
      if (cwtToken){
        let cwtT = cwtToken[0];
        //replace auth scheme before validating
        cwtT = cwtT.replace('Bearer ','');
        //Assumption: CWT token as passed as hex encoded in authorization header. We decode the hex to get the binary
        const tokenBuf = base16.decode(cwtT,'Uint8Array') as Uint8Array;
        const cwtJSON = await cwtValidator.validate(tokenBuf,[{ key: verifyKey} as Verifier]);
        const claims = CWTUtil.claimsTranslate(cwtJSON.payload,claimsLabelMap);
        request.respondWith(200, {}, JSON.stringify(Object.fromEntries(claims)));
      } else {
        //Return bad request of authorization header is not found
        request.respondWith(400, {}, 'Authorization header is missing!');
      }
    }
  } catch (error) {
    logger.log(error as any);
    request.respondWith(400, {}, (error as any).message);
  }
}