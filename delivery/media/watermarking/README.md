# Watermarking Module

The Watermarking module exposes API's for supporting forensic watermarking for Over-The-Top (OTT) on content that is delivered in an Adaptive Bitrate (ABR) format. Watermarking is used to define the origin of content leakage. The watermarking technology modifies media content in a robust and invisible way in order to encode a unique identifier, e.g., a unique session ID. The watermark is used to forensically trace the origin of content leakage. More info on the watermarking flow can be found [here](https://docs.google.com/document/d/1N85WZ-LHlGhMSbyrCY7yfOdwnsQ7Es8t/edit#)

## Functionality Supports
- Validation of JWT based WM token signed using HS256/RS256.
- Validation of CWT based WM token signed using HS256.
- Validation of short WM tokens signed using HS256.
- Support for irdeto based indirect watermarking flow as mentioned [here](https://docs.google.com/document/d/1N85WZ-LHlGhMSbyrCY7yfOdwnsQ7Es8t/edit#)
- Support byterange or discrete segment request.


## Limitations
- Currently the watermarking support only indirect case and not direct case.
- As of now, EW do not support KMI to manage verification keys, hence these keys are fetched from property manager user defined variable which might not be a secure way. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars)

## Subfolder organization
* **/apis**: Link to Watermarking API documentation.
* **/lib**: Watermarking module (js) and typescript definition.
* **/examples**: Usage examples of Watermarking module.

## Resources
For more information on Watermarking Module, please refer to the following resources:
* [Watermarking API Documentation](https://)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.

### Todo
- [ ] Add documentation page link.

### Future Release Plan
- Support for direct case where wmid can be encrypted using aes-128-cbc or aes-256-cbc algorithm.
