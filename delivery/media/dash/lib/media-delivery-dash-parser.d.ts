declare type Bumper = {
    responseBodyObject: any;
    afterSeconds: number;
};

/**
 * DashParser class with necessary API's for implementing Dash manifest manipulation usecase for media delivery.
 * Consumers of Dash manifest manipulation feature can import this class and call the necessary operations.
 * More details on Dash manifest manipulation product requirement can be found here: {@link https://collaborate.akamai.com/confluence/display/MDE/EW+DASH+Parser+-+Component+Design}
 */
declare class DashParser {
    private dashMPD;
    constructor();
    /**
     * This function parses the string input provided using streaming and buffering the MPD file
     * @param mpdXml  string
     */
    parseMPD(mpdXml: string): void;
    /**
     * This function returns the JSON object converted using parseMPD
     * @returns  JSON object
     */
    getJSON(): any;
    /**
     * This function sets the provided JSON object
     * @param mpdJson JSON object
     */
    setJSON(mpdJson: any): void;
    /**
     * This function converts the javascript object back to XML string
     * @returns string
     */
    stringifyMPD(): string;
    /**
     * This function filters DASH MPD representations based on bandwidths values passed
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param bitrates array of strings represnting bandwidths. can be just values or range of values. e.g, ['400000','600000'] or ['400000-700000','100000-1000000']
     * when the params are list of values default tolerance of 100000 is subtracted to obtain lower of the range and added 100000 to obtain higher of range values.
     * In above example ['400000','600000'] would be transformed as ['300000-500000','500000-700000']
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterRepresentationsByBandwidth due to Cannot read properties of undefined (reading 'forEach')).
     */
    filterRepresentationsByBandwidth: (mpdJson: any, bitrates: string[], tolerance?: number) => void;
    /**
     * This function filters DASH MPD representations based on resolution value passed. Any representation above the provided resolution will be removed
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param maxSupportedResolution string eg,'320-240'
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterRepresentationsByResolution due to DashParser: filterRepresentationsByResolution ,updateRepresentationAtIndex and updateRepresentations need resolution in format 'x-y'.)
     */
    filterRepresentationsByResolution: (mpdJson: any, maxSupportedResolution: string) => void;
    /**
     * This function filters DASH MPD audio representations based on languages provided as input.
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param languages array of strings eg,['en','fr']
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterAdaptationSetsByAudioLanguage due to Cannot read properties of undefined (reading 'forEach')).
     */
    filterAdaptationSetsByAudioLanguage: (mpdJson: any, languages: string[]) => void;
    /**
     * This function filters DASH MPD subtitle representations based on languages provided as input.
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param languages array of strings eg,['en','fr']
     * @throws {[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)} with appropriate error messages.
     * @example (Error: DashParser: failed to filterAdaptationSetsBySubtitlesLanguage due to Cannot read properties of undefined (reading 'forEach')).
     */
    filterAdaptationSetsBySubtitlesLanguage: (mpdJson: any, languages: string[]) => void;
    /**
     * This function inserts the auxiliary content to the main asset's playlist. This
     * auxiliary content must be present as individual segments on the origin &
     * must have have its own playlist. This auxiliary content can be inserted as
     * pre/mid/post roll i.e this auxiliary content can be added before/middle/after
     * the primary content segments.
     *
     * @param mpd json object representing MPD(media presentation description)file, returned after calling parseMPD and getJSON methods
     * @param bumperPlaylistArrayObject
     *
     * @returns void
     */
    bumperInsertion: (mpd: any, bumperPlaylistArrayObject: Bumper[]) => void;
    private postRollAdInsert;
    private preRollAdInsert;
    private midRollAdInsert;
    private calculateStartNumberForMultipleSegmentTimeline;
    private insertMidRollBumper;
}

export { DashParser };
