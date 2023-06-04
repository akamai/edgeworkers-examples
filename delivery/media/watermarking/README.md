# Watermarking Module

A digital watermark is a kind of marker covertly embedded in a noise-tolerant signal such as audio, video or image data. It is typically used to identify ownership of the copyright of such signal. "Watermarking" is the process of hiding digital information in a carrier signal; the hidden information should,[1] but does not need to, contain a relation to the carrier signal. Digital watermarks may be used to verify the authenticity or integrity of the carrier signal or to show the identity of its owners. It is prominently used for tracing copyright infringements

The module can be used to perform operations related to forensic watermarking for Over-The-Top (OTT)
on content that is delivered in an Adaptive Bitrate (ABR) format. The module adheres dash-if watermarking spec, more info on the same can be found [here](https://dashif.org/news/watermarking/).


## Subfolder organization
* **/apis**: Link to Watermarking documentation.
* **/lib**: Watermarking module (js) and TypeScript definition.
* **/examples**: Usage examples of Watermarking module.

## Resources
For more information on Watermarking Module, please refer to the following resources:
* [Watermarking API Documentation](https://techdocs.akamai.com/edgeworkers/docs/watermarking)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.

#TODO
- [ ] EW support for ECDH-SS+A128KW decryption algorithm + E2E testing of direct case.
