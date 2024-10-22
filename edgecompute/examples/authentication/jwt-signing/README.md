# JWT Signing

_Keyword(s):_ jwt, authentication<br>

This project provides an Akamai Edgeworker solution for signing JSON Web Tokens (JWTs) and attaching them to API requests. It includes an example of how to sign a JWT using HMAC-SHA256 and then add the JWT and an API key to the headers of an outgoing request.

## Limitations

-   As of now, EW do not support KMI to manage verification keys, hence these keys are fetched from property manager user defined variable which might not be a secure way. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars).

## Resources

For more information on JWT Module, please refer to the following resources:

-   [JWT API Documentation](https://techdocs.akamai.com/edgeworkers/docs/jwt)
-   [Crypto module documentation](https://techdocs.akamai.com/edgeworkers/docs/crypto)
-   See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
