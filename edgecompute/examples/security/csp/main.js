import { HtmlRewritingStream } from 'html-rewriter';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { crypto } from 'crypto';
import { base64 } from "encoding";
import { logger } from 'log';
import { removeUnsafeRequestHeaders, removeUnsafeResponseHeaders, getUniqueHeaderValue } from './http-helpers.js';

/**
 * Allows caching of HTML with CSP nonce by caching object from the Origin and
 *  updating nonce values for each user request. The worker only updates
 *  existing CSP nonces, it doesn't replace CSP implementation by the Origin.
 * 
 * CSP headers are supported, CSP meta tags in html head are NOT supported.
 * Non-html content-type will be forwarded as-is, with no transformation.
 * 
 * Code does a sub-request, looping back on the same property.
 * sub-request will carry a `x-bypass-edge-csp-nonce` header
 * 
 * Property configuration:
 * - Run only for cacheable HTML
 *   Matching on content-type is not possible (too late)
 *   You may rely on requests criteria such as:
 *   - Method is Get
 *   - File extension: EMPTY_STRING html
 *   - Variable AKA_PM_CACHEABLE_OBJECT=true
 *   - Request header Sec-Fetch-Mode: navigate
 * Do not run when request header `x-bypass-edge-csp-nonce` exists
 * - Cache must be bypassed on first leg, to always refresh nonce
 *   request without `x-bypass-edge-csp-nonce` header
 * - Cache must NOT be bypassed on second leg, to cache pristine HTML
 *   request with `x-bypass-edge-csp-nonce: sub-request` header.
 * 
 * @param {EW.ResponseProviderRequest} request
 * @returns {Promise<object>} response
 */
export async function responseProvider(request) {

    //Step 1: Request pristine content
    const requestHeaders = removeUnsafeRequestHeaders(request.getHeaders());
    requestHeaders["x-bypass-edge-csp-nonce"] = ["sub-request"];
    const pristineResponse = await httpRequest(request.url, {
        method: request.method,
        headers: requestHeaders,
        body: request.body
    });

    //Step 2: prepare response from pristine content
    const responseHeaders = removeUnsafeResponseHeaders(pristineResponse.getHeaders());
    let responseBody = pristineResponse.body;

    //Step 3: Rewrite the pristine nonce our generated nonce in both response header and HTML
    const pristineContentType = getUniqueHeaderValue(pristineResponse, "content-type")?.trim()?.toLowerCase();
    // Only for HTML content type
    if (!pristineContentType?.startsWith("text/html")) {
        logger.warn('Unneeded execution: response Content-Type is not HTML');
    }
    else {
        //Step 3.1: Calculate new nonces for both CSP headers
        const nonces = new Map();
        for (const cspHeaderValues of [responseHeaders["content-security-policy"], responseHeaders["content-security-policy-report-only"]]) {
            if (cspHeaderValues) {
                // Header may contain multiple nonces, for instance different nonces for script and css
                for (let i = 0; i < cspHeaderValues.length; i++) {
                    // We replace each nonce with a new one, we keep separated values to reduce potential impact on security
                    const pristineCspHeaderValue = cspHeaderValues[i];
                    cspHeaderValues[i] = pristineCspHeaderValue.replaceAll(/'nonce-([a-zA-Z0-9+/_=-]+)'/g, (nonceDefinition, pristineNonce) => {
                        let newNonce = nonces.get(pristineNonce);
                        if (!newNonce) {
                            // Spec recommends at least 128 bits https://w3c.github.io/webappsec-csp/#security-nonces
                            newNonce = base64.encode(crypto.getRandomValues(new Uint8Array(16)));
                            nonces.set(pristineNonce, newNonce);
                            logger.debug(`pristine-nonce-${pristineNonce} new-nonce-${newNonce}`);
                        }
                        return `'nonce-${newNonce}'`;
                    });
                }
            }
        }
        //Step 3.2: Rewrite the HTML with freshly generated nonces
        if (nonces.size === 0) {
            logger.warn('Unneeded execution: no CSP response header with nonce');
        } else {
            logger.info('Updating HTML with CSP nonce');
            const rewriter = new HtmlRewritingStream();
            for (const [pristineNonce, newNonce] of nonces) {
                // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
                rewriter.onElement(`[nonce=${pristineNonce}]`, el => {
                    el.setAttribute('nonce', newNonce, { quote: "'" })
                });
            }
            responseBody = responseBody.pipeThrough(rewriter);
        }
    }

    //Step 4: Forward pristine response to end-user
    return createResponse(pristineResponse.status, responseHeaders, responseBody);
}
