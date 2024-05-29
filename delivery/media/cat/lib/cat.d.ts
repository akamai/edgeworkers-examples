/** @preserve @version 1.0.0 */

/**
 * Claim validation depends on integer label in the CAT claims set.
 * If the claims set does not use integer keys then its customer responsibility to handle basic claim validation as required
 * This rules applies for fields such iss, sub, aud, exp, nbf.
 */
declare type CATOptions = {
    /**
     * If CwtTag is prepended to the CAT token, we will verify the same. Default is set to false.
     * During CAT generation, this flag can be used to add CWT Tag for the token
     */
    isCWTTagAdded?: boolean;
    /**
     * If COSE CBOR Tag is added to CAT token, Default is set to true.
     * During CAT generation, this flag can be used to add COSE CBOR tag for the token
     */
    isCoseCborTagAdded?: boolean;
    /**
     * List of strings to be matched for the iss field. Any one should from the list should match the claims iss field.
     *
     */
    issuer?: string[];
    /**
     * List of strings to be matched for the sub field. Any one should from the list should match the claims sub field.
     */
    subject?: string[];
    /**
     * List of strings to be matched for the sub field. Any one should from the list should match the claims aud field.
     */
    audience?: string[];
    /**
     * if true do not validate the exp of the token. (default = false)
     */
    ignoreExpiration?: boolean;
    /**
     * if true do not validate the nbf of the token. (default = false)
     */
    ignoreNotBefore?: boolean;
    /**
     * number of seconds to tolerate when checking the nbf and exp claims, to deal with small clock differences among different servers
     * default = 60 seconds
     */
    clockTolerance?: number;
};

/**
 * CATJson class to hold CWT based header and payload in JSON format
 */
declare type CATJson = {
    header: {
        p?: any;
        u?: any;
    };
    payload: any;
};
declare type ValidationResult = {
    status: boolean;
    errMsg?: string;
};

declare const HeaderLabelMap: {
    alg: number;
    crit: number;
    kid: number;
    IV: number;
};
declare const AlgoLabelMap: {
    ES256: number;
    HS256: number;
    PS256: number;
};
declare const ClaimsLabelMap: {
    iss: number;
    sub: number;
    aud: number;
    exp: number;
    nbf: number;
    iat: number;
    cti: number;
    catreplay: number;
    catv: number;
    crit: number;
    catnip: number;
    catu: number;
    catm: number;
    catalpn: number;
    cath: number;
    catgeoiso3166: number;
    catgeocoord: number;
    cattpk: number;
    catifdata: number;
    cnf: number;
    catdpopw: number;
    enc: number;
    or: number;
    nor: number;
    and: number;
    catif: number;
    catr: number;
    catdpopjti: string;
    geohash: string;
    catgeoalt: string;
    catpor: number;
};
declare const CatURILabelMap: {
    scheme: number;
    host: number;
    port: number;
    path: number;
    query: number;
    parent_path: number;
    filename: number;
    stem: number;
    extension: number;
};
declare const MatchTypeLabelMap: {
    exact: number;
    prefix: number;
    suffix: number;
    contains: number;
    regex: number;
    sha256: number;
    sha512: number;
};
declare const CatRLabelMap: {
    renewal_type: number;
    exp_extension: number;
    renewal_deadline: number;
    cookie_name: number;
    header_name: number;
    parent_path: number;
    cookie_params: number;
    header_params: number;
    redirect_status: number;
};
declare const CatRRenewableTypes: {
    automatic_renewable: number;
    cookie_renewable: number;
    header_renewable: number;
    redirect_renewable: number;
};

/**
 * CAT module provides APIs to decode, create validate CAT Token.
 * The module follows CAT tokens generated using spec defined here {@link https://docs.google.com/document/d/1lqsu9v8RSWDtd4p8vAgkUwE5IWBxb4YX/edit}.
 * The module contains options that can be configured by the consumer to enable validation on CAT claim set such as exp, nbf, iss, sub and aud.
 * As of now the module only supports CAT decoding, creation and verification of the CA tokens. The algorithms supported is only HS256 (COSE_Mac0), ES256 (COSE_Sign, COSE_Sign1).
 */
declare class CAT {
    private catOptions;
    /**
     * Performs type checks on the field of {@link CATOptions} and initializes with default values if not present.
     * @param cwtOptions Advanced options for validating CWT fields. see {@link CWTOptions} for more details.
     * @returns           Instance of {@link CWTValidator}
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error message if type check on {@link CWTOptions} fields fails.
     * @example Error('Invalid cwtOptions: issuer must be non empty string') - If type check fails for issuer field.
     * @example Error('Invalid cwtOptions: clockTimestamp must be number') - If type check fails for clockTimestamp field.
     */
    constructor(catOptions?: CATOptions);
    /**
     * Decodes CAT token.
     * @param catTokenBytes CAT token in byte string
     * @returns             Decoded CAT token with protected header, unprotected header and payload as Map.
     */
    decode(catTokenBytes: Uint8Array): CATJson;
    /**
     * Checks if the CAT token payload is well formed. This function only performs type checks on CAT payload's value.
     * @param payload CAT's claimset.
     * @returns       Instance of {@link ValidationResult} which indicates if the token is well formed or not, if not, appropriate error message.
     */
    isCATWellFormed(payload: Map<number, any>): ValidationResult;
    /**
     * Checks if the CAT token payload is acceptable as per claim set rules on current request.
     * This function performs rules check on each and every supported claim by the module.
     * @param payload   CAT's claimset.
     * @param request   Instance of {@link ValidationResult} which indicates if the token is acceptable or not for the request, if not, appropriate error message.
     * @returns
     */
    isCATAcceptable(payload: Map<number, any>, request: EW.IngressClientRequest, decryptionKey?: CryptoKey): Promise<ValidationResult>;
    /**
     * Validates data types for {@link CATOptions} fields if present, else sets to default.
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} if type check validation fails on {@link catOptions} fields.
     */
    private validateOptionTypes;
}

export { AlgoLabelMap, CAT, CatRLabelMap, CatRRenewableTypes, CatURILabelMap, ClaimsLabelMap, HeaderLabelMap, MatchTypeLabelMap };
