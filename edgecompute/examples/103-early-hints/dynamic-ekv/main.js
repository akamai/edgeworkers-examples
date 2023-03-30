import { EdgeKV } from './edgekv.js'; //You need to add the helper library https://techdocs.akamai.com/edgekv/docs/library-helper-methods
const CHROME_REGEX='Chrome\/([0-9]*).'; //Regex to Extract Chrome version number
const CHROME_MINVERSION=103; //103 Early hints support was added in Chrome 103
const PMUSER_103_LIST='PMUSER_103_LIST';
const PMUSER_103_ENABLED='PMUSER_103_ENABLED'; 
const NAVIGATE='navigate'; 
const edgeKv = new EdgeKV({group: "earlyHints"});

export async function onClientRequest(request){
    if(isEarlyHintsAllowed(request)){
      try {
        let data = await edgeKv.getText({item:'103_list'});
        if(data!=''){
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
