# CAT Module

The CAT module can be used to perform operations related to CAT tokens such as CAT token generation and validation. The module considers CAT tokens defined as per this [spec](https://shop.cta.tech/products/cta-5007). 
It exports implementations of CAT class that contains API's to create, decode and validate CWT tokens.

## Important Note
- CAT module is reference implementation which matches with the spec as of 04th December 2024.
- Implementation covers high level claims and customers are free to extend it to other claims in the spec as per their requirement.
- As of now the enc claim is supported using A256-GCM encryption algorithm only and users are free to adopt to new algorithms when it is available in EW crypto

## Limitations
- The CAT module relies on the alg header claim defined in protected header of the CAT token. However the CAT spec does not mandate this, but this module uses the value defined in the protected header to identiy the algorithm used for token verification. The protected header also provides additional security. 
- The module depends on CWT module (1.2.0 version) and its limitations are also extended. Refer [cwt](https://techdocs.akamai.com/edgeworkers/docs/cwt) doc to know its limitations.

## Subfolder organization
* **/api**: CAT API documentation.
* **/lib**: CAT module (js) and typescript definition.
* **/examples**: Usage examples of CAT module.

## Resources
For more information on CWT Module, please refer to the following resources:
* [CAT API Documentation](https://techdocs.akamai.com/edgeworkers/docs/cat)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.
