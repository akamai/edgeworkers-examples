/** @preserve @version 1.0.0 */

/**
 * Claim validation depends on integer label in the CWT claims set.
 * If the claims set does not use integer keys then its customer responsibility to handle basic claim validation as required
 * This rules applies for fields such iss, sub, aud, exp, nbf.
 */
declare type CWTOptions = {
    /**
     * If CwtTag is prepended to the CWT token, we will verify the same. Default is set to false
     */
    isCWTTagAdded?: boolean;
    /**
     * COSE CBOR Tag for the cose message. Default is set {@link Tags.MAC0Tag}
     */
    defaultCoseMsgType?: number;
    /**
     * If COSE CBOR is added to CWT token, Default is set to true.
     */
    isCoseCborTagAdded?: boolean;
    /**
     * performs header validation on protected headers. Default = false
     */
    headerValidation?: boolean;
    /**
     * string to be matched for the iss field.
     *
     */
    issuer?: string;
    /**
     * if true do not validate the exp of the token. (default = true)
     */
    ignoreExpiration?: boolean;
    /**
     * if true do not validate the nbf of the token. (default = true)
     */
    ignoreNotBefore?: boolean;
    /**
     * string to be matched for the sub field.
     */
    subject?: string;
    /**
     * audience to be matched for the aud field.
     */
    audience?: string;
    /**
     * number of seconds to tolerate when checking the nbf and exp claims, to deal with small clock differences among different servers
     * default = 60 seconds
     */
    clockTolerance?: number;
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
     * If enabled, Unsecured JWT tokens (i.e alg = NONE) are supported.
     */
    allowUnsecuredToken?: boolean;
    /**
     * Number of seconds to tolerate when checking the nbf and exp claims.
     * Required to deal with small clock differences among different servers (default = 60 seconds)
     */
    clockTolerance?: number;
};

/**
 * Supported auth tokens for watermarking. Default = CWT
 */
declare enum TokenType {
    CWT = "CWT",
    JWT = "JWT"
}
/**
 * Advanced watermarking options along with {@link JWTOptions} and {@link CWTOptions} options.
 */
declare type WMOptions = JWTOptions & CWTOptions & {
    /**
       * Type of the auth token. Currently supported are CWT and JWT.
       */
    tokenType: TokenType;
    /**
       * Boolean to enable validation of watermarking claims. Default is true
       */
    validateWMClaims?: boolean;
};
/**
 * JSON object containing header and payload.
 * Incase the auth token is CWT token, header will be JSON with protected and unprotected header as cbor maps. @see https://datatracker.ietf.org/doc/rfc8152/ for more details
 * Incase the auth token is JWT token, header will be JSON
 */
declare type WMJSON = {
    header?: any;
    payload?: WMPayload;
};
declare type WMPayload = {
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    cti?: string;
    wmver?: number;
    wmvnd?: string;
    wmidtyp?: number;
    wmidfmt: string;
    wmpatlen: number;
    wmid: string | number;
    segduration?: number;
    wmidalg?: string;
    wmidivlen?: number;
    wmidivhex?: string;
    wmidpid?: string;
    wmidpalg?: string;
    wmidkeyver?: number;
    wmopid?: number;
    title?: string;
};

/**
 * CWTJSON class to hold CWT header and payload in JSON format
 */
declare type CWTJSON = {
    header: {
        p: unknown;
        u: unknown;
    };
    payload: unknown;
};

/**
 * CWTUtil contains helper APIs for converting base64/hex encoded string to binary and translating CWT payload/claims.
 */
