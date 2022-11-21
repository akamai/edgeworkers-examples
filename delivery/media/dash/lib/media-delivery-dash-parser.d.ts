declare const MIME_TYPE_VIDEO_PREFIX: string;
declare const MIME_TYPE_AUDIO_PREFIX: string;
declare const MIME_TYPE_TEXT_PREFIX: string;
/**
 * DashParser class with necessary API's for implementing Dash manifest manipulation usecase for media delivery.
 * Consumers of Dash manifest manipulation feature can import this class and call the necessay operations.
 * More details on Dash manifest manipulation product requirement can be found here: {@link https://collaborate.akamai.com/confluence/display/MDE/EW+DASH+Parser+-+Component+Design}
 */
declare class DashParser {
    /**
     * This function parses the string input provided using streaming and buffering the MPD file
     * @param mpdXml  string
     * @return none
     */
    static parseMPD(mpdXml: string): void;
    /**
     * This function returns the JSON object converted using parseMPD
     * @param none
     * @return  JSON object
     */
    static getJSON(): any;
    /**
     * This function sets the provided JSON object
     * @param mpdJson JSON object
     * @return none
     */
    static setJSON(mpdJson: any): void;
    /**
     * This function converts the javascript object back to XML string
     * @param none
     * @return string
     */
    static stringifyMPD(): string;
    /**
     * This function filters DASH MPD representations based on bandwidths values passed
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param bitrates array of strings represnting bandwidths. can be just values or range of values. e.g, ['400000','600000'] or ['400000-700000','100000-1000000']
     * when the params are list of values default tolerance of 100000 is subtracted to obtain lower of the range and added 100000 to obtain higher of range values.
     * In above example ['400000','600000'] would be transformed as ['300000-500000','500000-700000']
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterVariantsByBandwidth due to Cannot read properties of undefined (reading 'forEach')).
     */
    static filterVariantsByBandwidth: (mpdJson: any, bitrates: string[], tolerance?: number) => void;
    /**
     * This function filters DASH MPD representations based on resolution value passed. Any representation above the provided resolution will be removed
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param maxSupportedResolution string eg,'320-240'
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterVariantsByResolution due to DashParser: filterVariantsByResolution ,updateVariantAtIndex and updateVariants need resolution in format 'x-y'.)
     */
    static filterVariantsByResolution: (mpdJson: any, maxSupportedResolution: string) => void;
    /**
     * This function updates DASH MPD representation based on resolution value passed and index.
     * If the passed resolution matches any representation's resolution in the provided mpd , the corresponding representation will be removed and added at the specified newIndex
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param resolution string eg,'320-240'
     * @param newIndex number eg,1 where the representation with matched resolution will be moved to
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to updateVariantAtIndex due to DashParser: filterVariantsByResolution ,updateVariantAtIndex and updateVariants need resolution in format 'x-y'.)
     */
    static updateVariantAtIndex: (mpdJson: any, resolution: string, newIndex: number) => void;
    /**
     * This function updates DASH MPD representations based on the provided resolution order.
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param resolution string eg,'320-240'
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (GenericError: DashParser: failed to updateVariants due to DashParser: filterVariantsByResolution ,updateVariantAtIndex and updateVariants need resolution in format 'x-y'.)
     */
    static updateVariants: (mpdJson: any, resolutions: string[], newIndex?: number) => void;
    /**
     * This function filters DASH MPD audio representations based on languages provided as input.
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param languages array of strings eg,['en','fr']
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterVariantsByBandwidth due to Cannot read properties of undefined (reading 'forEach')).
     */
    static filterVariantsByAudioLanguage: (mpdJson: any, languages: string[]) => void;
    /**
     * This function filters DASH MPD subtitle representations based on languages provided as input.
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param languages array of strings eg,['en','fr']
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterVariantsByBandwidth due to Cannot read properties of undefined (reading 'forEach')).
     */
    static filterVariantsBySubtitlesLanguage: (mpdJson: any, languages: string[]) => void;
}

export { DashParser, MIME_TYPE_AUDIO_PREFIX, MIME_TYPE_TEXT_PREFIX, MIME_TYPE_VIDEO_PREFIX };
