const CHROME_REGEX='Chrome\/([0-9]*).'; //Regex to Extract Chrome version number
const CHROME_MINVERSION=103; //103 Early hints support was added in Chrome 103
const PMUSER_103_LIST='PMUSER_103_LIST';
const PMUSER_103_ENABLED='PMUSER_103_ENABLED'; 
const NAVIGATE='navigate'; 

export async function onClientRequest(request){
    if(isEarlyHintsAllowed(request)){
        let hints = [];
        hints.push('<https://static1.example.com>;rel=preconnect');
        hints.push('<https://cdn.example.com/assets/main.css>;rel=preload;as=style');
        hints.push('</assets/main.js>;rel=preload;as=script');
        hints.push('</fonts/my.woff2>;rel=preload;as=font;type=font/woff2;crossorigin');
        request.setVariable(PMUSER_103_LIST,hints.join(',')); //max 1024-15=1009 bytes
        request.setVariable(PMUSER_103_ENABLED,true);
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
