import { httpRequest } from 'http-request';
const CHROME_REGEX='Chrome\/([0-9]*).'; //Regex to Extract Chrome version number
const CHROME_MINVERSION=103; //103 Early hints support was added in Chrome 103
const PMUSER_103_LIST='PMUSER_103_LIST';
const PMUSER_103_ENABLED='PMUSER_103_ENABLED'; 
const NAVIGATE='navigate'; 
const OPTIONS={timeout:50}; //Cancel Early hints when subrequest takes too long

export async function onClientRequest(request){
    if(isEarlyHintsAllowed(request)){
      try {
        let apiResponse = await httpRequest('https://www.yourdomain.com/api/listofresources',OPTIONS); //Cache+Extreme Prefresh for fast delivery and quick updates
        if(apiResponse.status==200){
            let data = await apiResponse.text();
            request.setVariable(PMUSER_103_LIST,data); //Check size limits https://techdocs.akamai.com/edgeworkers/docs/request-object#setvariable
            request.setVariable(PMUSER_103_ENABLED,true);
        }
      }
      catch{
      }
    }
}

//Only run Early hints for supporting browsers (Chromium 103+) and when sec-fetch-mode=navigate
function isEarlyHintsAllowed(request){
    if(request.getHeader('sec-fetch-mode')[0] == NAVIGATE) {
        let match  = request.getHeader('user-agent')[0].match(CHROME_REGEX);
        if (match && match[1]>=CHROME_MINVERSION){
            return true;
        }
    }
    return false;
}
