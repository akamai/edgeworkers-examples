# A/B Test with EdgeWorkers and EdgeKV

## Copyright Notice
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview
This EdgeWorker randomly places a user into one of two buckets (A or B). The bucket defines if the request is forwarded to either an experimental or control URL.

- The bucket-to-path mapping will be stored in an EdgeKV database
- Client bucket selection will be persisted via a cookie value to ensure a client is locked to the same URL on subsequent visits. 
- The test will be implemented by forwarding a user accessing a website with a URI path of /edgekv/abtest. 

## Prerequisites
If you are new to EdgeKV first check the [Hello World Example](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/examples/hello-world) with tips and best best practices to get started.

## Setup

### Property Manager Variables
This EdgeWorker requires a PMUSER variable to be defined in Property Manager: PMUSER_EKV_ABTEST_EW

### EdgeKV
This example expects a working EdgeKV instance with these settings:

- Namespace: default
- Group: abpath

This example expects data to be populated:
- Key: BucketNames *(A or B)*
- Value: Path *(ekv_experience/experiment-A or ekv_experience/experiment-B)*

### Origin
This example rewrites URL's before sending them to the origin, make the endpoint of your rewrite actually exists. If not you will see 404 response codes.

## A step by Step Guide
{{fill in}}

