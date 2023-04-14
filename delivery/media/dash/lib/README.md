# DASH Module

The Dash module can be used to demonstrate EW's capabilities of dynamically creating personalized versions of DASH manifests based on parameters like device type, user geography, request headers or query string parameters.

## Some use cases supported in DASH module
Manifest Manipulation
Dynamically create personalized manifests of available Video on demand (VOD) manifest files using the DASH parser.

Content insertion
Dynamically add auxiliary media content to an existing Video on Demand (VOD) asset using Pre-Roll, Mid-Roll, and Post-Roll operations.

## Limitations
Currently the DASH parser accepts complete UTF-8 encoded MPD file contents and do not work in streaming mode. (i.e parsing chunks of data).

## Files
* **media-delivery-dash-parser.js** is the main class you import in your main.js file. This file provides helper classes such as parseMPD for parsing MPD to JSON objects.
* **media-delivery-dash-parse.d.ts** is the typescript declaration file for DASH module.

## Documentation
Please visit this [page](https://) for complete documentation and usage of DASH module.

## Resources
Please see the examples [here](../examples/) for example usage of DASH module.

### Todo
- [ ] Add documentation page link.