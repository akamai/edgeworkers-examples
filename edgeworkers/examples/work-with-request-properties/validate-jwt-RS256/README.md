# validate-jwt-HS256

*Keyword(s):* JWT, json web token, auth<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements JWT ([JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token)) validation against an incoming request with an HS256-signed jwt, then sets an outgoing request header determined by the contents and validity of the JWT.

## Requirements

### Two PMUSER variables are required as below:

```
"variables": [
    {
        "description": "Bool: if incoming request has valid JWT for an enhanced experience",
        "hidden": false,
        "name": "PMUSER_ENHANCED_EXPERIENCE",
        "sensitive": false,
        "value": ""
    },
    {
        "description": "Text: reason for non-enhanced experience if PMUSER_ENHANCED_EXPERIENCE is false",
        "hidden": false,
        "name": "PMUSER_ENHANCED_REASON",
        "sensitive": false,
        "value": ""
    }
]
```

## Usage

### 1. Generate a signed JWT

Create a JSON Web Token with the following contents at a minimium. Online tools such as [jwt.io](https://jwt.io/) may be useful.

*HEADER*

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

*PAYLOAD*

```json
{
  "iss": "Akamai JWT Demo",
  "iat": 1616596024,
  "exp": 1648132024,
  "aud": "www.akamai.com",
  "sub": "demo@akamai.com",
  "Role": "enhanced"
}
```
(be sure to update the `iat` and `exp` values for when the token was issued and should expire!)

Use the secret key `qwertyuiopasdfghjklzxcvbnm123456` and HS256 to sign it and generate an encoded token. It should look like:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBa2FtYWkgSldUIERlbW8iLCJpYXQiOjE2MTY1OTYwMjQsImV4cCI6MTY0ODEzMjAyNCwiYXVkIjoid3d3LmFrYW1haS5jb20iLCJzdWIiOiJkZW1vQGFrYW1haS5jb20iLCJSb2xlIjoiZW5oYW5jZWQifQ.0YZYMhoOU8WRZVo8ZCy8Ok7D8w-D46fR6NV5ox9yvmg
```

You can paste this in to [jwt.io](https://jwt.io/) to validate it.

### 2. Add the EdgeWorker to a configuration

Follow the [standard instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-66EF9516-D64C-4C7B-9919-354496D29389.html#GUID-66EF9516-D64C-4C7B-9919-354496D29389) to add this edgeworker to a configuration. [Akamai Sandbox](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-ECA2B985-1AE7-4B47-A128-97203D6929D5.html#GUID-ECA2B985-1AE7-4B47-A128-97203D6929D5) makes development and test quick and simple.

### 3. Send a request to the EdgeWorker

The curl command below will add the encoded JWT string above as a request header. Modify the request to match your EdgeWorker behaviour in the configuration. In this case the EdgeWorker is matched on the `/jwt` path. The response should return a simple string with the result of the JWT validation.

```
curl --insecure --location --request GET 'https://localhost:9550/jwt' \
--header 'x-jwt: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBa2FtYWkgSldUIERlbW8iLCJpYXQiOjE2MTY1OTYwMjQsImV4cCI6MTY0ODEzMjAyNCwiYXVkIjoid3d3LmFrYW1haS5jb20iLCJzdWIiOiJkZW1vQGFrYW1haS5jb20iLCJSb2xlIjoiZW5oYW5jZWQifQ.0YZYMhoOU8WRZVo8ZCy8Ok7D8w-D46fR6NV5ox9yvmg'
```
`Enhanced: true. Reason: no reason.`

You can change the signature element of the encoded JWT (the characters after the last period) to invalidate it:

```
curl --insecure --location --request GET 'https://localhost:9550/jwt' \
--header 'x-jwt: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBa2FtYWkgSldUIERlbW8iLCJpYXQiOjE2MTY1OTYwMjQsImV4cCI6MTY0ODEzMjAyNCwiYXVkIjoid3d3LmFrYW1haS5jb20iLCJzdWIiOiJkZW1vQGFrYW1haS5jb20iLCJSb2xlIjoiZW5oYW5jZWQifQ.0YZYMhoOU8WRZVo8ZCy8Ok7D8w-D46fR6NV5ox9yvmh'
```
`Enhanced: false. Reason: signature mismatch.`

Follow the [enhanced debugging instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-F888493F-6186-4400-89B4-0AEDF872DFC9.html) if you encounter any errors.
