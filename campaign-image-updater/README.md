# Campaign Image Updater

This example shows how to leverage EdgeWorkers, EdgeKV and Akamai Image and Video Manager to apply transformations to the images in a HTML page. The example is built to apply the transformations to all images in the page, but the code can easily be modified to apply only to the right set.

In short, what this EdgeWorker does is:
* Look for a value in EdgeKV (this value corresponds to the command with the transformations to apply to images)
* If the value exists, parse the HTML looking for all the images and add the previous command as a querystring

In order for this Edgeworker to work, there are some requirements:
- The HTML is delivered by [Akamai](https://www.akamai.com/)
- [Image and Video Manager](https://developer.akamai.com/akamai-image-and-video-manager) is enabled in the delivery configuration
- [imQuery](https://learn.akamai.com/en-us/webhelp/image-manager/image-optimization/GUID-DD5DFAF4-2D9F-4F50-A99C-D4218D1A1737.html) is enabled in the Image and Video Manager policy applying to the delivery configuration
- EdgeKV library has to be added to the code bundle. Specifically two files need to be added: __edgekv.js__ and __edgekv_tokens.js__. Instructions [here](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html) and [here](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-getting-started-guide/index.html).
- To update EdgeKV you can use the [API](https://developer.akamai.com/api/web_performance/edgeworkers/v1.html) and also [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
