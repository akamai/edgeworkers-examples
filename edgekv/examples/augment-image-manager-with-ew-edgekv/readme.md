# Augmenting Image Manager with EdgeWorkers and EdgeKV

## Copyright Notice
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview
The two EdgeWorkers within this repository execute in conjunction with the pristine and derivative traffic flows of Image Manager. Both EdgeWorkers need to be provisioned for this example to be fully functional. 

- The pristine EdgeWorker saves the incoming Content-Length header value from the origin response in EdgeKV with a SHA1 hash of the URL as key.
- The derivative EdgeWorker fetch this value on subsequent requests as input for instructing Image Manager to transform the image based on the pristine image size.

For detailed implementation steps, please see the accompanying [use case description](https://techdocs.akamai.com/edgekv/docs/augment-image-and-video-manager-with-edge-compute). The high level data flow looks like follows:

<img width="1384" alt="ew-flow" src="https://user-images.githubusercontent.com/51907605/130851026-dfdff808-567b-42a8-9feb-efbe55cb019f.png">

1. A user requests an image object for the first time from an edge server.
2. The edge server relays the image request to the image server. Before that, the derivative EdgeWorker triggers, but renders no value out of EdgeKV.
3. The image server requests the pristine image from the origin server through another edge server so we are able to execute operations on the returned image.
4. The edge server receives the pristine image object from the origin server.
5. The edge server triggers the pristine EdgeWorker, storing the Content-Length header value in EdgeKV for the URL. The image server stores the image object for processing and optimisation.

Not covered in the diagram above, the user triggering this initial image request is at this point served a derivative image that includes transformation and default optimizations. This does not include changes based on the pristine Content-Length header as the value is needed as input already before the pristine request.

6. Another user requests the same image object from the edge server.
7. The derivative EdgeWorker triggers again and is now returned a value from EdgeKV.
8. Based on the value, the edge server requests the optimal image transformations for the specific image from the image server that subsequently is delivered to the client.


## Prerequisites
On top of your normal delivery configuration, you would need an Image Manager configuration. If you are not yet a user of Image Manager you may add a trial version through [the Marketplace](https://control.akamai.com/apps/marketplace-ui/#/home).

## EdgeWorkers, EdgeKV and Image Manager
Links to resources around starting with EdgeWorkers can be found in the [examples root](https://github.com/akamai/edgeworkers-examples). 

If you are new to EdgeKV first check the [Hello World Example](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/examples/hello-world) with tips and best best practices to get started.
