# CWT Module

The CWT module can be used to perform operations related to CWT tokens such as CWT token generation and validation. The module considers CWT tokens defined as per this [spec](https://www.rfc-editor.org/rfc/rfc8392.html). It exports implementations of CWTValidator class that contains API's to validate CWT tokens.

## Limitations
- Currently the module only support API's for verification of CWT tokens that are generated using HS256 algorithm only.
- Currently the module only support MAC0 COSE message structure. Refer this [page](https://datatracker.ietf.org/doc/rfc8152/) for more details on CBOR Object Signing and Encryption (COSE).
- As of now, EW do not support KMI to manage verification keys, hence these keys are fetched from property manager user defined variable which might not be a secure way. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars)

## Subfolder organization
* **/apis**: Link to CWT API documentation.
* **/lib**: CWT module (js) and typescript definition.
* **/examples**: Usage examples of CWT module.

## Resources
For more information on CWT Module, please refer to the following resources:
* [CWT API Documentation](https://)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.

### Todo
- [ ] Add documentation page link.
- [ ] Add definition for crypto, encoding and base64 inbuilt module to [akamai-edgeworkers](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/akamai-edgeworkers/index.d.ts)
