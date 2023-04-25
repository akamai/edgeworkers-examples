# JWT Module

The JWT module can be used to perform operations related to JWT tokens such as JWT token generation and validation. The module considers JWT tokens defined as per this [spec](https://www.rfc-editor.org/rfc/rfc7519). It exports implementations of JWTValidator class that contains API's to validate JWT tokens.

## Limitations
- Currently the module only support API's for verification of JWT tokens and not creation of JWT tokens.
- As of now, EW do not support KMI to manage verification keys, hence these keys are fetched from property manager user defined variable which might not be a secure way. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars)

## Files
* **jwt.js** is the main class you import in your main.js file. This file provides helper classes such as JWTValidator for validating JWT tokens.
* **jwt.d.ts** is the typescript declaration file for JWT module.

## Documentation
Please visit this [page](https://techdocs.akamai.com/edgeworkers/docs/jwt) for complete documentation and usage of JWT module.

## Resources
Please see the examples [here](../examples/) for example usage of JWT module.
