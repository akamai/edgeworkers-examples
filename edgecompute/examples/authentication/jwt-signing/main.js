import { logger } from 'log';
import { crypto } from 'crypto';
import { TextEncoder, base64url } from 'encoding';

async function signJWT(payload, secret) {
    logger.log('Start: Signing JWT');

    try {

        // Get current time for issued claim
        const currentTime = Math.floor(Date.now() / 1000);

        // Set payload 'issued at' (iat) and 'expiration' (exp) claims
        payload.iat = currentTime;
        payload.exp = currentTime + 300; // Expires in 5 minutes

        // JWT header
        const header = {
            alg: 'HS256'
            , typ: 'JWT'
        };

        // Encode header and payload in base64URL for JWT
        const encoder = new TextEncoder();
        const encodedHeader = base64url.encode(encoder.encode(JSON.stringify(header)));
        const encodedPayload = base64url.encode(encoder.encode(JSON.stringify(payload)));
        const message = `${encodedHeader}.${encodedPayload}`;

        // Import the secret key for HMAC signing
        const keyData = new Uint8Array(encoder.encode(secret));
        const cryptoKey = await crypto.subtle.importKey(
            'raw'
            , keyData.buffer
            , { name: 'HMAC', hash: 'SHA-256' }
            , false
            , ['sign']
        );

        // Sign the JWT
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
        const encodedSignature = base64url.encode(new Uint8Array(signature));

        // Return the complete JWT
        return `${message}.${encodedSignature}`;

    } catch (error) {
        logger.error('Error during JWT signing', error);

        return error.message;
    }
}

export async function onOriginRequest(request) {
    logger.log('Start: onOriginRequest');

    try {
        // Retrieve secrets from environment
        const secretKey = request.getVariable('PMUSER_JWT_HMAC_KEY');
        const apiKey = request.getVariable('PMUSER_CSS_API_KEY');

        // Prepare JWT payload
        const payload = {
            sub: apiKey
            , iss: 'issuer-string-here'
        };

        // Generate the JWT
        const jwt = await signJWT(payload, secretKey);

        // Modify outbound request headers
        request.removeHeader('Transfer-Encoding');
        request.addHeader('X-API-KEY', apiKey);
        request.addHeader('X-JWT', `Bearer ${jwt}`);

    } catch (error) {
        logger.error('Error in onOriginRequest', error);

        throw error;
    }
}
