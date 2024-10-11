import { logger } from 'log';
import { JWTValidator} from './jwt.js';
import { crypto, pem2ab } from 'crypto';

//advanced options for jwt validator
const jwtOption = {
  //check token expiry
  ignoreExpiration: false,
  //check token nbf
  ignoreNotBefore: false
};

const jwtValidator = new JWTValidator(jwtOption);

export async function onClientRequest (request) {
  try {
    // Fetch RSA public key from Propery Manager used for verification of JWT token
    const secretKey = request.getVariable('PMUSER_JWT_ES_PUBKEY');
    const iKey = await crypto.subtle.importKey(
      'spki',
      pem2ab(secretKey),
      {
        name: "ECDSA",
        namedCurve: "P-256"
      },
      false,
      ['verify']
    );
    //Fetch the Authorization header from request
    let jwt = request.getHeader('Authorization');
    if (jwt){
      jwt = jwt[0];
      //replace auth scheme before validating
      jwt = jwt.replace('Bearer ',''); 
      const jwtJSON = await jwtValidator.validate(jwt,[iKey]);
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
  } catch (error) {
    logger.log(error);
    request.respondWith(400, {}, error);
  }
}