## Example Description
This example demonstrates the usage of CAT module for CAT token generation. Below is the curl command with the payload that this example accepts to generate the CAT token. The token is signed using HS256 algorithm. Examples uses a hardcoded HS256 key, however the same can be loaded using user-defined variable from Property Manager or via EdgeKV.

```bash
curl \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{ "iss": "backoffice.synamedia.com", "aud": "synamedia_cdn", "catu": { "scheme": { "exact": "http" }, "host": { "exact": "localhost:3070/synamedia" } }, "cath": { "userid": { "exact": "38vh7mmers45zq1csjplkd" } }, "catm": [ "GET", "POST" ], "catgeoiso3166": [ "FR", "US" ], "catv": 1, "nbf": 1742567042, "exp": 1742567072, "iat": 1742567042 }' \
  https://example.com/token
```
### High Level Workflow
1. `responseProvider` event handlers reads request body as JSON object.
2. Translates claims such as `catu`, `cath` as per CAT spec. (i.e Map object). Refer CAT spec for more details.
3. Translates entire payload to Map.  Refer CAT spec for more details.
3. Check if the payload is well formed before signing.
4. Create protected and unprotected CWT header. The example uses HS256 algorithm for signing. The unprocted header contains `kid` field to determing signers identity. Verifiers might use this field incase multiple verification keys are configured.
5. Load the crypto key for signign. Examples uses a hardcoded HS256 key, however the same can be loaded using user-defined variable from Property Manager or via EdgeKV.
6. Sign and generate the token. 
7. Encode the token to base64url and send it back to the client. 


