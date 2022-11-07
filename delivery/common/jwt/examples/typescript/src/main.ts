import { crypto, pem2ab } from 'crypto';
import { logger } from 'log';
import { JWTOptions, JWTValidator } from './jwt/jwt';

const jwtOptions: JWTOptions = {
  clockTolerance: 70
};

const jwtValidator = new JWTValidator(jwtOptions);

export async function onClientRequest (request: EW.ImmutableRequest & EW.HasRespondWith) {
  try {
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
    const jwts = request.getHeader('Authorization');
    if (jwts){
      const jwt = jwts[0];
      const jwtJSON = await jwtValidator.validate(jwt,[sKey as CryptoKey]);
      logger.log('jwtJSON %s: ',JSON.stringify(jwtJSON));
      const result = {
        jwt: jwtJSON,
        verifed: true
      };
      request.respondWith(200, {}, JSON.stringify(result));
    }
  } catch (error: unknown) {
    logger.log('Error: %s', (error as Error).message);
    request.respondWith(400, {}, JSON.stringify({error: (error as Error).message}));
  }
}

