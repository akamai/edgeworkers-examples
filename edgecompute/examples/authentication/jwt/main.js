import { crypto,pem2ab } from 'crypto';
import { TextEncoder, base64url } from 'encoding';

async function verify_es256(jwt, key) {
    // Split the signature from the header/claims
    const lastDot = jwt.lastIndexOf('.');
    if (lastDot < 0) {
        throw new Error("Missing dot");
    }
    const headerAndClaims = jwt.substring(0, lastDot);
    const signature = jwt.substring(lastDot + 1);
 
    return crypto.subtle.verify({
            name: "ECDSA",
            hash: "SHA-256"
        },
        key,
        base64url.decode(signature),
        new TextEncoder().encode(headerAndClaims)
    ).then(verified => {
        if (verified) {
            // Success! Extract the header and claims.
            const [header, claims] = headerAndClaims.split('.');
            return [
                JSON.parse(base64url.decode(header, "String")),
                JSON.parse(base64url.decode(claims, "String"))
            ];
        } else {
            throw new Error("signature did not match")
        }
    });
}
 
export async function onClientRequest(request) {
    let authorizationHeader = request.getHeader('Authorization');
    let jwt = ''

    if (authorizationHeader) {
        let authorization = authorizationHeader[0];
        jwt = authorization.split(' ')[1];

        const publicKey = `-----BEGIN PUBLIC KEY-----
        <YOUR PUBLIC KEY>
        -----END PUBLIC KEY-----`;
 
        let key = await crypto.subtle.importKey(
            "spki", pem2ab(publicKey),{
                name: "ECDSA",
                namedCurve: "P-256",
            },
            false,
            ["verify"]
        );
        
        await verify_es256(jwt, key)
            .then(verified => request.respondWith(202, {}, "verified: " + JSON.stringify(verified)))
            .catch(e => request.respondWith(500, {}, "err: " + e.message));
        }    
    else{
        request.respondWith(401, {}, "Unauthorized");
    }
}