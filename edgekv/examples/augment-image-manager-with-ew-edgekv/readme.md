# Augmenting Image Manager with EdgeWorkers and EdgeKV

## Copyright Notice
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview
These two EdgeWorkers execute in conjunction with the pristine and derivative traffic flows of Image Manager.

- The pristine EdgeWorker saves the incoming Content-Length header value from the origin response in EdgeKV with a SHA1 hash of the URL as key.
- The derivative EdgeWorker fetch this value on subsequent requests as input for instructing Image Manager to transform the image based on the pristine image size.

## Prerequisites
On top of your normal delivery configuration, you would need an Image Manager configuration. If you are not yet a user of Image Manager you may add a trial version through [the Marketplace](https://control.akamai.com/apps/marketplace-ui/#/home). For detailed implementation steps, please reach out to your Akamai contact.

## EdgeWorkers, EdgeKV and Image Manager
Links to resources around starting with EdgeWorkers can be found in the [examples root](https://github.com/akamai/edgeworkers-examples). 

If you are new to EdgeKV first check the [Hello World Example](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/examples/hello-world) with tips and best best practices to get started.
