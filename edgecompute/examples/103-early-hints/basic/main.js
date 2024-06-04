const PMUSER_103_LIST='PMUSER_103_LIST';

export async function onClientRequest(request){
        let hints = [];
        hints.push('<https://static1.example.com>;rel=preconnect');
        hints.push('<https://cdn.example.com/assets/main.css>;rel=preload;as=style');
        hints.push('</assets/main.js>;rel=preload;as=script');
        hints.push('</fonts/my.woff2>;rel=preload;as=font;type=font/woff2;crossorigin');
        request.setVariable(PMUSER_103_LIST,hints.join(',')); //Check variable size limits https://techdocs.akamai.com/edgeworkers/docs/request-object#setvariable
}
