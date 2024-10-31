# JWT Signing

_Keyword(s):_ jwt, authentication<br>

## Copyright Notice

    (c) Copyright 2024 Akamai Technologies, Inc. Licensed under Apache 2 license.

This project provides an Akamai Edgeworker solution for signing JSON Web Tokens (JWTs) and attaching them to API requests. It includes an example of how to sign a JWT using HMAC-SHA256 and then add the JWT and an API key to the headers of an outgoing request.

## Security Considerations

> [!IMPORTANT]
> Secrets are stored in [Property Manager variables](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars). Property Manager variables should be marked as hidden to prevent exposure with akamai-x-get-extracted-values. Depending on your security considerations, you may wish to store secrets elsewhere or use asymmetric keys.

## Usage Example

> [!NOTE]
> This EdgeWorker requires you to create a Property Manager variable named `PMUSER_JWT_HMAC_KEY` (if you prefer something different, ensure that the reference in the Edgeworker is updated), set it to hidden, and then paste an encoded key into it.

If you do not yet have an HMAC key, an example for doing so can be done by running the following in your browser:

```
const key = await crypto.subtle.generateKey(
    {
      name: "HMAC",
      hash: { name: "SHA-256" },
    },
    true, // Key must be extractable to export
    ["sign", "verify"]
);

// To export the key in "raw" format
const rawKey = await crypto.subtle.exportKey("raw", key);
console.log("Raw HMAC key:", new Uint8Array(rawKey));

// To export the key in "jwk" format
const jwkKey = await crypto.subtle.exportKey("jwk", key);
console.log("JWK HMAC key:", JSON.stringify(jwkKey));
```

### Explanation

1. **Raw Key**:

-   `raw` format returns the binary representation of the key.
-   The `Uint8Array` wrapper helps display the raw key as an array of bytes, which is useful for debugging.
-   Console Output for `raw` key:

```
Raw HMAC key: Uint8Array(32) [24, 134, 239, 140, ...] // Array of bytes
```

2. **JWK Key**:

-   `jwk` format returns a JSON Web Key, a JSON object that includes key details.
-   This format is more readable and interoperable, especially when working with web APIs.
-   Console Output for `jwk` key:

```
JWK HMAC key: {
  "kty": "oct",
  "k": "SGVsbG9Xb3JsZEtleQ...", // Base64 URL encoded key
  "alg": "HS256",
  "ext": true
}
```

In the JWK output:

-   `kty`: Key type, "oct" for symmetric keys.
-   `k`: The actual key material, base64url encoded.
-   `alg`: Algorithm, here `"HS256"` for HMAC-SHA-256.
-   `ext`: Indicates if the key is extractable (`true` in this case).

Take note that the main.js version uses `raw` key format. If using `jwk` in the example above, the stringified console output of `jwkKey` above may be pasted directly into the Property Manager variable `PMUSER_JWT_HMAC_KEY`.

## Resources

For more information on JWT Module, please refer to the following resources:

-   [JWT API Documentation](https://techdocs.akamai.com/edgeworkers/docs/jwt)
-   [Crypto module documentation](https://techdocs.akamai.com/edgeworkers/docs/crypto)
-   See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
