# EdgeKV Promo Code Validation Example

## Copyright Notice

    (c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview

The Promo Code Validation example demonstrates how you can use EdgeWorkers and EdgeKV to validate promo codes at the Edge.  A list of promo codes with valid date ranges is stored in EdgeKV.

## Pre-requisites

Please ensure you fulfill the following pre-requisites before you execute this example:

* Get familiar with the EdgeKV data model (namespace, group, item). [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html)
* Create an EdgeWorker ID (EWID) and add it to your site's config in property manager. [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-F11192E1-0BFB-415F-88FA-5878C30B7D2A.html)
* Initialize your EdgeKV store [link to instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html). This step also creates the default namespace used in this example.
* Generate your OPENAPI client credentials. [link](https://developer.akamai.com/api/getting-started)
* Use the [EdgeKV Importer example](/edgekv/utils/edgekv-importer) to
  * Initialize your EdgeKV store
  * Import the [promo codes CSV file](promo-codes.csv) into EdgeKV
  * Generate an EdgeKV Access Token
* Download the following sample code. This constitutes the core of your EdgeWorker code bundle for this example.
```
% git clone https://github.com/akamai/edgeworkers-examples.git
Cloning into 'edgeworkers-examples'...
... done.
% cd edgeworkers-examples/edgekv/examples/validate-promo-code
```
* Update the `edgekv_tokens.js` file in your EdgeWorker code bundle directory. [link to instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html)
* Download the latest [edgekv.js](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js) library file and copy it to your EdgeWorker bundle directory.

## Getting to work

### Prelude
We will be using the `ecom` namespace and organizing our items in a group named `promocodes`.

### Seeding the KV Store

You can create the namespace, import the data, and generate the access token with the [EdgeKV Importer](/edgekv/utils/edgekv-importer)

```shell
edgekv-importer --csv promo-codes.csv --key code  --namespace ecom --group promocodes --generateToken
```

The key used for each item will be the code defined in the "code"" column of the CSV file.


### Update & Activate your EdgeWorkers code

1. Create a tarball of your EdgeWorker bundle (do not forget to update the version info in your `bundle.json` before creating the tarball)

```
tar czvf validate-promo-code.tgz bundle.json main.js lib/edgekv.js lib/edgekv_tokens.js
```

2. Upload your code bundle and activate your EWID. [link to EdgeWorker instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-430E06BE-81C9-4F26-ABB7-C1FD2BAC7497.html)

3. Wait for activation to complete, then proceed to "Try it all out". [link to EdgeWorker instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-430E06BE-81C9-4F26-ABB7-C1FD2BAC7497.html)


### Try it all out

Let's assume you added a behavior containing the EWID associated with this example to
your Akamai property under a match condition for path `http://example.com/promocodes`.

You can test this out using the following curl command:

```
% curl -s http://example.com/promocode?code=SAVE10PCT

```

Replace SAVE10PCT with your desired promo code to get different results. E.g., the following URL will return a response for an invalid code, because the promo code has expired (based on the value of the `valid_to` field)

```
% curl -s http://example.com/promocode?code=EXPIRED

```

## Getting Help or Providing Feedback
If you run into issue, need additional assistance, or would otherwise like to provide feedback,
please check out the [Reporting Issues section](https://github.com/akamai/edgeworkers-examples/#Reporting-Issues)
on the main repo page.
