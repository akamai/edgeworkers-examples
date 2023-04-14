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

## Files
* **hls.js** is the main class you import in your main.js file. This file provides helper classes such as parsing UTF-8 encoded m3u8 files to JSON objects and vice versa.
* **hls.d.ts** is the TypeScript declaration file for HLS module.

## Documentation
Please visit this [page](https://techdocs.akamai.com/edgeworkers/docs/hls-parser) for complete documentation and usage of HLS module.

## Resources
Please see the examples [here](../examples/) for example usage of HLS module.
