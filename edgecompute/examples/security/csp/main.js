import {parsePolicy} from './cspPolicyParser.js';
import {HtmlRewritingStream} from 'html-rewriter';
import {httpRequest} from 'http-request';
import {createResponse} from 'create-response';
import {crypto} from 'crypto';
import {btoa} from "encoding";

export async function responseProvider(request) {

    //Step 1: Calculate the Nonce
    let array = new Uint32Array(1);
    crypto.getRandomValues(array);
    let stringToEncode = array[0].toString();
    let encodedData = btoa(stringToEncode);
    let headerNonce = 'nonce-' + encodedData;

    //Step 2: Replace the origin nonce with our generated nonce in the CSP response header
    let htmlResponse = await httpRequest("/");
    if (!htmlResponse.ok) {
        return createResponse(500, {}, `Failed to fetch doc: ${htmlResponse.status}`);
    }
    let responseHeaders = htmlResponse.getHeaders();
    let originCSPHeader = htmlResponse.getHeader('Content-Security-Policy')[0];
    const parsedPolicy = parsePolicy(originCSPHeader);
    let parsedPolicyElement = parsedPolicy['script-src'][0].toString();
    let newCspHeader = originCSPHeader.replace(parsedPolicyElement, "'" + headerNonce + "'");
    responseHeaders['content-security-policy'] = [newCspHeader];

    //Step 3: Rewrite the HTML with our generated nonce
    rewriter.onElement('[nonce=' + parsedPolicyElement + ']', el => {
        el.setAttribute('nonce', encodedData, {quote: "'"})
    });

    return createResponse(200, getSafeResponseHeaders(responseHeaders), htmlResponse.body.pipeThrough(rewriter));
}

const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
    'accept-encoding', 'content-encoding', 'keep-alive',
    'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade', 'host'];

function getSafeResponseHeaders(headers) {
    for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
        if (unsafeResponseHeader in headers) {
            delete headers[unsafeResponseHeader];
        }
    }
    return headers;
}
