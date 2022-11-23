# Watermarking Module

The Watermarking module exposes API's for supporting forensic watermarking for Over-The-Top (OTT) on content that is delivered in an Adaptive Bitrate (ABR) format. Watermarking is used to define the origin of content leakage. The watermarking technology modifies media content in a robust and invisible way in order to encode a unique identifier, e.g., a unique session ID. The watermark is used to forensically trace the origin of content leakage. More info on the watermarking flow can be found [here](https://docs.google.com/document/d/1N85WZ-LHlGhMSbyrCY7yfOdwnsQ7Es8t/edit#)

## Functionality Supports
- Validation of JWT based WM token signed using HS256/RS256.
- Validation of CWT based WM token signed using HS256.
- Validation of short WM tokens signed using HS256.
- Support for irdeto based indirect watermarking flow.
- Support byterange or discrete segment request.


## Limitations
- Currently the watermarking support only indirect case and not direct case.
- As of now, EW do not support KMI to manage verification keys, hence these keys are fetched from property manager user defined variable which might not be a secure way. More details on user defined variables can be found [here](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars)

## Files
* **media-delivery-watermarking.js** is the main class you import in your main.js file. This file provides helper classes such as TokenType, Watermarking containing helper functions to validate tokens and compute watermarking variant.

* **media-delivery-watermarking.d.ts** is the typescript declaration file for JWT module.

## Documentation
Please visit this [page](https://) for complete documentation and usage of Watermarking module.

## Resources
Please see the examples [here](../examples/) for example usage of Watermarking module.

### Todo
- [ ] Add documentation page link.
