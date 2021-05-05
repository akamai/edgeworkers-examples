# A/B Test with EdgeWorkers and EdgeKV

## Copyright Notice
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview
This EdgeWorker randomly places a user into one of two buckets (A or B). The bucket defines if the request is forwarded to either an experimental or control URL.

- The bucket-to-path mapping will be stored in an EdgeKV database
- Client bucket selection will be persisted via a cookie value to ensure a client is locked to the same URL on subsequent visits. 
- The test will be implemented by forwarding a user accessing a website with a URI path of /edgekv/abtest. 

## Property Manager Variables
This EdgeWorker requires a PMUSER variable to be defined in Property Manager: PMUSER_EKV_ABTEST_EW

## EdgeKV
EdgeKV *(namespace: default, group: abpath)* contains the required data to rewrite the incoming request in group.
- Key: BucketName *(A or B)*
- Value: Path *(ekv_experience/experiment-A or ekv_experience/experiment-A)*
