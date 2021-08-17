/*
(c) Copyright 2021 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 1.1
Purpose:  Shows Forward request headers via responseProvider
Repo: 
Notes: If query param: getForwardHeaders=body exists, it will output all the headers as the response body instead
of the original body. Else it outputs them as response headers with a prefix: x-fwd-
*/
// import { logger } from 'log'; // Import the logger module
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from 'url-search-params';


/* 
Construct entire response body to include request and response headers
*/
function constructResponseBody(request,response){
	let responseBody = "<html><body><h2>Request Headers:</h2><br>";

	// Get Request headers and append to response body
	Object.keys(request.getHeaders()).forEach((key) => {
		request.getHeaders()[key].forEach((headerval) => {
			responseBody += key + ": " + headerval + " <br>";
		});
	});
	
	responseBody += "<br><h2>Response Headers:</h2><br>";
	
	// Get Response headers and append to response body
	Object.keys(response.getHeaders()).forEach((key) => {
		response.getHeaders()[key].forEach((headerval) => {
			responseBody += key + ": " + headerval + " <br>";
		});
	});
	
	responseBody += "</body></html>";
	return responseBody;
}


/* 
Construct response headers by adding request headers prepended by x-fwd-
*/

function constructResponseHeaders(request, response){

	var finalHeaders = response.getHeaders();//header array we'll eventually print, plus our own
	
	if (!finalHeaders) {
		finalHeaders = {}
	}
	//We look at all the request headers, and for each, we prepend x-fwd- and add them to the response headers array
	Object.keys(request.getHeaders()).forEach((headerName) => {
		const valuesForHeaderName = request.getHeaders()[headerName];
		var newHeaderName = 'x-fwd-' + headerName;
		finalHeaders[newHeaderName] = [];
		valuesForHeaderName.forEach((headerVal) => {
			finalHeaders[newHeaderName].push(headerVal);
		});
	});

	return finalHeaders;
}

/* 
Determines if query parameter getForwardHeaders=body exists. If exists, returns all headers in a constructed 
response body. Else, it returns request headers in the response headers, prepended by x-fwd-
*/
function returnInBody(request){
	const queryParamName = 'getForwardHeaders';
	const params = new URLSearchParams(request.query);
	const paramValue = params.get(queryParamName);
	if (paramValue) {
		if (paramValue == "body") {
			return true;
		}
	}
	return false;
}

export function responseProvider (request) {
	const options = {}
	
	options.method = request.method;
	options.headers = request.getHeaders();
	delete options.headers["pragma"];
	delete options.headers["accept-encoding"];
	
	const reqUrl = request.scheme + '://' + request.host + request.url;
	let hdrs = request.getHeaders();
	return httpRequest(`${reqUrl}`, options).then(response => {
		if (returnInBody(request)){
			return createResponse(
				response.status,
				response.headers,
				constructResponseBody(request, response)
				);
		}else{
			return createResponse(
				response.status,
				constructResponseHeaders(request, response),
				response.body
				);
		}
	});

}
