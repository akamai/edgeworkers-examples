/** @preserve @version 1.2.0 */

/**
 * Claim validation depends on integer label in the CWT claims set.
 * If the claims set does not use integer keys then its customer responsibility to handle basic claim validation as required
 * This rules applies for fields such iss, sub, aud, exp, nbf.
 */
declare type CWTOptions = {
    /**
     * If CwtTag is prepended to the CWT token, we will verify the same. Default is set to false.
     * During CWT generation, this flag can be used to add CWT tag for the token
     */
    isCWTTagAdded?: boolean;
    /**
     * COSE CBOR Tag for the cose message. Default is set {@link Tags.MAC0Tag}
     */
    defaultCoseMsgType?: number;
    /**
     * If COSE CBOR is added to CWT token, Default is set to true.
     * During CWT generation, this flag can be used to add COSE tag for the token
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
 * Wrapper class to hold protected / unprotected header claims.
 */
declare type ContentHeader = {
    p?: Map<number | string, any>;
    u?: Map<number | string, any>;
};
declare type Signer = {
    key: CryptoKey;
    p?: Map<number | string, any>;
    u?: Map<number | string, any>;
    externalAAD?: Uint8Array;
};
declare type Verifier = {
    key: CryptoKey;
    externalAAD?: Uint8Array;
    kid?: Uint8Array;
};

declare const HeaderLabels: {
    [key: string]: number;
};
declare const ClaimLabels: {
    [key: string]: number;
};
declare const AlgorithmLabels: {
    [key: string]: number;
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
     * Translates keys of the map to the keys matched from the labelsMap. The value of the key from the paylaod is passed to the traslator function before assigning to the keys.
     * @param payload     A JSON/Map object where keys are integer or string. @example { 1: 'john@issuer', 2: 'akamai@subject', 7: Uint8Array([72, 83, 50, 53, 54])}
     * @param labelsMap   A JSON object containing the mapping of integer/string keys used in CWT payload to string/integer keys. @example { 1: 'iss', 2: 'sub', 3: 'aud', 4: 'exp', 5: 'nbf', 6: 'iat', 7: 'cti' }
     * @param tranlators  A JSON object containing the mapping of field with the translator function. @example { cti: (input: Uint8Array) => TextDecoder().decode(input)}
     * @returns           Instance of JSON object where keys are string or number. @example { 'iss': 'john@issuer', 'sub': akamai@subject, 'cti': 'HS256' }
     */
    static claimsTranslate(payload: any, labelsMap: {
        [key: number | string]: string | number;
    }, translators?: {
        [key: string]: Function;
    }): Map<any, any>;
    /**
     * Helper method to compare two Uint8Array
     * @param arr1  Instance of Uint8Array
     * @param arr2  Instance of Uint8Array
     * @returns     Boolean indicating result of comparsion
     */
    static isUint8ArrayEqual(arr1: Uint8Array, arr2: Uint8Array): boolean;
}

/**
 * CWTValidator module provides APIs to validate CWT Token.
 * The module follows CWT tokens generated using spec defined here {@link https://www.rfc-editor.org/rfc/rfc8392.html}.
 * The module contains options that can be configured by the consumer to enable validation on CWT payload fields such as exp, nbf, iss, sub and aud.
 * As of now the module only supports verification of the CWT tokens and not generation of CWT tokens. Also the algorithms supported is only HS256, ES256.
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
     * @param verifiers     List of {@link Verifier } to be used for signature verification. Token is considered valid if signature is verifiable by any one key. Incase of multi signature cose structure, key matching the kid will be used for verification.
     * @returns             Instance of {@link CWTJSON } containing header and payload
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate message if type checks fails for arguments.
     * @throws {[DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) | [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)} when trying to use an invalid key data or when the key is not a key for the algorithm or when trying to use an algorithm that is either unknown or isn't suitable for a verify operation.
     * @example Error('Invalid arguments!') - If arguments types are invalid.
     * @example Error('CWT malformed: expected CWT CBOR tag for token!') - If cwtOptions.isCWTTagAdded is enabled but CWT token generated does not have CWTTag(61) added.
     */
    validate(tokenBuf: Uint8Array, verifiers: Verifier[]): Promise<CWTJSON>;
    /**
     * Process COSE message structure and performs header validation if enabled. see {@link https://datatracker.ietf.org/doc/rfc8152/ } for COSE message spec used to generate CWT tokens.
     * @param coseMessage       Array of cbor encode messages.
     * @param cwtType           COSE message tag.
     * @param verifiers         List of {@link Verifier } to be used for signature verification. Token is considered valid if signature is verifiable by any one key. Incase of multi signature cose structure, key matching the kid will be used for verification.
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
    /**
     * Returns verifier whose key will be used to perform signature verification
     * @param signU     Unprotected header from Cose_Signature message structure
     * @param verifiers List of verifiers with verifying key and kid.
     * @returns         Verifier whose kid matches the kid from signU (i.e unprotected header from Cose_Signature)
     */
    private getVerifier;
}
/**
 * CWTGenerator modules provides APIs to create CWT token.
 * The module follows CWT tokens generated using spec defined here {@link https://www.rfc-editor.org/rfc/rfc8392.html}.
 * As of now the module only supports COSE_Sign,COSE_Sign1, COSE_MAC0 and COSE_MAC structure. Also, Only ES256 and HS256 algorithms are supported at the moment.
 *
 */
declare class CWTGenerator {
    /**
     *
     * @param claims         JSON object containing CWT claims set
     * @param signer         Instance of {@link Signer} which will used to sign the CWT token. One can pass external data to be included during signature computation.
     * @param contentHeader  JSON object containing protected and unprotected header fields. see {@link ContentHeader} for more details.
     * @param recipients     Recipients to which the signingKey needs to be shared with. (Note: currently not supported)
     * @param options        CWT options. see {@link CWTOptions} for more details. Only {@link CWTOptions.isCWTTagAdded} and {@link CWTOptions.isCoseCborTagAdded} are relevant during CWT token creation.
     * @returns              CWT token in {@link Uint8Array}
     */
    static mac(claims: Map<number | string, any>, signer: Signer, contentHeader: ContentHeader, recipients?: Signer[], options?: CWTOptions): Promise<Uint8Array>;
    /**
     * Generates CWT token based on assymetric cryptography scheme.
     * @param claims        JSON object containing CWT claims set
     * @param signers       Single or multiple signer(s) that will be used to sign the CWT token. One can pass external data for each signger that needs to be included during signature computation. If passed as array, COSE_Sign message structure is used or else COSE_Sign1
     * @param contentHeader JSON object containing protected and unprotected header fields. see {@link ContentHeader} for more details.
     * @param options       CWT options. see {@link CWTOptions} for more details. Only {@link CWTOptions.isCWTTagAdded} and {@link CWTOptions.isCoseCborTagAdded} are relevant during CWT token creation.
     * @returns             CWT token in {@link Uint8Array}
     */
    static sign(claims: any, signers: Signer | Array<Signer>, contentHeader?: ContentHeader, options?: CWTOptions): Promise<Uint8Array>;
}

export { AlgorithmLabels, CWTGenerator, CWTJSON, CWTUtil, CWTValidator, ClaimLabels, HeaderLabels, Signer, Verifier };
