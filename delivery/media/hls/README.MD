# HLS Module

The HLS module can be used to demonstrate EW's capabilities of dynamically creating personalized versions of HLS manifests based on parameters like device type, user geography, request headers or query string parameters.
The HLS modules enable customer to parse and modify HLS manifest files (i.e. master and child m3u8 playlists).
HLS modules also export necessary classes such as LiveManifestTransformer for live program replacement usecases.

## Some use cases supported in HLS module
- Manifest Personalization: Dynamically create personalized renditions of an existent VOD manifest, for HLS based on the device type, user geography, request headers or query string parameters without incurring any additional compute/changes on the customer origin.
- Bumper Insertion: Enables content providers to insert a video (bumper) in front/mid/end of a VOD asset (pre-roll/mid-roll/post-roll) based on the geolocation, time of the day, content-id, etc. Allowing them to comply with content rights restrictions, display local ratings and any other message. For example displaying the content ratings in the country’s language.
- Program Replacement (Live): Enables dynamically replace a live stream (or linear program) with a blackout slate during a time period. The EW will rewrite the playlists when the client requests an update and the blackout period has started. During this period the content segments will be replaced by slate segments. The replacement is at the segment's boundaries. The blackout slate shall have the same stream encoding profile (bitrates, resolutions, encoder, frame alignments, etc) and segment duration as the original content.

## Limitations
- Currently the HLS parser accepts complete UTF-8 encoded m3u8 file contents and do not work in streaming mode. (i.e parsing chunks of data).

## Subfolder organization
* **/apis**: Link to HLS API documentation.
* **/lib**: HLS module (js) and TypeScript definition.
* **/examples**: Usage examples of HLS module.

## Resources
For more information on HLS Module, please refer to the following resources:
* [HLS Documentation](https://techdocs.akamai.com/edgeworkers/docs/hls-parser)
* [Examples](./examples/)

## Reporting Issues
If you experience any problems, please raise a Github issue or create a pull request with fixes, suggestions, or code contributions.
