# EdgeKV API

## Before you start

### 1. Install and configure Akamai's OPEN API Developer tools
Refer to our [API Authentication instructions](https://developer.akamai.com/getting-started/edgegrid). 

This document uses examples created via the httpie interface.  For more information on httpie specifics: [HTTPie docs](https://httpie.org/docs)

### 2. Create your API Client Credentials
Refer to our [Get Started with APIs instructions](https://developer.akamai.com/api/getting-started) for information on how to create credentials in Control Center or ask your administrator to provide you with the appropriate credentials.


You can reuse the API credentials that were created for EdgeWorkers or create new ones. In both cases, you need to add EdgeKV READ/WRITE permissions to your API credentials to allow you to access the EdgeKV API endpoints. 

### 3. Familiarize yourself with the EdgeKV data model
Refer to our [EdgeKV data model](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) documentation.

## The Basics
The following are the APIs available to EdgeKV customers which enable their administrative operations.

### 1. Initialize EdgeKV for the first time.

This is only required once, to initialize your EdgeKV database and provision the `default` EdgeKV namespace on Akamai's Staging and Production networks. It also creates a new dedicated CP code used to track your EdgeKV usage.

#### Endpoint:
Initialize the EdgeKV database using `PUT`:
```
PUT /edgekv/v1/initialize
```

`GET` can also be used to check on the current initialization status:

```
GET /edgekv/v1/initialize
```

#### Example:
Request:

`$ http --auth-type edgegrid PUT :/edgekv/v1/initialize`

Response:
```
HTTP/1.1 201 Created
Content-Type: application/json

{
    "accountStatus": "INITIALIZED",
    "cpcode": "123456",
    "productionStatus": "INITIALIZED",
    "stagingStatus": "INITIALIZED"
}
```

### 2.  List EdgeKV namespaces

Once EdgeKV is provisioned, a default namespace is created in both `staging` and `production` environments.  This can be confirmed by calling the namespaces endpoint to retrieve the list of available namespaces in EdgeKV.

#### Endpoint:

`GET /edgekv/v1/networks/{network}/namespaces?details=on`

{network} - Can be either `staging` or `production`

`details=on` (optional) whether to return all namespace attributes or only names.

#### Example:

Request:
```
$ http --auth-type edgegrid -a default: GET :/edgekv/v1/networks/staging/namespaces?details=on
```

Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "namespaces": [
        {
            "geoLocation": "US",
            "namespace": "default",
            "retentionInSeconds": 15724800
        },
        {
            "geoLocation": "US",
            "namespace": "test1",
            "retentionInSeconds": 15724800
        }
    ]
}
```
> Note: `geoLocation` defaults to "US".

### 3. Create an EdgeKV namespace
You may optionally create additional namespaces. You have to specify the network in which the namespace will be created, which can be either `staging` or `production`. 

> It is recommended that you create namespaces in both `staging` and `production` so that you can seamlessly test your EdgeWorker code in both environments.


#### Endpoint:

To create a new namespace:

`POST /edgekv/v1/networks/{network}/namespaces`

**Content-Type:** `application/json`

**Request body parameters**

`namespace` - (mandatory) Namespace name 

`retentionInSeconds` - (mandatory) Specify the retention period for data in this namespace in seconds, or 0 for indefinite.

#### Example:

Request:

```
$ http --print=hbHB --auth-type edgegrid -a default: POST :/edgekv/v1/networks/staging/namespaces namespace=marketing retentionInSeconds=0

POST /edgekv/v1/networks/staging/namespaces HTTP/1.1

Content-Type: application/json
{
    "namespace": "marketing",
    "retentionInSeconds": 0
}

```

Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "geoLocation": "US",
    "namespace": "marketing",
    "retentionInSeconds": 0
}
```
### 4. Read EdgeKV namespace details
You can query the attributes for existing namespaces.

#### Endpoint:

To read the attributes of a namespace:

`GET /edgekv/v1/networks/{network}/namespaces/{namespaceId}`

#### Example
Request:
```
$ http --auth-type edgegrid -a default: GET ":/edgekv/v1/networks/staging/namespaces/marketing"

```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "geoLocation": "US",
    "namespace": "marketing",
    "retentionInSeconds": 0
}
```
### 5. Update an EdgeKV namespace
You can update the retention period for an existing namespace other than the `default` namespace. 

You can simply copy the json response from the POST or GET operations above and change the `retentionInSeconds` value to specify the desired new retention period.

> **_NOTE:_** It may take up to 5 minutes for the new retention policy to be applied. The newly specified retention period only applies to data added or updated in the namespace after this operation. The retention period of unmodified data remains unchanged and cannot be queried after this operation is performed.
#### Endpoint:

To update an existing namespace (other than `default`):

`PUT /edgekv/v1/networks/{network}/namespaces/{namespaceId}`

**Content-Type:** `application/json`

**Request body parameters**

`namespace` - (mandatory) Namespace name (MUST be the same as the `{namespaceId}` in the endpoint)

`retentionInSeconds` - (mandatory) Specify the new retention period for data in this namespace in seconds, or 0 for indefinite.

#### Example:

Request:

```
$ http --print=hbHB --auth-type edgegrid -a default: PUT :/edgekv/v1/networks/staging/namespaces/marketing namespace=marketing retentionInSeconds=2592000

PUT /edgekv/v1/networks/staging/namespaces/marketing

{
    "namespace": "marketing",
    "retentionInSeconds": "2592000"
}
```

Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "geoLocation": "US",
    "namespace": "marketing",
    "retentionInSeconds": 2592000
}
```

### 6. Generate an EdgeKV Access Token
An EdgeKV-specific access token is required to access each namespace in your data model from EdgeWorkers. Refer to [Generate an EdgeKV access token instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) for information about EdgeKV Access Token.

> **_NOTE:_** Token name needs to be unique within your account. You cannot use the name of an existing token.

#### Endpoint:

To generate a new EdgeKV access token for a specific namespace:
`POST /edgekv/v1/tokens`

**Content-Type:** `application/json`

**Request body:** 
```
{
    "allowOnProduction": "true | false",
    "allowOnStaging": "true | false",
    "expiry": "<expiry date in ISO format>",
    "name": "<token name>",
    "namespacePermissions": {
        "default": [
            "r",
            "w",
            "d"
        ]
    }
}
```

#### Example
Request:

```
$ http --print=hbHB --auth-type edgegrid -a default: POST :/edgekv/v1/tokens name=my_token allowOnStaging=true allowOnProduction=true expiry="2021-06-30" namespacePermissions:='{"default":["r","w", "d"]}' 
```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json
{
    "expiry": "2021-06-30",
    "name": "my_token",
    "uuid": "fa3a7ae0-1b0c-45c7-adc3-f0638c6b7466",
    "value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```
> **_NOTE:_** You can use the output of this command to update the `edgekv_tokens.js` file.


### 7. Retrieve an EdgeKV Access Token
You can retrieve an EdgeKV access token. To retrieve a token you need the token name used when it was created. 
An EdgeKV-specific access token is required to access each namespace in your data model from EdgeWorkers. Refer to [Generate an EdgeKV access token instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) for information about EdgeKV Access Token.

> **_NOTE:_** You cannot retrieve tokens created during the Tech Preview Period.

#### Endpoint:

To retrieve an EdgeKV access token:
`GET /edgekv/v1/tokens/{tokenName}`

#### Example
Request:

```
$ http --print=hbHB --auth-type edgegrid -a default: GET :/edgekv/v1/tokens/token1
```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json
{     
    "expiry": "2021-06-30",     
    "name": "token1",     
    "uuid": "2f8e59c9-43ab-5f9c-b498-56ab0253dc9a",     
    "value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
}
```
> **_NOTE:_** You can use the output of this command to update the `edgekv_tokens.js` file.


### 8. List EdgeKV Access Tokens
You can list access tokens created for EdgeKV.


#### Endpoint:

To list EdgeKV access tokens:
`GET /edgekv/v1/tokens?includeExpired=true|false`

`includeExpired` (Optional) if 'true', include expired tokens in the response.

#### Example
Request:

```
$ http --print=b --auth-type edgegrid -a default: GET :/edgekv/v1/tokens
```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json
{
    "tokens": [
        {
            "expiry": "2021-06-30",
            "name": "token1",
            "uuid": "12886ccf-7662-5f19-b039-766740ce227f"
        },
        {
            "expiry": "2021-06-30",
            "name": "my_token",
            "uuid": "a600dfaa-3b7a-5d2a-bae3-b0c0d0e88e4a"
        }
    ]
}
```

### 9. Revoke an EdgeKV Access Token
You can revoke an EdgeKV access token to prevent it from being used in an EdgeWorkers code bundle to gain access to EdgeKV. 

Any requests from an EdgeWorkers code bundle using a revoked token will result in a 401 error.

> **_NOTE:_** Revoking an access token is an irreversible operation. Once you revoke a token, you need to update all the deployed EdgeWorkers code bundles with a new token.   

#### Endpoint:

To revoke an EdgeKV access token:

#### Endpoint:

To Revoke an EdgeKV Access Tokens:

`DELETE /edgekv/v1/tokens/{tokenName}`

#### Example
Request:

```
$ http --print=hbHB --auth-type edgegrid -a default: DELETE :/edgekv/v1/tokens/token1
```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json
{     
    "name": "token1",     
    "uuid": "2f8e59c9-43ab-5f9c-b498-56ab0253dc9a"   
}
```

### 10.  Write an item to an EdgeKV namespace
You can use the following API to create or update an item in EdgeKV. Data in a namespace is contained inside a logical container called a group. When adding or updating an item, you must specify the destination namespace and group that the item belongs to. The namespace must already exist, but a group (if it does not already exist), will automatically be created when creating the item. 

#### Endpoint:

To write an item:
`PUT /edgekv/v1/networks/{network}/namespaces/{namespaceId}/groups/{groupId}/items/{itemId}`

**Content-Type:** `application/json` or `application/text`
**Request body:** JSON or String value.

> **_NOTE:_** The `itemId` is also know as the `key`. 

#### Example

For Example, to write an item with key `DE` and a JSON value to the `countries` group within the `marketing` namespace


Example using httpie built-in JSON constructs:

```
$ http --print=hbHB --auth-type edgegrid -a default: PUT :/edgekv/v1/networks/staging/namespaces/marketing/groups/countries/items/DE name='Germany' flag='/germany.png' currency='€'

PUT /edgekv/v1/networks/staging/namespaces/marketing/groups/countries/items/DE HTTP/1.1
Content-Type: application/json

{
    "currency": "€",
    "flag": "/germany.png",
    "name": "Germany"
}
```

Response:

```
HTTP/1.1 200 OK

Item was upserted in KV store with database 123456, namespace marketing, group countries, and key DE.
```

Another example using a value within a JSON (file):

```
$ cat us.json
{"name":"United States","flag":"/us.png","currency":"$"}
```

```
$ http --print=hbHB --auth-type edgegrid -a default: PUT :/edgekv/v1/networks/staging/namespaces/marketing/groups/countries/items/US < us.json
PUT /edgekv/v1/networks/staging/namespaces/marketing/groups/countries/US 
Content-Type: application/json

{
    "currency": "$",
    "flag": "/us.png",
    "name": "United States"
}
```

Response:

```
HTTP/1.1 200 OK

Item was upserted in KV store with database 123456, namespace marketing, group countries, and key US.

```

Yet another example using a string value
```
$ echo "English" | http --print=hbHB --auth-type edgegrid -a default: PUT :/edgekv/v1/networks/staging/namespaces/marketing/groups/languages/items/US Content-Type:text/plain
PUT /edgekv/v1/networks/staging/namespaces/marketing/groups/languages/items/US
Content-Type: text/plain

English
```

Response:

```
HTTP/1.1 200 OK

Item was upserted in KV store with database 123456, namespace languages, group languages, and key US.

```


### 11.  Read an item from an EdgeKV namespace
You can use the following API to read an item from EdgeKV. You need to specify the `namespace` and `group` this item belongs to. 

> **_NOTE:_** It can take up to 10 seconds or longer to read an item that has been recently written to EdgeKV. A `404 Not Found` response status code may be returned during that period. This is normal behavior for EdgeKV which is an eventually consistent database.

#### Endpoint:

To read an item:
`GET /edgekv/v1/networks/{network}/namespaces/{namespaceId}/groups/{groupId}/items/{itemId}`

#### Example

```
$ http --print=hbHB --auth-type edgegrid -a default: GET :/edgekv/v1/networks/staging/namespaces/marketing/groups/countries/items/DE 
```
Response
```
HTTP/1.1 200 OK
Content-Type: text/plain;charset=utf-8

{
    "currency": "€",
    "flag": "/germany.png",
    "name": "Germany"
}
```
### 12.  Delete an item from an EdgeKV namespace
You can use the following API to delete an item from EdgeKV. You need to specify the `namespace` and `group` this item belongs to. 

#### Endpoint:

To delete an item:
`DELETE /edgekv/v1/networks/{network}/namespaces/{namespaceId}/groups/{groupId}/items/{itemId}`

#### Example


```
$ http --print=hbHB --auth-type edgegrid -a default: DELETE :/edgekv/v1/networks/staging/namespaces/marketing/groups/countries/items/US
DELETE /edgekv/v1/networks/staging/namespaces/marketing/groups/countries/items/US
```
Response:
```
HTTP/1.1 200 OK

Item was delete in KV store with database 123456 namespace default group countries key US.
```

### 13.  List items within a group
You can list items in a group.

> **_NOTE:_** A maximum of 100 items can be returned.

#### Endpoint:

To list items in a group:
`GET /edgekv/v1/networks/{network}/namespaces/{namespaceId}/groups/{groupId}`

#### Example

```
$ http --print=hbHB --auth-type edgegrid -a default: GET :/edgekv/v1/networks/staging/namespaces/marketing/groups/countries 
GET /edgekv/v1/networks/staging/namespaces/marketing/groups/countries
```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8

[
    "US",
    "DE"
]
```


## Response Codes and Errors

EdgeKV API makes use of standard HTTP response codes such as

* 102 Processing
* 200 Success
* 201 Created
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 409 Conflict
* 413 Payload Too Large
* 429 Too Many Requests
* 500 Internal Error
* 501 Not Implemented
* 504 Gateway Timeout

> **_NOTE:_** You may get back `404 Not Found` when reading an item that has been written to EdgeKV, but that may not always be treated as an error due to the eventual consistency property of EdgeKV. You can read more about EdgeKV's eventual consistency model in the [EdgeKV Getting Started Guide](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html).

More details about a given error is provided in the response body JSON. 

Example (trying to request a namespace that does not exist):

```
$ http --auth-type edgegrid -a default: GET :/edgekv/v1/networks/staging/namespaces/bad_namespace
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
    "additionalDetail": {
        "requestId": "d0c361252e107666"
    },
    "detail": "The requested namespace does not exist.",
    "errorCode": "EKV_9000",
    "instance": "/edgeKV/error-instances/af839313-4763-4053-b7ef-87fa0514e2ac",
    "status": 400,
    "title": "Bad Request",
    "type": "https://learn.akamai.com"
}
```

## Getting Help
Refer to [EdgeKV Getting Started Guide](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) for information on how to get help.
