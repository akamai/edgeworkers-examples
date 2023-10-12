# Watermarking Module

A digital watermark is a kind of marker covertly embedded in a noise-tolerant signal such as audio, video or image data. It is typically used to identify ownership of the copyright of such signal. "Watermarking" is the process of hiding digital information in a carrier signal; the hidden information should,[1] but does not need to, contain a relation to the carrier signal. Digital watermarks may be used to verify the authenticity or integrity of the carrier signal or to show the identity of its owners. It is prominently used for tracing copyright infringements

The module can be used to perform operations related to forensic watermarking for Over-The-Top (OTT)
on content that is delivered in an Adaptive Bitrate (ABR) format. The module adheres dash-if watermarking spec, more info on the same can be found [here](https://dashif.org/news/watermarking/).

## Supports and Limitations
- Supports CWT and JWT based tokens. The module internally uses EW compatible JWT and CWT modules.
- Supports direct and indirect case. Refer [WM spec](https://dash-industry-forum.github.io/docs/DASH-IF-IOP_OTT-Watermarking.pdf) for more details about these two. Incase of indirect case, customer needs to obtain vendor specific wmid generator logic and plug in the watermarking module. Refer wm-indirect examples for more details.
- Supports sidecar files only in CBOR encoded format as per the dash-if watermarking spec.
- Sidecar files must be hosted on origin server at /pathname/WMPaceInfo/filename location. Incase of discrete, the sidecar data can be sent in WMPaceInfoEgress header.

## Files
* **media-delivery-watermarking.js** is the main class you import in your main.js file. This file provides helper classes such as Watermarking, WMOptions, WMJSON, WMPayload for necessary watermarking operations.
* **media-delivery-watermarking.d.ts** is the typescript declaration file for Watermarking module.

## Documentation
Please visit this [page](https://techdocs.akamai.com/edgeworkers/docs/watermarking) for complete documentation and usage of Watermarking module.

## Resources
Please see the examples [here](../examples/) for example usage of Watermarking module.
