## Example Description
This example demonstrates the usage of CAT module for CAT token verification. It accepts token in cookie(Common-Access-Token) or header(Common-Access-Token) or query string (CAT) in the descending priority. (i.e. CAT token from cookie hold more priority) for media object requests. It expects token to be signed using HS256 or ES256 algorithm. 
The example also showcase renewal of the token once its close to expiry window. The renewed token is signed using ES256 algorithm demonstrating different CDN using different algorithm and signging key. 

Below is the curl command. The token needs to be signed using HS256 or ESS256 algorithm and base64url encoded. Examples uses a hardcoded HS256, ES256 key for verification, however the same can be loaded using user-defined variable from Property Manager or via EdgeKV.

```bash
curl https://example.com/master.m3u8?CAT=<cat_token_base64url>
```
### High Level Workflow
1. `onClientRequest` event handlers tries to find the CAT token from the request for media object.
2. If the token is not present, it returns 403 status code.
3. Decodes the token from base64url.
4. Decodes the token's payload to read the unprotected header `kid` field.
5. Loads the associated verfication key based on `kid` value. In this example we only check for `akamai_key_hs256` to load HS256 key and `akamai_key_es256` to load ES256 key.
6. If the token is signed using unknown `kid`, it returns 400 status code.
7. Check if the token is well formed before verification. Note: If the token generator is trusted, then one can skip this step. 
8. Perform signature validation on the token.
9. Check if CAT token claims are satisfied by the request. `(cat.isCATAcceptable)` throws error with appropriate message if claims are not satisfied by the request.
10. If the claims are not satisfied by the request, then return 401 status code with error message thrown by `(cat.isCATAcceptable)`.
11. If the claims are satisfied, check if the token is close to expiry, if so, renew the token by only changing issuer, new expiry, issuedAt, notBefore date details. 
12. Sign the renewed token.
13. Send the token back to the client based on renewal type claim from original token. Refer CAT spec for more details on supported renewal type and communication of the token to client. 

