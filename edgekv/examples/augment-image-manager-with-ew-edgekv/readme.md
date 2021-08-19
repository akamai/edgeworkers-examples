# Augmenting Image Manager with EdgeWorkers and EdgeKV

## Copyright Notice
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview
These two EdgeWorkers execute in conjunction with the pristine and derivative traffic flows of Image Manager.

- The pristine EdgeWorker saves the incoming Content-Length header value from the origin response in EdgeKV with a SHA1 hash of the URL as key.
- The derivative EdgeWorker fetch this value on subsequent requests as input for instructing Image Manager to transform the image based on the pristine image size.

## Prerequisites
For a complete overview of all benefits of doing this with prerequisites and setup instructions, follow the implementation steps outlined in the [accompanying blog post](https://blogs.akamai.com/edge-computing/).

## EdgeWorkers, EdgeKV and Image Manager
Links to resources around starting with EdgeWorkers can be found in the [examples root](https://github.com/akamai/edgeworkers-examples). 

If you are new to EdgeKV first check the [Hello World Example](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/examples/hello-world) with tips and best best practices to get started.

This EdgeWorker can of course be reused for other use cases not related to Image Manager, but if you are interested and not yet using Image Manager, you may either contact your Akamai account team or initiate a trial in the [Marketplace](https://control.akamai.com/apps/marketplace-ui/#/home). 