# DASH Module

The Dash module can be used to demonstrate EW's capabilities of dynamically creating personalized versions of DASH manifests based on parameters like device type, user geography, request headers or query string parameters.

## Some use cases supported in DASH module
Manifest Manipulation
Dynamically create personalized manifests of available Video on demand (VOD) manifest files using the DASH parser.

Content insertion
Dynamically add auxiliary media content to an existing Video on Demand (VOD) asset using Pre-Roll, Mid-Roll, and Post-Roll operations.

## Limitations
Currently the DASH parser accepts complete UTF-8 encoded MPD file contents and do not work in streaming mode. (i.e parsing chunks of data).

## Subfolder organization
* **/apis**: Link to DashParser API documentation.
* **/lib**: Dash module (js) and typescript definition.
* **/examples**: Usage examples of DashParser module.

## Resources
For more information on DashParser Module, please refer to the following resources:
* [dash API Documentation](https://techdocs.akamai.com/edgeworkers/docs/dash-parser)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.
