const CHROME_REGEX='Chrome\/([0-9]*).'; //Also matches Edge supporting 103 Early Hints
const CHROME_MINVERSION=106; //Can be reduced
const NAVIGATE='navigate'; 

export async function onClientRequest(request){
    if(isEarlyHintAllowed(request)){
        let hints = [];
        hints.push('<https://static1.example.com>;rel=preconnect');
        hints.push('<https://cdn.example.com/assets/main.css>;rel=preload;as=style');
        hints.push('</assets/main.js>;rel=preload;as=script');
        hints.push('</fonts/my.woff2>;rel=preload;as=font;type=font/woff2;crossorigin');
        request.setVariable('PMUSER_103_LIST',hints.join(',')); //max 1024-15=1009 bytes
        request.setVariable('PMUSER_103_ENABLED',true);
    }
}

function isEarlyHintAllowed(request){
    if(request.getHeader('sec-fetch-mode')[0] == NAVIGATE) {
        let match  = request.getHeader('user-agent')[0].match(CHROME_REGEX);
        if (match && match[1]>=CHROME_MINVERSION){
            return true;
        }
    }
    return false;
}

export async function onClientResponse(request,response){
    response.setHeader('X-103',request.getVariable('PMUSER_103_LIST'));
}
