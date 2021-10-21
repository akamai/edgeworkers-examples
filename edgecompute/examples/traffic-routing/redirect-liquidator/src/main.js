import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { FindAndReplaceStream } from 'find-replace-stream.js';

const REDIRECT_CODES=[301,302,303,307,308];
const INJECT_AFTER_TAG = '</title>';
const UNSAFE_RESPONSE_HEADERS=['content-length', 'transfer-encoding', 'connection', 'vary',
'accept-encoding', 'content-encoding', 'keep-alive',
'proxy-authenticate', 'proxy-authorization', 'te', 'trailers',
'transfer-encoding', 'upgrade'];

export function responseProvider (request) {
  //Manage and calculate your Edge redirects without going to the origin. (Optional)
  const NEW_URL = getRedirectLocationFromEdge(request);

  //Edge Redirect Logic detected, forward request to the new location.
  if(request.url != NEW_URL){
    return sendRecursiveOriginRequest(request.scheme,request.host,NEW_URL,true);
  }
  //No Edge redirect logic detected, requesting original URL and chasing redirects if they occur.
  else{
      return sendRecursiveOriginRequest(request.scheme,request.host,request.url,false);
  }
}

//Recursively send request to the origin until all redirects are resolved.
function sendRecursiveOriginRequest(scheme,host,url,enableLiquidation){
    return httpRequest(`${scheme}://${host}${url}`).then(response => {

        //Origin sent a redirect HTTP response status
        if(REDIRECT_CODES.includes(response.status)){
            let headers = response.getHeaders();
            let locationHeader=headers["location"][0];
            //Only chase the redirect when the location is on the same host and scheme.
            if(locationHeader.startsWith(`${scheme}://${host}`)){
                return sendRecursiveOriginRequest(scheme,host,locationHeader.replace(`${scheme}://${host}`,""),true);
            }
            else{
                return sendOriginResponseAsIs(response);
            }
        }
        //A redirect was previously detected and enableLiquidation turned on. The origin response body should be modified
        else if(enableLiquidation){
            const HISTORY_REPLACE_STATE = INJECT_AFTER_TAG+'<script>history.replaceState("","","'+url+'");</script>';
            return createResponse(
                response.status,
                getSafeResponseHeaders(response.getHeaders()),
                response.body
                    .pipeThrough(new TextDecoderStream())
                    .pipeThrough(new FindAndReplaceStream(INJECT_AFTER_TAG, HISTORY_REPLACE_STATE, 1))
                    .pipeThrough(new TextEncoderStream())
            );
        }
        //Nothing to do, sending the origin response as is
        else{
            return sendOriginResponseAsIs(response);
        }
      });
}

//Send origin response as is without modifying the response body
function sendOriginResponseAsIs(response){
    return createResponse(
        response.status,
        getSafeResponseHeaders(response.getHeaders()),
        response.body
      );
}

//A hook to implement redirect logic at the Edge. Either hardcoded or better via an API or EKV lookup.
function getRedirectLocationFromEdge(request){
    if(request.path.startsWith('/faq.php')){
        return request.url.replace('/faq.php','/faq.html');
    }
    else if(request.path.includes('/search-legacy.cgi')){
        return request.url.replace('/search-legacy.cgi','/search.php');
    }
    else{
        return request.url;
    }
}

// Find and replace stream changes the original content, some origin response headers are therefore no longer valid and should be removed
function getSafeResponseHeaders(headers){
    for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS){
        if(unsafeResponseHeader in headers){
            delete headers[unsafeResponseHeader]
        }
    }
    return headers;
}
