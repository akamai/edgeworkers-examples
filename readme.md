This EdgeWorker dynamically sets Cache-Tags based on the folder structure of the requested object.


eg. Grab the path /static/js/external/geo/scm-main.js and onOriginResponse the request.path 
/static/js/*
/static/js/external/*
/static/js/external/geo/*

Configuration options: the sample code allow you to configure a prefix as well as a separator between 2 levels
cacheTagPrefix='p--';
cacheTagFolderSeparator='|';


Example:

Requested resource:
/static/js/external/geo/demo.js?v=12345

Extracted cache tags:
p-static
p-static|js
p-static|js|external
p-static|js|external|geo
p-static|js|external|geo|demo.js

Response header added on origin response
Edge-Cache-Tag: p-static,p-static|js,p-static|js|external,p-static|js|external|geo,p-static|js|external|geo|demo.js