declare class CWTUtil {
    static EMPTY_BUFFER: Uint8Array;
    /**
     * Converts Uint8Array to hex
     * @param byteArray Uint8Array
     * @returns  hex string
     */
    static toHexString(byteArray: Uint8Array): string;
    /**
     * Translates integer keys from the payload to the string keys from the labelsMap mapping.
     * The value is passed to the traslator function before assigning to the keys.
     * @param payload     A JSON/Map object where keys are integer. @example { 1: 'john@issuer', 2: 'akamai@subject', 7: Uint8Array([72, 83, 50, 53, 54])}
     * @param labelsMap   A JSON object containing the mapping of integer keys used in CWT payload to string keys. @example { 1: 'iss', 2: 'sub', 3: 'aud', 4: 'exp', 5: 'nbf', 6: 'iat', 7: 'cti' }
     * @param tranlators  A JSON object containing the mapping of field with the translator function. @example { cti: (input: Uint8Array) => TextDecoder().decode(input)}
     * @returns           Instance of JSON object where keys are string. @example { 'iss': 'john@issuer', 'sub': akamai@subject, 'cti': 'HS256' }
     */
    static claimsTranslate(payload: any, labelsMap: {
        [key: number | string]: string;
    }, translators?: {
        [key: string]: Function;
    }): {
        [key: string]: unknown;
        [key: number]: unknown;
    };
}

/**
 * CWTValidator module provides APIs to validate CWT Token.
 * The module follows CWT tokens generated using spec defined here {@link https://www.rfc-editor.org/rfc/rfc8392.html}.
 * The module contains options that can be configured by the consumer to enable validation on CWT payload fields such as exp, nbf, iss, sub and aud.
 * As of now the module only supports verification of the CWT tokens and not generation of CWT tokens. Also the algorithms supported is only HS256.
 */
declare class CWTValidator {
    private cwtOptions;
    /**
     * Performs type checks on the field of {@link CWTOptions} and initializes with default values if not present.
     * @param cwtOptions Advanced options for validating CWT fields. see {@link CWTOptions} for more details.
     * @returns           Instance of {@link CWTValidator}
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if type check on {@link CWTOptions} fields fails.
     * @example Error('Invalid cwtOptions: issuer must be non empty string') - If type check fails for issuer field.
     * @example Error('Invalid cwtOptions: clockTimestamp must be number') - If type check fails for clockTimestamp field.
     */
    constructor(cwtOptions?: CWTOptions);
    /**
     * Decodes and performs signature validation one the CWT token.
     * It also validates the CWT payload claims and headers if validation is enabled via ${@link cwtOptions}.
     * @param tokenBuf      CWT token in binary format (i.e Uint8Array)
     * @param keys          List of {@link CryptoKey } to be used for signature verification. Token is considered valid if signature is verifiable by any one key.
     * @param externalAAD   Externally supplied data in binary (i.e Uint8Array) that needs to be authenticated which is not carried as part of the COSE message.
     * @returns             Instance of {@link CWTJSON } containing header and payload
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate message if type checks fails for arguments.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when trying to use an invalid key data or when the key is not a key for the algorithm or when trying to use an algorithm that is either unknown or isn't suitable for a verify operation.
     * @example Error('Invalid arguments!') - If arguments types are invalid.
     * @example Error('CWT malformed: expected CWT CBOR tag for token!') - If cwtOptions.isCWTTagAdded is enabled but CWT token generated does not have CWTTag(61) added.
     */
    validate(tokenBuf: Uint8Array, keys: CryptoKey[], externalAAD?: Uint8Array): Promise<CWTJSON>;
    /**
     * Process COSE message structure and performs header validation if enabled. see {@link https://datatracker.ietf.org/doc/rfc8152/ } for COSE message spec used to generate CWT tokens.
     * @param coseMessage       Array of cbor encode messages.
     * @param cwtType           COSE message tag.
     * @param keys              List of keys in binary (i.e Uint8Array) used for verifying CWT token.
     * @param headerValidation  Boolean to enable/disable validation on header fields.
     * @param externalAAD       Externally supplied data in binary (i.e Uint8Array) that needs to be authenticated which is not carried as part of the COSE message.
     * @returns                 Promise of {@link CWTJSON}.
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate message if validation fails.
     */
    private verifyCoseMessage;
    /**
     * Validates COSE headers. (protected or unprotected). As of now only crit header is validated
     * TODO: Add more checks on other header fields
     * @param headers    CWT header as map
     * @param protected  Boolean to indicate if passed header is protected or unproteced. True indicates protected
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate message if validation fails.
     */
    private validateHeader;
    /**
     * Performs validations on basic CWT claims set such as exp, nbf, etc only if present.
     * @param decodedPayload Cbor decoded payload
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} if validation fails.
     */
    private validateClaims;
    /**
     * Validates data types for {@link CWTOptions} fields if present, else sets to default.
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} if type check validation fails on {@link cwtOptions} fields.
     */
    private validateOptionTypes;
}

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
     * @param base64JWTToken  Base64 URL encoded JWT token
     * @param jwtParts        Base64 URL encoded parts of JWT token. i.e header, payload and signature respectively
     * @param alg             Verification algorithm to be used. This is obtained from alg header field of JWT token.
     * @param cryptoKey       Instance of {@link CryptoKey } used for signature verification
     * @returns               Promise<boolean> indication status of signature verification
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if rules validation fails.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when trying to use an invalid key or when the key is not suitable for verify operation.
     */
    private validateSignature;
}

