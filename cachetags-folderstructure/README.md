This EdgeWorker dynamically sets Cache-Tags based on the folder structure of the requested object.


## Example

Requested resource:

```javascript
/static/js/external/geo/demo.js?v=12345

Extracted cache tags:
```javascript
p-static
p-static|js
p-static|js|external
p-static|js|external|geo
p-static|js|external|geo|demo.js

Response header added on origin response
**Edge-Cache-Tag: p-static,p-static|js,p-static|js|external,p-static|js|external|geo,p-static|js|external|geo|demo.js

## Configuration options:

the sample code allow you to configure a prefix as well as a separator between 2 levels
```javascript
cacheTagPrefix='p--';
cacheTagFolderSeparator='|';
