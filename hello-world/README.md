# hello-world

*Keyword(s):* constructed-response, add-header, getting-started<br>

*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

With this example you learn the basics of creating and deploying an EdgeWorker that generates a simple html page at the Edge and adds a response header. 

## Steps
1. Add blank Rule to delivery property called **Hello World**
2. Add match condition for path /hello-world
3. Add EdgeWorkers behaviour
4. Save the property
5. Create new EdgeWorker Identifier by clicking **here** in the behaviour
6. Click the **Create Worker ID** button
7. Enter **Hello World** in the Name field 
8. Select the group you want the EdgeWorker to be available in
9. Click the newly create ID or Name
10. Click **Create Version** button
11. Drag n Drop/Select the hello-world.tgz file 
12. Select the **Create Version** button.
13. Active the newly added version to staging/production from the action menu
14. Reload the property, select the newly created EdgeWorker
15. Save the property
16. Active the property to staging/production 

## Examples

    GET /hello-world
    Host: mysite
    
    
    <html><body><h1>Hello World From Akamai EdgeWorkers</h1></body></html>
    
    HTTP/1.1 200 OK
    X-Hello-World: From Akamai EdgeWorkers

    
## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
