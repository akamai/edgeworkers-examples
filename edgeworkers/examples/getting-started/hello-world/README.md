# hello-world

*Keyword(s):* constructed-response, add-header, getting-started, logging, secure-trace-headers, trace-headers<br>

*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

With this example you learn the basics of creating, deploying and debugging an EdgeWorker that generates a simple html page at the Edge and adds a response header. 

## Steps
1. Use the [EdgeWorkers CLI](https://developer.akamai.com/cli/packages/edgeworkers.html) command to generate a secret key

   `akamai edgeworkers secret`

   Here’s an example of a secret key (this token is an example and should not be used in your user-defined variable or to generate an authentication token):

   `fef77a483a6dd85b45a6c5092f1c178a6eaf21e56a3b69195e33f53070eec669`

2. Add a user-defined variable named, **EW_DEBUG_KEY** to your property.
3. Enter the secret key you created in Step 1 into the Initial Value column of the user-defined variable.

    ![alt text](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-ABA87948-098E-4571-A001-7BC6F3E20381-low.png "Setting Property Variables")
   * You'll also re-use this secret key, when using the [EdgeWorkers CLI](https://developer.akamai.com/cli/packages/edgeworkers.html) to generate the authentication token for debugging.
4. Add blank Rule to delivery property called **Hello World**
5. Add match condition for path /hello-world
6. Add EdgeWorkers behaviour
7. Save the property
8. Create new EdgeWorker Identifier by clicking **EdgeWorkers Management application** in the behaviour note
9. Click the **Create Worker ID** button
10. Enter **Hello World** in the Name field 
11. Select the group you want the EdgeWorker to be available in
12. Click the **Create Worker ID** button
13. Click the newly created **ID** or **Name**
14. Click **Create Version** button
15. Drag and Drop or Select the hello-world.tgz file 
16. Select the **Create Version** button.
17. Active the newly added version to staging/production from the action menu
18. Reload the property, select the newly created EdgeWorker
19. Save the property
20. Active the property to staging/production 
21. Use the secret key you created in Step 1 to generate an authentication token using this [EdgeWorkers CLI](https://developer.akamai.com/cli/packages/edgeworkers.html) command.   
    ```
    $ akamai edgeworkers auth fef77a483a6dd85b45a6c5092f1c178a6eaf21e56a3b69195e33f53070eec669
      ---------------------------------------------------------------------------------------------------------------------------   
      Add the following request header to your requests to get additional trace information.
      Akamai-EW-Trace: st=1603897978~exp=1603899778~acl=/*~hmac=090513d88251d13ceae6dd4d35504498f1ea59c9d081fe8f86ffcf01361cf53f
      ---------------------------------------------------------------------------------------------------------------------------```
22. To have debug and logging response headers returned add two headers to the request. See [Enhanced debug headers](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-F888493F-6186-4400-89B4-0AEDF872DFC9.html) for more information.
    * a Pragma header with a value of akamai-x-ew-debug `Pragma: akamai-x-ew-debug`
    * The Akamai-EW-Trace header created in Step 21 `Akamai-EW-Trace: st=1603897978~exp=1603899778~acl=/*~hmac=090513d88251d13ceae6dd4d35504498f1ea59c9d081fe8f86ffcf01361cf53f`
## Example

    GET /hello-world
    Host: mysite
    Pragma: akamai-x-ew-debug
    Akamai-EW-Trace: st=1603897978~exp=1603899778~acl=/*~hmac=090513d88251d13ceae6dd4d35504498f1ea59c9d081fe8f86ffcf01361cf53f
    
    HTTP/1.1 200 OK
    Content-Type: text/html
    Content-Length: 70
    Cache-Control: private, max-age=0
    Expires: Wed, 28 Oct 2020 15:46:32 GMT
    Date: Wed, 28 Oct 2020 15:46:32 GMT
    Connection: keep-alive
    X-Akamai-EdgeWorker-onClientResponse-Log: D:main.js:22 Adding a header in ClientResponse
    X-Akamai-EdgeWorker-onClientResponse-Info: ew=[EdgeWoker ID] v1:Hello World; status=Success; status_msg=-; wall_time=0.2; cpu_time=0.194
    X-Akamai-EdgeWorker-onClientRequest-Log: D:main.js:14 Responding with hello world from the path: /hello-world
    X-Akamai-EdgeWorker-onClientRequest-Info: ew=[EdgeWoker ID] v1:Hello World; status=Success; status_msg=-; wall_time=0.226; cpu_time=0.211
    X-Hello-World: From Akamai EdgeWorkers
    
    <html><body><h1>Hello World From Akamai EdgeWorkers</h1></body></html>
    
## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
