import { logger } from 'log';
import { JWTValidator} from './jwt.js';

//advanced options for jwt validator
const jwtOption = {
  //check token expiry
  ignoreExpiration: false,
  //check token nbf
  ignoreNotBefore: false
}

const jwtValidator = new JWTValidator(jwtOption);

export async function onClientRequest (request) {
  try {
    // Fetch RSA public key from Propery Manager used for verification of JWT token
    const secretKey = request.getVariable('PMUSER_JWT_RSA_PUBKEY');
    let jwt = request.getHeader('Authorization');
    if (jwt){
      jwt = jwt[0];
      const jwtJSON = jwtValidator.decode(jwt);
      logger.log('jwtJSON %s: ',JSON.stringify(jwtJSON));
      const verifed = await jwtValidator.validate(jwt,jwtJSON.header.alg,secretKey);
      logger.log('verifed %s: ',verifed);
      const result = {
        jwt: jwtJSON,
        verifed: verifed
      };
      request.respondWith(200, {}, JSON.stringify(result));
    }
  } catch (error) {
    logger.log(error);
    request.respondWith(400, {}, error);
  }
}