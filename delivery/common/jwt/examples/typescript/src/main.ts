import { crypto, pem2ab } from 'crypto';
import { logger } from 'log';
import { JWTOptions, JWTValidator } from './jwt/jwt';

const jwtOptions: JWTOptions = {
  //check token expiry
  ignoreExpiration: false,
  //check token nbf
  ignoreNotBefore: false
};

const jwtValidator = new JWTValidator(jwtOptions);

export async function onClientRequest (request: EW.IngressClientRequest) {
  try {
    // Fetch RSA public key from Propery Manager used for verification of JWT token
    const secretKey = request.getVariable('PMUSER_JWT_RSA_PUBKEY');
    const sKey = await crypto.subtle.importKey(
      'spki',
      pem2ab(secretKey as string),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    );
    //Fetch the Authorization header from request
    const jwts = request.getHeader('Authorization');
    if (jwts){
      let jwt = jwts[0];
      //replace auth scheme before validating
      jwt = jwt.replace('Bearer ',''); 
      const jwtJSON = await jwtValidator.validate(jwt,[sKey as CryptoKey]);
      logger.log('jwtJSON %s: ',JSON.stringify(jwtJSON));
      const result = {
        jwt: jwtJSON,
        verifed: true
      };
      request.respondWith(200, {}, JSON.stringify(result));
    } else {
      //Return bad request of authorization header is not found
      request.respondWith(400, {}, 'Authorization header is missing!');
    }
  } catch (error: unknown) {
    logger.log('Error: %s', (error as Error).message);
    request.respondWith(400, {}, JSON.stringify({error: (error as Error).message}));
  }
}