/**
 * Mapping of path as string for variant
 */
declare type VariantSubPath = {
    variant: number;
    subPath: string;
};

/**
 * Abstract class to implement vendor specific algorithm to generate tmid.
 */
interface VendorAlgorithm {
    /**
     * Returns the generated TMID after executing vendor specific algorithm.
     * @param payload   @instance of WMPaylaod. see {@link WMPayload} for more details.
     * @param secretKey
     */
    generateTmid(payload: WMPayload, secretKey: string): Promise<string>;
}

/**
 * Watermarking class with API's for implementing A/B watermarking use case for media delivery.
 * Consumers of watermarking feature can import this class and call the necessay API's.
 * More details on watermarking product requirement can be found here: {@link https://collaborate.akamai.com/confluence/pages/viewpage.action?spaceKey=MDE&title=Metadata+Component+Design+for+CED%3A+Watermarking++-+Phase+1#}
 */
declare class Watermarking {
    static WMPACEINFO_DIR: string;
    private wmOptions;
    private jwtValidator;
    private cwtValidator;
    private vendorAlgorithms;
    private cryptoKCache;
    /**
     * Performs type checks on the field of {@link WMOptions} and initializes with default values if not present.
     * @param wmOptions  Advanced options for watermarking fields. see {@link WMOptions} for more details.
     * @param vendorAlgorithm Instance of class containing vendor specific logic to generate tmid. This class should implement {@link VendorAlgorithm} interface.
     * @returns          Instance of {@link Watermarking}
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if type check on {@link WMOptions} fields fails.
     * @example Error('Invalid token type! only cwt or jwt auth tokens are supported')
     */
    constructor(wmOptions: WMOptions, vendorAlgorithms?: Map<string, VendorAlgorithm>);
    /**
     * Validates the auth token (JWT or CWT) as per the validation rules, performs signature verfication for each key from @param keys array.
     * The JWT/CWT signature needs to be successfully verified by atleast one key from @param keys array.
     * The validation rules that are applies are:
     *  - All mandatory watermarking payload claims needs to be present as mentioned in {@see https://docs.google.com/document/d/1N85WZ-LHlGhMSbyrCY7yfOdwnsQ7Es8t/edit#}
     *  - Alg field in the header of JWT or CWT token must be present
     *  - JWT or CWT must be secured. As of now only HS256, RS256 algo is supported for JWT and HS256 algo is supported for CWT
     *  - Performs verifcaiton on expiry, not before, issuer, subject or audience field if enabled. see {@link WMOptions} for advanced configuration.
     * @param authToken   CWT or JWT. JWT based token must be passed as a string. CWT could be passed as binary (i.e Uint8Array) or as hex encoded string.
     * @param keys        List of symmetric / public keys that is used for signature verification. Symmetric keys must be passed as hex encoded. Public keys must be passed as pem encoded.
     * @param keyAlg      Type of algorithm used to generate the key. (supported:  HS256, HS384, HS512, RS256, RS256, RS384, RS512, ES256, ES384, ES512, PS256, PS384, PS512)
     * @returns           Promise of {@link WMJSON } containing token header and payload fields.
     * @throws {Error} with appropriate error message and status code incase of any validation failure.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when the key is not a key for the verifying algorithm or when trying to use an algorithm that is either unknown or isn't suitable for verifying.
     * @example Error(400, 'Invalid token type, expected non empty string or non empty Uint8Array!') - If token type check fails.
     * @exmaple Error(400,'JWT token should be base64 encoded string!!') - If token is not correctly base64 url encoded.
     */
    validateToken(authToken: Uint8Array | string, keys: string[], keyAlg: string): Promise<WMJSON>;
    /**
     * Validates JWT payload based on watermarking rules specified in design spec. see {@link https://docs.google.com/document/d/1N85WZ-LHlGhMSbyrCY7yfOdwnsQ7Es8t/edit#} for more details.
     * @param payload JSON formated watermarking payload
     * @throws {Error} with apporpriate status code and message if any validation rule fails
     */
    private validateWMJWTRules;
    /**
     * Executes relevant algorithm to generate the final watermarking request path variant.
     * For watermarking claims rules refer {@link https://docs.google.com/document/d/1N85WZ-LHlGhMSbyrCY7yfOdwnsQ7Es8t/edit#} for more details.
     * As of now only indirect case (wmidtyp = 1) with irdeto vendor (i.e wmvnd = 'irdeto') is supported.
     * @param path            Original requested url path.
     * @param payload         JSON formated watermarking payload. see {@link WMPayload} for more details.
     * @param secretKey       Hex encoded secretKey
     * @param variantSubPath  Array of {@link VariantSubPath} containing mapping of variant to sub path to be used in modified url
     * @param rangeHeader     Request bytes range in string [Optional]. e.g. bytes=200-1000. Note the header should have the format 'bytes=<range-start>-<range-end>'
     * @returns               Promise of path containing with watermarking variant as string
     * @throws {Error} with appropriate error message and status code incase of any invalid arguments passed or side car processing failure.
     * @example Error(400, `Watermarking: Direct case is not supported at the moment!`) - If watermarking payload wmidtyp === 0 (i.e direct case)
     * @example Error(400, 'Watermarking: Indirect case with only irdeto vendor is supported at the moment!') - If vendor is other than irdeto for indirect case.
     * @example Error(400, `Watermarking: invalid wmidtyp, must be 0 or 1`) - If watermarking payload claims are not as per the rules.
     * @example Error(500, 'Watermarking: unable to find watermarking position from the side car') - If any issue occurs while processing side car file.
     */
    getWMPathWithVariant(path: string, payload: WMPayload, secretKey: string, variantSubPath: Array<VariantSubPath>, rangeHeader?: string): Promise<string>;
    private getSideCarObject;
    private getSubVariantPath;
    /**
     * Performs validations on basic CWT or JWT payload fields such as exp, nbf, etc only if token is fetched from cache.
     * @param wmPayload Watermarking payload
     * @throws {Error} with appropriate error message and status code on any validation failure.
     */
    private validateClaims;
    /**
     * This function is a hack, We need to accept string based keys since we are caching the token verification status and the token verification status is dependent on the keys used.
     * Currently the EW does not support exportKey to get the data from CryptoKey instance to be used in cache key computation.
     * @param keys        String based keys used for token verification
     * @param keyAlg      Type of algorithm used to generate the key.
     * @returns           List of CryptoKey instances
     */
    private importCryptoKeys;
}

export { CWTUtil, CWTValidator, JWTValidator, TokenType, VariantSubPath, WMJSON, WMOptions, WMPayload, Watermarking };
