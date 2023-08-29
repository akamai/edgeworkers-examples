# CWT Module

The CWT module can be used to perform operations related to CWT tokens such as CWT token generation and validation. The module considers CWT tokens defined as per this [spec](https://www.rfc-editor.org/rfc/rfc8392.html). It exports implementations of CWTValidator class that contains API's to validate CWT tokens.

## Limitations
- Currently the module only support API's for verification of CWT tokens that are generated using HS256, ES256 algorithm only.
- Currently the module only support MAC0 and Sign1 COSE message structure. Refer this [page](https://datatracker.ietf.org/doc/rfc8152/) for more details on CBOR Object Signing and Encryption (COSE).
- As of now, EW do not support KMI to manage verification keys, hence these keys are fetched from property manager user defined variable which might not be a secure way. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars)

## Files
* **cwt.js** is the main class you import in your main.js file. This file provides helper classes such as CWTValidator for validating CWT tokens.
* **cwt.d.ts** is the TypeScript definition file for CWT module.

## Documentation
Please visit this [page](https://techdocs.akamai.com/edgeworkers/docs/cwt) for complete documentation and usage of CWT module.

## Resources
Please see the examples [here](../examples/) for example usage of CWT module.

### Todo
- [ ] Add documentation page link.
