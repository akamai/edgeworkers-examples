# Akamai EdgeKV API PostMan collection

A PostMan API collection and skeleton environment based on the EdgeKV v1 API found [here](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/apis#edgekv-api).

Clone the repo to your local drive, then import the collection and environment into a PostMan Workspace to use it.

## To test 
- Define a MockServer in Postman and set the hostname of the MockServer (without the https://) in the host variable of the environment.

- Each request has an example response that can be called from the corresponding request, with the request setting some example values in the requests pre-request script

## To use
- Get your friendly Akamai administrator to create Akamai IAM user credentials for you, or ideally a Service Account API. To learn about how to setup Akamai IAM user credentials, click [here](https://developer.akamai.com/api/getting-started#authsetup).

- You should be provided with a set of EdgeRC tokens (two tokens, one secret, and one host)

- In the PostMan Environment is a corresponding four variables, fill in the CURRENT VALUE with the tokens, secret and host and save the environment.
  - **IMPORTANT NOTE** - DO NOT SAVE THE VALUE IN THE `INITAL VALUE` FIELDS, these may be visible if you go on to share the enviroment, and expose the tokens.

- In the Collection, set the Autorization tab so the type field is `Akamai EdgeGrid`
  - Set the Access Token field to be {{access_token}}
  - Set the Client Token field to be {{client_token}}
  - Set the Client Secret field to be {{client_secret}}
  - The host is set on each request; note make sure the host value in the Environment variable does not contain `https://`

![image](https://user-images.githubusercontent.com/11668707/136386973-4aa95431-7f70-4912-87ab-d7fad467013e.png)


## Pre-Request Scripts
Pre-Request scripts are defined for most requests, these allow you to set various parameters required by their requests. These scripts then set Collection level variables prior to executing the request, and are read by the the post-processing test to validate the response is as expected. Check the Pre-Request script first, before executing each request.

Some variables will be required to be defined by yourself in the Collection variables; such as

- `network` - either `STAGING` or `PRODUCTION`

## Post-Processing Tests
Tests are written for each request

