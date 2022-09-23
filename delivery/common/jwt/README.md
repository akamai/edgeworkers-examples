# JWT Module

The JWT module can be used to perform operations releasted to JWT token such as JWT token generation and validation. The module considers JWT tokens defined as per this [spec](https://www.rfc-editor.org/rfc/rfc7519). It exports implementations of JWTValidator class that contains API's to validate JWT tokens. 

## Limitations
- Currently the module only support API's for verfication of JWT tokens that are generated using RS256 or HS256 algorithm.
- As of now, EW do not support KMI to store verification keys, hence keys required for verification are fetched from property manager user defined variable. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars)

## Subfolder organization
* **/apis**: Link to JWT API documentation
* **/lib**: JWT module, typescript defination file and documentation 
* **/examples**: Example usage of JWT module.

## Resources
For more information on JWT Module, please refer to the following resources:
* [JWT API Documentation](https://)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.

### Todo
- [ ] Add documentation page link.