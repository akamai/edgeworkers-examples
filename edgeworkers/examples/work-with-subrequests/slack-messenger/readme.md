# Using subrequests to send asynchronous messages to Slack

## Copyright Notice
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview
With EdgeWorkers you have the possibility to run subrequests to external URLs. This may be done synchronously or asynchronously using await or not as EdgeWorkers support fire & forget. This enables easy, serverless monitoring beacons or messages alongside user interactions or other type of events occuring in your application when its traffic flows through Akamai.

Working POC: [Slack Messenger](https://poc.klasen.se/projects/ew/slack/index.html). This example pushes end-user messages to a Slack channel with the help of subrequests and a Slack webhook. In this case the message content is pulled from a query string. The final use case could be triggering a message whenever a user adds a comment to a page, uploads a file and more, avoiding the need to run origin logic to detect these events.

## Prerequisites
To be able to run subrequests against 3rd party domains, you need to proxy the traffic through Akamai. This is easily done by adding an additional origin within a new rule in Property Manager, in this case pointing to hooks.slack.com, for the specific web hook path as shown below.

![Property Manager](https://user-images.githubusercontent.com/51907605/131686089-d4ab6766-e22e-44ea-8627-64b7ff3380d6.png)

## EdgeWorkers, EdgeKV
Links to resources around starting with EdgeWorkers can be found in the [examples root](https://github.com/akamai/edgeworkers-examples). 

If you are new to EdgeKV first check the [Hello World Example](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/examples/hello-world) with tips and best best practices to get started.
