/**
 * JWTJson class to hold JWT header and payload in JSON format
 */
declare type JWTJson = {
    /**
     * JWT header in JSON format. see {@link JWTHeader} for more details
     */
    header: JWTHeader;
    /**
     * JWT payload in JSON format. see {@link JWTPayload} for more details
     */
    payload: JWTPayload;
};
declare type JWTHeader = {
    alg: string;
    typ: string;
};
declare type JWTPayload = {
    iss?: string;
    sub?: string;
    aud?: string | Array<string>;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
};

/**
 * Advanced JWT options for enabling validation on default registered claim names
 */
declare type JWTOptions = {
    /**
     * If enabled, string to be matched for the iss claim in JWT payload.
     */
    issuer?: string;
    /**
     * If false, check the expiry of the token. (default = ignored/true)
     */
    ignoreExpiration?: boolean;
    /**
     * If false, check not before claim of the token. (default = ignored/true)
     */
    ignoreNotBefore?: boolean;
    /**
     * If enabled, string to be matched for the sub claim in JWT payload.
     */
    subject?: string;
    /**
     * If enabled, string to be matched for the aud claim in JWT payload.
     */
    audience?: string;
    /**
     * Number of seconds to tolerate when checking the nbf and exp claims.
     * Required to deal with small clock differences among different servers (default = 60 seconds)
     */
    clockTolerance?: number;
};

/**
 * JWTValidator module provides APIs to validate JWT Token.
 * The module follows JWT tokens generated using spec defined here {@link https://www.rfc-editor.org/rfc/rfc7519}. The module contains options that can be configured by the consumer to enable validation on JWT payload fields such as exp, nbf, iss, sub and audience.
 * As of now the module only supports verification of the JWT tokens and not generation of JWT tokens. Also the algorithms supported are RS256, HS256.
 */
declare class JWTValidator {
    private jwtOptions;
    private algorithms;
    /**
     * Performs type checks on the field of {@link JWTOptions} and initializes with default values if not present.
     * @param jwtOptions  Advanced options for validating JWT fields. see {@link JWTOptions} for more details.
     * @returns           Instance of {@link JWTValidator}
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if type check on {@link JWTOptions} fields fails.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when trying to use an invalid key data or when the key is not a key for the algorithm or when trying to use an algorithm that is either unknown or isn't suitable for a verify operation.
     * @example Error('Invalid jwtOptions: issuer must be non empty string') - If type check fails for issuer field.
     * @example Error('Invalid jwtOptions: clockTimestamp must be number') - If type check fails for clockTimestamp field.
     */
    constructor(jwtOptions?: JWTOptions);
    /**
     * Decodes the base64 url encoded token, applys JWT default rules and perform signature verification using @param keys.
     * Default Rules are:
     * - Token should have 2 or 3 parts. i.e header, payload and signature (if JWT is secured) in base64 url encoded.
     * - If issuer verification enabled, matches issuer string with iss claim
     * - If subject verification enabled, matches subject string with sub field
     * - If audience verification enabled, matches audience string with aud field
     * - If ignoreExpiration is false, validates JWT exp field
     * - If ignoreNotBefore  is false, validates JWT nbf field
     * @param base64JWTToken Base64 url encoded JWT token.
     * @param keys           List of {@link CryptoKey } to be used for signature verification. Token is considered valid if signature is verifiable by any one key.
     * @returns              Promise of {@link JWTJson}
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if rules validation fails.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when trying to use an invalid key or when the key is not suitable for verify operation.
     * @example Error('Invalid arguments!') - If argument type check fails.
     * @example Error('JWT malformed: invalid jwt format') - If token is not in valid JWT format.
     * @example Error('JWT token signature verification failed!') - If signature verification fails for all keys
     */
    validate(base64JWTToken: string, keys: CryptoKey[]): Promise<JWTJson>;
    /**
     * Validates data types for {@link JWTOptions} fields if present, else sets to default.
     */
    private validateOptionTypes;
    /**
     * Performs signature verification using verifying key
     * @param jwtParts        Base64 URL encoded parts of JWT token. i.e header, payload and signature respectively
     * @param alg             Verification algorithm to be used. This is obtained from alg header field of JWT token.
     * @param cryptoKey       Instance of {@link CryptoKey } used for signature verification
     * @returns               Promise<boolean> indication status of signature verification
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if rules validation fails.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when trying to use an invalid key or when the key is not suitable for verify operation.
     */
    private validateSignature;
}

export { JWTOptions, JWTValidator };
