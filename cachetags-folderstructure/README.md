This EdgeWorker dynamically sets [cache tags](https://learn.akamai.com/en-us/webhelp/fast-purge/fast-purge/GUID-64272BAE-BCB0-4F84-BA5A-8A21549A347D.html) based on the folder structure of the requested object.


## Example

Requested resource:

```javascript
/static/js/external/geo/demo.js?v=12345
```
Extracted cache tags:
```javascript
p-static
p-static|js
p-static|js|external
p-static|js|external|geo
p-static|js|external|geo|demo.js
```
Response header added on origin response
```
Edge-Cache-Tag: p-static,p-static|js,p-static|js|external,p-static|js|external|geo,p-static|js|external|geo|demo.js
```

## Configuration options:

the sample code allow you to configure a prefix as well as a separator between 2 levels
```javascript
cacheTagPrefix='p--';
cacheTagFolderSeparator='|';
```
