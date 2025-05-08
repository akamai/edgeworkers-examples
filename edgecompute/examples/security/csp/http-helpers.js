/**
 * Sub-request helper module
 * HTTP headers manipulation
 * Handling unsafe hop-by-hop headers when request or response are duplicated
 */

const UNSAFE_REQUEST_HEADERS = [
    'host', 'pragma', 'accept-encoding',
    'connection', 'proxy-authorization',
    'te', 'trailer', 'transfer-encoding', 'upgrade'
];
const UNSAFE_RESPONSE_HEADERS = [
    'content-length', 'vary', 'content-encoding',
    'connection', 'keep-alive', 'proxy-authenticate',
    'trailer', 'transfer-encoding', 'upgrade'
];
/**
 * @param {EW.Headers} headers
 * @param {string[]} unsafeHeaders
 */
function removeUnsafeHeaders(headers, unsafeHeaders) {
    for (let unsafeHeader of unsafeHeaders) {
        if (unsafeHeader in headers) {
            delete headers[unsafeHeader]
        }
    }
    return headers;
}

/**
 * Removes hop-by-hop unsafe request headers from provided header collection.
 * @param {EW.Headers} headers - Collection of http request headers.
 * @returns headers parameter
 */
export function removeUnsafeRequestHeaders(headers) {
    return removeUnsafeHeaders(headers, UNSAFE_REQUEST_HEADERS);
}

/**
 * Removes hop-by-hop unsafe response headers from provided header collection.
 * @param {EW.Headers} headers - Collection of http response headers.
 * @returns headers parameter
 */
export function removeUnsafeResponseHeaders(headers) {
    return removeUnsafeHeaders(headers, UNSAFE_RESPONSE_HEADERS);
}

/**
 * Helper function to get value for a unique request header.
 * @param {EW.ReadsHeaders} requestOrResponse
 * @param {string} headerName - name of http header.
 * @param {string?} defaultValue - Value returned if header is missing or got multiple values.
 * @returns {string?} header value or default
 */
export function getUniqueHeaderValue(requestOrResponse, headerName, defaultValue = null) {
    const headers = requestOrResponse.getHeader(headerName);
    if (headers && headers.length == 1) {
        return headers[0];
    } else {
        return defaultValue;
    }
}
