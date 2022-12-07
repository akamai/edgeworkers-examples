/** @preserve @version 1.0.0 */

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
 * Class containing all necesay API's to execute Vendor algorithm
 */
declare class VendorAlgorithm implements VendorAlgorithm {

    /**
     * Executes Vendor algorithm and returns TMID generated.
     * On failures, it throws the appropriate error code with message.
     * @param payload     @instance of WMPaylaod. see {@link WMPayload} for more details.
     * @param secretKey   Key in hex used to calculate TMID
     * @returns           Generated TMID in hex format
     */
    generateTmid(payload: WMPayload, secretKey: string): Promise<string>;
    /**
     *  Applys validation rules specific to Vendor algoritm.
     *  Rules are defined as belows:
     *  - wmpatlen must be in multiple of 128
     *  - wmpatlen must be in between 128 - 4096
     *  - wmopid must be in between 1 - 511
     *  - secretKey must be in hex
     * @param wmpatlen  Provides the length of WM pattern extracted or derived from wmid.
     * @param wmopid    Watermarking operator id.
     */
    private validateVendorArguments;
    /**
     * Calulates initialization vector using wmopid
     * @param wmoid Watermarking operator id.
     * @returns     Initalization vector as Uint8Array
     */
    private calculateIV;
    /**
     * Calculates SHA1 of wmid
     * @param wmid      Watermarking id obtained JWT claim
     * @param wmidfmt   Provides the representation format used for wmid present in JWT claim
     * @returns         SHA1 of wmid as Uint8Array
     */
    private calculateSHA1;
}
declare const VendorAlgorithm: VendorAlgorithm;

export { VendorAlgorithm };
