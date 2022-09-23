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
    // Fetch hmac veification key from Propery Manager
    const secretKey = request.getVariable('PMUSER_JWT_HMAC_KEY');
    let jwt = request.getHeader('Authorization');
    if (jwt){
      jwt = jwt[0];
      const jwtJSON = jwtValidator.decode(jwt);
      const verifed = await jwtValidator.validate(jwt,jwtJSON.header.alg,secretKey);
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
