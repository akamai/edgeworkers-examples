# log-delivery

*Keyword(s):* constructed-response, getting-started, logging, DataStream2 <br>

*[Since](hhttps://techdocs.akamai.com/edgeworkers/changelog/deliver-javascript-logs-via-datastream-2)* Jul 9, 2024

With this example you learn the basics of creating, deploying and debugging an EdgeWorker that generates a simple html page at the Edge and generates logs that can be streamed to chosen destination.

## Steps
1. Follow the [tutorial](https://techdocs.akamai.com/edgeworkers/docs/ds2-javascript-logging) to generate new stream, that will be used to deliver edge-generated logs.

   Additional information is also available in [EdgeWorkers DataStream2 integration page](https://techdocs.akamai.com/edgeworkers/docs/datastream-2-integration)

2. Add blank Rule to delivery property called **Log Delivery**
3. Add match condition for path /log-delivery
4. Add EdgeWorkers behaviour
5. Save the property
6. Create new EdgeWorker Identifier by clicking **EdgeWorkers Management application** in the behaviour note
7. Click the **Create Worker ID** button
8. Enter **Log Delivery** in the Name field
9. Select the group you want the EdgeWorker to be available in
10. Click the **Create Worker ID** button
11. Click the newly created **ID** or **Name**
12. Click **Create Version** button
13. Click **Open editor** button
14. Paste `main.js` and `bundle.json` file contents from example.
15. Insert DataStream2 identifier as `ds2id` field value in `bundle.json` file. This wil tie produced logs with configured DS2 stream.
14. Select the **Create Version** button.
15. Active the newly added version to staging/production from the action menu
18. Reload the property, select the newly created EdgeWorker
19. Save the property
20. Active the property to staging/production
## Example

    GET /log-delivery
    Host: mysite

    HTTP/1.1 200 OK
    Content-Type: text/html
    Content-Length: 70
    Date: Tue, 09 Jul 2024 09:15:47 GMT
    Connection: keep-alive

    <html><body><h1>Hello World From Akamai EdgeWorkers</h1></body></html>

## More details on logging and log delivery
- [Built-in log module documentation](https://techdocs.akamai.com/edgeworkers/docs/log)
- [DataStream2 logging details](https://techdocs.akamai.com/edgeworkers/docs/javascript-logging-details#data-stream-2-javascript-logging-details)
- [Log delivery limits](https://techdocs.akamai.com/edgeworkers/docs/limitations#limits-for-javascript-logs-delivered-via-datastream-2)

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
- [JavaScript troubleshooting](https://techdocs.akamai.com/edgeworkers/docs/about-javacript-troubleshooting)
