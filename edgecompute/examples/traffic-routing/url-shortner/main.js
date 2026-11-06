/*
(c) Copyright 2022 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.5
Purpose:  Using EdgeWorkers and EdgeKV, manage a list of shortened URLs and serve redirects for them
*/

import URLSearchParams from 'url-search-params';  
import { logger } from 'log';
import { EdgeKV } from './edgekv.js';
import { createResponse } from 'create-response';

export async function responseProvider (request) {
  // Set Up EdgeKV
  const edgeKv = new EdgeKV({namespace: "url-shortener", group: "links"});

  // Request path
  const path = request.path;

  // If the request path contains /r/ then we are serving a redirect
  if (path.split('/')[1] === 'r') {
    let key = path.split('/')[2];
    
    // Retrieve a redirect URL associated with the key
    let redirectUrl;
    try {
        redirectUrl = await edgeKv.getText({ item: key, default_value: undefined });
        logger.log('checking ID ' + key + ".  EdgeKV contained: "+ redirectUrl );
    } catch (error) {        
        logger.log("Error serving redirect: " + error);         
    }    

    // If the redirect exists, return a 302 response.  Otherwise server a 404 error
    if (redirectUrl != undefined && redirectUrl != null) {
      return Promise.resolve(createResponse(302, {'Location': [redirectUrl] }, '')); 
    } else {
      return Promise.resolve(createResponse(404, {'Content-Type': ['text/html'] }, '<html><body>Redirect not found</body></html>')); 
    }
  } 

// If the request path contains /m/ then we are managing redirects
if (path.split('/')[1] === 'm') {
  var params = new URLSearchParams(request.query);
  var name = params.get('name');
  var url = params.get('url');
  var status; 
  var body;  
  var checkID;
  
  // Supported operations are 'add', 'update' and 'delete'
  switch (params.get('op')) {
    case 'add':
      // If a custom redirect name was not defined, then randomly create a name to use as the key
      if (name === undefined || name === null) {
        name = Math.random().toString(36).substr(2, 10);
      }

      // Add redirect to EKV
      try {
        checkID = await edgeKv.getText({ item: name, default_value: undefined });

        if(checkID != undefined) {
          status = "Error - Redirect already exists for /r/" + name;  
          body = '<b>' + status + '<b><br>';
          logger.log(status);
        } else {
          await edgeKv.putText({ item: name, value: url });
          status = "Redirect Successfully added";
          body = '<b>' + status + '<b><br> \
            <p>URL: <a href="https://' +request.host + '/r/' + name + ' ">https://' +request.host + '/r/' + name +'</a></p>\
            <p>Redirects to: <a href=" ' + url + ' ">' + url +'</a></p>'; 
        }
      } catch (error) {        
        status = "error creating redirect";        
        body = '<b>' + status + '<b><br>';
        logger.log(status);
      }
  
      return Promise.resolve(createResponse(200, {'Content-Type': ['text/html'] }, '<html><body>' + body + '</body></html>'));
      break;
      
    case 'update':
      if (name === undefined || url === undefined || name === null || url === null) {
        status = "error - missing name or url";
      }

      try {
        // Check to see if the redirect exists before we attempt to delete it
        checkID = await edgeKv.getText({ item: name, default_value: undefined });
        if(checkID != undefined) {
          // Update redirect
       		await edgeKv.putText({ item: name, value: url });
          status = "Redirect Successfully Updated"
          body = '<b>' + status + '<b><br>\
          <p>URL: <a href="https://' +request.host + '/r/' + name + ' ">https://' +request.host + '/r/' + name +'</a></p>\
          <p>Redirects to: <a href=" ' + url + ' ">' + url +'</a></p>';
          
        } else {
          // Redirect doesn't exist
          status = "Error - Redirect doesn't exist for /r/" + name; 
          body = '<b>' + status + '<b><br>';
          logger.log(status); 
        }
      } catch (error) {        
        status = "Error updating redirect: " + error;
        body = '<b>' + status + '<b><br>';
        logger.log(status); 
      }

      return Promise.resolve(createResponse(200, {'Content-Type': ['text/html'] }, '<html><body>' + body + '</body></html>'));			
      break;
      
    case 'delete':
      if (name === undefined || name === null) {
        status = "error - missing name";
        body = '<b>' + status + '<b><br>';
      }

      try {
        // Check to see if the redirect exists before we attempt to delete it
        checkID = await edgeKv.getText({ item: name, default_value: undefined });

        if(checkID != undefined) {
          // Delete redirect
          await edgeKv.delete({item:  name});
          status = "Redirect Successfully Deleted"          
          body = '<b>' + status + '<b><br>\<p><a href="https://' +request.host + '/r/' + name + ' ">https://' +request.host + '/r/' + name +'</a></p>'; 
        } else {
          // Redirect doesn't exist
          status = "Error - Redirect doesn't exist for /r/" + name;  
          body = '<b>' + status + '<b><br>';
        }
      } catch (error) {        
        status = "Error deleting redirect " + error;
        body = '<b>' + status + '<b><br>';
        logger.log(status);
      }

      return Promise.resolve(createResponse(200,  {'Content-Type': ['text/html'] }, '<html><body>' + body + '</body></html>'));          
      break;

    case 'default':
      return Promise.resolve(createResponse(404, {'Content-Type': ['text/html'] }, '<html><body>Error - invalid operation</body></html>')); 
      break;
    }    
  } 
}
