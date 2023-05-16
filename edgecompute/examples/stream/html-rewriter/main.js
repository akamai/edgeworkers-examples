import { HtmlRewritingStream } from 'html-rewriter';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';


export async function responseProvider(request) {

    // Define src of the script we'll inject into the origin response
    const scriptPath = 'https://www.example.com/assets/js/my-script.js';

    // Define the response from origin and our rewriting instance
    let htmlResponse = await httpRequest(request.path);
    let rewriter = new HtmlRewritingStream();

    // Look for the head element in our response and append the custom script
    rewriter.onElement('head', el => {
        el.append(`<script type="text/javascript" src="${scriptPath}"></script>`);
    });

    // Create the full response piped through the html-rewriter
    return createResponse(200, {}, htmlResponse.body.pipeThrough(rewriter))
}