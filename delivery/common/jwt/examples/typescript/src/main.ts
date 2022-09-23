import { logger } from 'log';
import { JWTOptions, JWTValidator } from './jwt/jwt';

const jwtOptions: JWTOptions = {
  clockTolerance: 70
};

const jwtValidator = new JWTValidator(jwtOptions);

export async function onClientRequest (request: EW.ImmutableRequest & EW.HasRespondWith) {
  try {
    const secretKey = request.getVariable('PMUSER_JWT_RSA_PUBKEY');
    const jwts = request.getHeader('Authorization');
    if (jwts){
      const jwt = jwts[0];
      const jwtJSON = jwtValidator.decode(jwt);
      logger.log('jwtJSON %s: ',JSON.stringify(jwtJSON));
      const verifed = await jwtValidator.validate(jwt,jwtJSON.header.alg,secretKey as string);
      logger.log('verifed %s: ',verifed);
      const result = {
        jwt: jwtJSON,
        verifed: verifed
      };
      request.respondWith(200, {}, JSON.stringify(result));
    }
  } catch (error: unknown) {
    logger.log('Error: %s', (error as Error).message);
    request.respondWith(400, {}, JSON.stringify({error: (error as Error).message}));
  }
}

