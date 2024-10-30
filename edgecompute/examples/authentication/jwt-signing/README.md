# JWT Signing

_Keyword(s):_ jwt, authentication<br>

## Copyright Notice

    (c) Copyright 2024 Akamai Technologies, Inc. Licensed under Apache 2 license.

This project provides an Akamai Edgeworker solution for signing JSON Web Tokens (JWTs) and attaching them to API requests. It includes an example of how to sign a JWT using HMAC-SHA256 and then add the JWT and an API key to the headers of an outgoing request.

## Security Considerations

-   Secrets are stored in [Property Manager variables](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars). Property Manager variables should be marked as hidden to prevent exposure with akamai-x-get-extracted-values. Depending on your security considerations, you may wish to store secrets elsewhere or use asymmetric keys.

## Resources

For more information on JWT Module, please refer to the following resources:

-   [JWT API Documentation](https://techdocs.akamai.com/edgeworkers/docs/jwt)
-   [Crypto module documentation](https://techdocs.akamai.com/edgeworkers/docs/crypto)
-   See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
