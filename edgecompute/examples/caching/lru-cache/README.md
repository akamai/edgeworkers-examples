# lru-cache

*Keyword(s):* constructed-response, getting-started, cache <br>

*[Since](https://techdocs.akamai.com/edgeworkers/docs/lru-cache)* Nov 2, 2026

With this example you learn the basics of creating and deploying EdgeWorker that generates a simple html page at the Edge and uses built-in LRU cache module.

## Steps
1. Add blank Rule to delivery property called **LRU cache**
2. Add match condition for path /lru-cache
3. Add EdgeWorkers behaviour
4. Save the property
5. Create new EdgeWorker Identifier by clicking **EdgeWorkers Management application** in the behaviour note
6. Click the **Create Worker ID** button
7. Enter **LRU cache** in the Name field
8. Select the group you want the EdgeWorker to be available in
9. Click the **Create Worker ID** button
10. Click the newly created **ID** or **Name**
11. Click **Create Version** button
12. Click **Open editor** button
13. Paste `main.js` and `bundle.json` file contents from example.
14. Select the **Create Version** button.
15. Active the newly added version to staging/production from the action menu
16. Reload the property, select the newly created EdgeWorker
17. Save the property
18. Active the property to staging/production

## Example

    GET /lru-cache
    Host: mysite

    HTTP/1.1 200 OK
    Content-Type: text/html
    Content-Length: 70
    Date: Tue, 09 Jul 2024 09:15:47 GMT
    Connection: keep-alive

    <html><body><h1>Akamai EdgeWorkers - Native LRU</h1></body></html>

## More details on LRU cache module
- [LRU cache module](https://techdocs.akamai.com/edgeworkers/docs/lru-cache)

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
- [JavaScript troubleshooting](https://techdocs.akamai.com/edgeworkers/docs/about-javacript-troubleshooting)
