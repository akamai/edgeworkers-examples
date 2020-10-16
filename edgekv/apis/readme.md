# EdgeKV API Tech Preview

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
    "account_status": "INITIALIZED",
    "cpcode": "123456",
    "production_status": "INITIALIZED",
    "staging_status": "INITIALIZED"
}
```

### 2.  List EdgeKV namespaces

Once EdgeKV is provisioned, a default namespace is created in both `staging` and `production` environments.  This can be confirmed by calling the namespaces endpoint to retrieve the list of available namespaces in EdgeKV.

#### Endpoint:

`GET /edgekv/v1/networks/{network}/namespaces`

{network} - Can be either `staging` or `production`


#### Example:

Request:
```
$ http --auth-type edgegrid GET :/edgekv/v1/networks/staging/namespaces
```

Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "namespaces": [
        "default"
    ]
}
```

### 3. Create an EdgeKV namespace
You may optionally create additional namespaces. You have to specify the network in which the namespace will be created, which can be either `staging` or `production`. 

> It is recommended that you create namespaces in both `staging` and `production` so that you can seamlessly test your EdgeWorker code in both environments.


#### Endpoint:

To create a new namespace:

`POST /edgekv/v1/networks/{network}/namespaces`

**Content-Type:** `application/json`
**Request body:** `{"name":"{namespace-id}"}`

#### Example:

Request:

```
$ http --print=hbHB --auth-type edgegrid -a default: POST :/edgekv/v1/networks/staging/namespaces name=marketing 

POST /edgekv/v1/networks/staging/namespaces HTTP/1.1

Content-Type: application/json
{
    "name": "marketing"
}

```

Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "retention_period": "15724800"
}
```

### 4. Read EdgeKV namespace details
You can query the attributes for existing namespaces.

#### Endpoint:

To read the attributes of a namespace:

`GET /edgekv/v1/networks/{network}/namespaces/{namespace-id}`

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
    "retention_period": "15724800"
}
```
The retention period returned is in seconds.

### 5. Generate an EdgeKV Access Token
An EdgeKV-specific access token is required to access each namespace in your data model from EdgeWorkers. Refer to [Generate an EdgeKV access token instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) for information about EdgeKV Access Token.

> **_NOTE:_** It is recommended that you generate exactly one token per namespace.

#### Endpoint:

To generate a new EdgeKV Access Token for a specific namespace:
`POST /edgekv/v1/tokens`

**Content-Type:** `application/json`
**Request body:** 
```
{
    "name": "<token_name>",
    "allow_on_production": "true" | "false",
    "allow_on_staging": "true" | "false",
    "expiry": "<expiry_datetime>",
    "namespace_permissions": {
        "<namespace-id>": [
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
$ http --print=b --auth-type edgegrid -a default: POST :/edgekv/v1/tokens name=my_token allow_on_staging=true allow_on_production=true expiry=2020-12-31T01:00:00-00:00 namespace_permissions:='{"default":["r","w", "d"]}'
```
Response:
```
HTTP/1.1 200 OK
Content-Type: application/json
{
    "expiry": "2020-12-31T01:00:00-00:00",
    "name": "my_token",
    "uuid": "fa3a7ae0-1b0c-45c7-adc3-f0638c6b7466",
    "value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```
> **_NOTE:_** Please securely store the output of this command. You will need it to update the `edgekv_tokens.js` file.


### 6.  Write an item to an EdgeKV namespace
You can use the following API to create or update an item in EdgeKV. You need to specify the `namespace` and `group` this item belongs to. The `namespace` must have been already created, while the `group` will be automatically created for you if it does not exist.

#### Endpoint:

To write an item:
`PUT /edgekv/v1/networks/{network}/namespaces/{namespace-id}/groups/{group-id}/items/{item-id}`

**Content-Type:** `application/json` or `application/text`
**Request body:** JSON or String value.

> **_NOTE:_** The `item-id` is also know as the `key`. 

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

Item was upserted in KV store with database 123456, namespace languages, group countries, and key US.

```


### 7.  Read an item from an EdgeKV namespace
You can use the following API to read an item from EdgeKV. You need to specify the `namespace` and `group` this item belongs to. 

> **_NOTE:_** It can take up to 10 seconds or longer to read an item that has been recently written to EdgeKV. A `404 Not Found` response status code may be returned during that period. This is normal behavior for EdgeKV which is an eventually consistent database.

#### Endpoint:

To read an item:
`GET /edgekv/v1/networks/{network}/namespaces/{namespace-id}/groups/{group-id}/items/{item-id}`

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
### 8.  Delete an item from an EdgeKV namespace
You can use the following API to delete an item from EdgeKV. You need to specify the `namespace` and `group` this item belongs to. 

#### Endpoint:

To delete an item:
`DELETE /edgekv/v1/networks/{network}/namespaces/{namespace-id}/groups/{group-id}/items/{item-id}`

#### Example


```
$ http --print=hbHB --auth-type edgegrid -a default: DELETE :/edgekv/v1/networks/staging/namespaces/marketing/groups/languages/items/US
DELETE /edgekv/v1/networks/staging/namespaces/marketing/groups/languages/items/US
```
Response:
```
HTTP/1.1 200 OK

Item was delete in KV store with database 123456 namespace default group languages key US.
```

### 9.  List items within a group
You can list items in a group.

> **_NOTE:_** A maximum of 100 items can be returned.

#### Endpoint:

To list items in a group:
`GET /edgekv/v1/networks/{network}/namespaces/{namespace-id}/groups/{group-id}`

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

* 200 Success
* 201 Created
* 400 Bad Request
* 403 Unauthorized
* 404 Not Found
* 429 Too Many Requests
* 500 Internal Error
* 504 Gateway Timeout

> **_NOTE:_** You may get back `404 Not Found` when reading an item that has been written to EdgeKV, but that may not always be treated as an error due to the eventual consistency property of EdgeKV. You can read more about EdgeKV's eventual consistency model in the [EdgeKV Getting Started Guide](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html).

More details about a given error is provided in the response body JSON. 

Example (trying to request a namespace that does not exist):

```
$ http --auth-type edgegrid -a default: GET :/edgekv/v1/networks/staging/namespaces/bad_namespace
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
    "additionalDetail": {
        "detail": "Namespace is not found: bad_namespace",
        "instance": "/service/v1/
        
        s/5192145/namespaces/bad_namespace",
        "requestId": "5d424b9289ab9b43",
        "status": 404,
        "title": "NOT_FOUND"
    },
    "detail": "Unable to perform operation.",
    "instance": "2c82be29-f909-4d42-b775-de404e264fd9",
    "status": 404,
    "title": "Operation failed",
    "type": "https://problems.luna.akamaiapis.net/edgedb-api/operationFailed"
}
```

## Getting Help
Refer to [EdgeKV Getting Started Guide](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) for information on how to get help.

