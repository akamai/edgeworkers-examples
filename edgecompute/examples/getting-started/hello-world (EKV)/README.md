# EdgeKV Hello World Example

## Copyright Notice

    (c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

## Overview

The Hello World example demonstrates how you can use EdgeWorkers and EdgeKV to implement a simple
Dynamic Content Assembly use case whereby the html response is dynamically constructed on the edge
based on the content of the Accept-Language header in the client request.

    TIP: If you are already familiar with the EdgeKV data model and do not plan to experiment with this code for now, 
         you can directly jump to the "Code Walkthrough" section. 

## Pre-requisites

Please ensure you fulfill the following pre-requisites before you execute this example:

* Get familiar with the EdgeKV data model (namespace, group, item). [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html)
* Create an EdgeWorker ID (EWID) and add it to your site's config in property manager. [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-F11192E1-0BFB-415F-88FA-5878C30B7D2A.html)
* Initialize your EdgeKV store [link to instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html). This step also creates the default namespace used in this example.
* Generate your management API/CLI client credentials. [link](https://developer.akamai.com/api/getting-started)
* If you intend to use the EdgeKV management API, refer to the latest instructions [here](https://github.com/akamai/edgeworkers-examples/tree/master/edgekv/apis)
* If you intend to use the EdgeKV Command Line Interface (CLI), make sure you have the latest version installed. [link to instructions](https://github.com/akamai/cli-edgeworkers/blob/master/docs/edgekv_cli.md)
* Generate EdgeKV Access Token for the default namespace. [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html)
* Download the following sample code. This constitutes the core of your EdgeWorker code bundle for this example.
```
% git clone https://github.com/akamai/edgeworkers-examples.git
Cloning into 'edgeworkers-examples'...
... done.
% cd edgeworkers-examples/edgekv/examples/hello-world
```
* Update the `edgekv_tokens.js` file in your EdgeWorker code bundle directory. [link to instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html)
* Download the latest [edgekv.js](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js) library file and copy it to your EdgeWorker bundle directory.

## Getting to work

### Prelude
We will be using the `"default"` namespace and organizing our items in a group named `"greetings"`.

The key used for each item will be the lower case language code for each greeting.

### Seeding the KV Store
You need to add some items to your EdgeKV store before you execute your logic. 

The following are some examples you could use. The full EdgeKV OPENAPI specification can be found [here](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/apis/readme.md).

To add the various language specific greetings to your EdgeKV store via the management API, use:

```
METHOD | ENDPOINT                                             | Data
------ | -----------------------------------------------------| -----------------
PUT    | /api/v1/namespaces/default/groups/greetings/items/en | "Hello World"
PUT    | /api/v1/namespaces/default/groups/greetings/items/fr | "Bonjour le Monde"
PUT    | /api/v1/namespaces/default/groups/greetings/items/es | "Hola Mundo"

```

or via the CLI:

```
% akamai edgekv write text staging default greetings en "Hello World" 
% akamai edgekv write text staging default greetings fr "Bonjour le Monde" 
% akamai edgekv write text staging default greetings es "Hola Mundo"
```

    Note: Due to the eventual consistency properties of the EdgeKV store, 
          your data update may take up to 10 seconds to be reflected in the response of a subsequent GET request.

### Verifying data in your EdgeKV store

To retrieve the various language specific greetings from your EdgeKV store via the management API, use:

```
METHOD | ENDPOINT                                             
------ | ----------------------------------------------------
GET    | /api/v1/namespaces/default/groups/greetings/items/en
GET    | /api/v1/namespaces/default/groups/greetings/items/fr
GET    | /api/v1/namespaces/default/groups/greetings/items/es

```

or via the CLI:

```
% akamai edgekv read item staging default greetings en
% akamai edgekv read item staging default greetings fr
% akamai edgekv read item staging default greetings es
```

### Delete data in your KV Store

To delete the various language specific greetings from your kv store via the management API, use:

```
METHOD | ENDPOINT                                             
------ | ----------------------------------------------------
DELETE | /api/v1/namespaces/default/groups/greetings/items/en
DELETE | /api/v1/namespaces/default/groups/greetings/items/fr
DELETE | /api/v1/namespaces/default/groups/greetings/items/es

```

or via the CLI:

```
% akamai edgekv delete item staging default greetings en
% akamai edgekv delete item staging default greetings fr
% akamai edgekv delete item staging default greetings es
```

    Note: Due to the eventual consistency properties of the EdgeKV store, 
          your deleted data may take up to 10 seconds to be reflected in the response of a subsequent GET request.

### Update & Activate your EdgeWorkers code

1. Create a tarball of your EdgeWorker bundle (do not forget to update the version info in your `bundle.json` before creating the tarball)

```
tar czvf ekv_hello_world.tgz bundle.json edgekv.js edgekv_tokens.js main.js
```

2. Upload your code bundle and activate your EWID. [link to EdgeWorker instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-430E06BE-81C9-4F26-ABB7-C1FD2BAC7497.html)

3. Wait for activation to complete, then proceed to "Try it all out". [link to EdgeWorker instructions](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-430E06BE-81C9-4F26-ABB7-C1FD2BAC7497.html)


### Try it all out

Let's assume you added a behavior containing the EWID associated with this example to 
your Akamai property under a match condition for path `http://mysite.com/helloworld`.

Note: mysite.com is not an actual site used for this example. Please replace with your own site domain.

You can test this out using the following curl command:

```
% curl -s -H "Accept-Language: fr" http://mysite.com/helloworld

<!DOCTYPE html><html lang="fr" xml:lang="fr"><head><meta charset="UTF-8"></head>
<body><H1>Bonjour le Monde</H1></body>
```

Replace "fr" with your desired language key to get different results. e.g.

```
% curl -s -H "Accept-Language: es" http://mysite.com/helloworld

<!DOCTYPE html><html lang="es" xml:lang="es"><head><meta charset="UTF-8"></head>
<body><H1>Hola Mundo</H1></body>
```

### Debugging Errors

If you get an error or an unexpected result, you may want to debug this further. 

For example, let's assume you had the wrong access token included in your bundle. 
Let's set curl to verbose mode to see what is going on:

```
curl -sv -H "Accept-Language: en" http://mysite.com/helloworld

...
< X-EKV-ERROR: FAILED GET TEXT: 401   error :  jwt-invalid_format- 0.138edc43.1600717081.5496ef
...

```
Note that the `X-EKV-ERROR` response header we added in our example code 
is indicating that our getText() call returned a 401 due to an invalid token.

For more information on the various EdgeKV errors, see the following [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html).

## Code Walkthrough

Let's break down the implementation of this example. 

If we look at `main.js`, we will notice the following code snippet at the bottom:
```
export async function responseProvider(request) {
    return hello_world_response(request)
}
```
This implements the `Response Provider` EdgeWorker event handler which acts as a surrogate origin. 
In essence, it is dynamically constructing the html response in this example. Note that this is implemented as an async function.
For more information about the EdgeWorker `Response Provider` event handler and EdgeWorker async support, refer to [link](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-4CC14D7E-D92D-4F2D-9292-17F8BE6E2DAE.html).

The functionality of our example is implemented in the `hello_world_response()` function which is also declared as async and takes the `request` object as a parameter:
```
async function hello_world_response(request) {...}
```

The first thing we do in this function is that we declare a bunch of default values to use in the following code block:
```
    let default_greeting = "Hello World";
    let language = "en";
    let content_lang = "en-US";
    let greeting = "";
    let err_msg = ""
```
Note that for simplicity, we decided in this example that whenever we do not have the requested language in the EdgeKV store, 
we will return the `defaut_greeting` above instead of a 404 or some other error. 

The next code block is retrieving the language key from the `Accept-Language` request header. 

```
    let languages = request.getHeader('Accept-Language');
    if (languages && languages[0]) {
        content_lang = languages[0].split(',')[0];
        language = content_lang.split('-')[0];
    }
    let key = language.toLowerCase();
```

For simplicity, only the first Accept-Language header encountered is used as key 
to retrieve the corresponding language specific greeting from EdgeKV. A real `Accept-Language` request header
sent by a browser would look something like:

```
Accept-Language: es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6,fr-CA;q=0.5,fr;q=0.4
```
 
So the code above would first extract `es-US` then the key `es` from that. 
We transform it to lower case because we used lower case keys when we seeded our EdgeKV store.

The next code snippet is initializing our EdgeKV object by calling the constructor and passing the namespace and group.
```
const edgeKv = new EdgeKV({namespace: "default", group: "greetings"});
```

This makes it convenient for us so that when we invoke the various EdgeKV methods, we do not need to repeat the namespace and group parameters. We can always override those in each method invocation though if we wanted. Refer to [edgekv.js readme](https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/readme.md) for detailed information about the various EdgeKV library interfaces.

The next code block retrieves the item from the EdgeKV store 
```
    try {
          greeting = await edgeKv.getText({ item: key, 
                                          default_value: default_greeting });
        }
    } catch (error) {
        err_msg = error.toString();
        greeting = default_greeting;
    }
```

Let's first focus on the following snippet:
```
greeting = await edgeKv.getText({ item: key, default_value: default_greeting });
```

This is essentially pending until the item whose key is `key` (i.e. language as seen before) is retrieved from the EdgeKV store.
This is an asynchronous non-blocking call that utilizes the EdgeWorker asynchronous `httpRequest` capability which is described in details [here](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-D580F321-9124-4D2F-BB02-D8D81E88A461.html?hl=httprequest) to retrieve the item from EdgeKV.

The execution of our program resumes when the `httpRequest` is fulfilled either successfully or not. Let's first discuss the success case.

If the `httpRequest` returns with a 200 OK response from the EdgeKV store, meaning we successfully were able to retrieve the item, the item value would be returned and assigned to `greeting`.

Next let's explore unsuccessful cases. If the item is not the EdgeKV store (which is technically not a failure since it may not have been yet available due to the eventual consistency properties of EdgeKV as described earlier), the underlying `httpRequest` to EdgeKV would have returned a 404, and the `getText()` call would in that case return the specified `default_value`, in this case the value of `default_greeting`. Had we not specified a `default_value` in this case, a `null` would have been returned and we would have had to handle it appropriately. However in this example, we are guaranteed to have a non-null value assigned to `greeting`.

The last case is if we hit an execution error or the underlying `httpRequest` to EdgeKV returns an error status other than 404. In that case, the `getText()` method would throw an exception. This is the reason we have a try/catch block so that we can catch that exception. In this example, we decide to capture the error string associated with the exception in `err_msg` and set the `greeting` to the value of `default_greeting` for the same reason discussed above.

Because we catch the exception, the execution of our handler will continue regardless of the results of `getText` with `greeting` being set to a valid value (either the value retrieved from EdgeKV or the value of `default_greeting`). 

The next code block is constructing a simple html response using the `greeting` and `language`:
```
    let html_body = '<!DOCTYPE html> \
                     <html lang="'+ language + '" xml:lang="' + language +'"> \
                     <head> \
                       <meta charset="UTF-8"> \
                     </head> \
                     <body><H1>' + greeting + '</H1></body>';
```

The code block after that is constructing the response.
```
    let response = {status: 200, 
                    headers: 
                      {'Content-Type': ['text/html'], 
                       'Content-Language': [content_lang],
                       'X-EKV-ERROR': [encodeURI(err_msg).replace(/(%20|%0A|%7B|%22|%7D)/g, " ")]
                      },
                    body: html_body};
```
It sets the status to 200 (as mentioned earlier, for this example we always return a successful greeting regardless of execution status). We also add a couple of response headers to make the response more meaningful to browsers. We also return an `X-EKV-ERROR` which captures the error string we got back in case `getText` threw an exception. We described this in the `Debugging Errors` section before.
Note that we URI-encode the error message since it may contain characters that are not safe for use in an html header, and we replace some encodings with space to improve readability. We also set the html_body to the one constructed above.

The last code block is the one constructing the response with the aforementioned status, headers and body using the EdgeWorker `createResponse` function described [here](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-554B90F6-FA61-4A0A-9612-B83B39B5B76D.html?hl=createresponse).
```
    return createResponse(response.status,
                          response.headers,
                          response.body);
```

This wraps up the whole example.


### Additional Suggestions 

As a next step, you may want to improve the code in this example so that it tries the next language in the 
`Accept-Language` header if the previous one was not found in the EdgeKV store. 

Think of how you may modify the code to achieve that.

Have fun coding :-).

## Getting Help or Providing Feedback
If you run into issue, need additional assistance, or would otherwise like to provide feedback,
please check out the [Reporting Issues section](https://github.com/akamai/edgeworkers-examples/#Reporting-Issues) 
on the main repo page.


