import * as HLS from 'hls-parser';

declare type Bumper = {
    auxContentRespBodyObj: any;
    afterSeconds: number;
};

/**
 * @enum Defines types of manifest
 */
declare enum ManifestType {
    MASTER_MANIFEST = "Master Manifest",
    MEDIA_MANIFEST = "Media Manifest"
}
/**
 * This class exposes APIs to cater Manifest Personalization using edgeworkers.
 */
declare class hls {
    /**
     * This API parses plain text playlist & creates structured JS object.
     *
     * @param text
     *
     * @returns It returns the structured JS object created from plain text playlist.
     */
    static parseManifest(text: string): HLS.types.MasterPlaylist | HLS.types.MediaPlaylist;
    /**
     * This API converts structured JS object to plain text playlist.
     *
     * @param playlistObj
     *
     * @returns It returns the plain text playlist recreated from structured JS object.
     */
    static populateManifest(playlistObj: any): string;
    /**
     * This API returns type of manifest that was passed to created
     * structured JS object.
     *
     * @param playlistObj
     *
     * @returns Returns string MASTER_MANIFEST / MEDIA_MANIFEST.
     */
    static getManifestType(playlistObj: any): ManifestType;
    /**
     * This API preserves variants with given bitrate in the manifest & removes any other
     * variants. It accepts single bitrate as a string or a single range of bitrates
     * separated by '-' as a string.
     *
     * @param playlistObj
     * @param bitrates
     * @param tolerance
     *
     * @returns It returns boolean value where true infers that a variant matching given
     * bitrate is removed & false infers that no variant is removed from the passed JS object.
     */
    static removeVariantsByBitrate(playlistObj: any, bitrates: string[], tolerance?: number): boolean;
    /**
     * This API removes all resolutions higher than the given maximum supported resolution.
     * It accepts single resolution as string in the format <width>x<height>.
     *
     * @param playlistObj
     * @param maxSupportedResolution
     *
     * @returns It returns boolean value where true infers that a variant with resolution
     * higher than given resolution is removed & false infers that no variant is removed
     * from the passed JS object.
     */
    static removeVariantsByResolution(playlistObj: any, maxSupportedResolution: string): boolean;
    /**
     * This API moves metadata of a variant with given resolution to the newIndex.
     * newIndex is an optional parameter, if not passed the variant is moved to 0th
     * index. If there are multiple occurences of given resolution, this function
     * brings all of them in sequence starting from newIndex. Rest of the variants
     * metadata will slide downwards in the manifest.
     *
     * @param playlistObj
     * @param resolution
     * @param newIndex
     *
     * @returns It returns a number which infers the next index the variant will be moved to.
     */
    static moveVariantToIndex(playlistObj: any, resolution: string, newIndex?: number): number;
    /**
     * This API moves metadata of all variants with given resolutions
     * to the top. It will keep the order of these variants same as provided in the array of
     * resolutions. Providing multiple entries of same resolution can cause undesired results.
     *
     * @param playlistObj
     * @param resolutions
     * @param newIndex
     *
     * @returns It returns a boolean where true infers that atleast one of the resolution order
     * is updated as per given list of resolutions.
     */
    static updateResolutionOrder(playlistObj: any, resolutions: string[]): boolean;
    /**
     * This API preserves audio renditions with given language in the JS object & removes
     * any other audio renditions. It accepts an array of strings with single / multiple
     * langugages to be preserved.
     *
     * @param playlistObj
     * @param languagesToPreserve
     *
     * @returns It returns a boolean where true infers that atleast one audio rendition with
     * language not matching the list of languages was removed.
     */
    static removeAudioRenditionsByLanguage(playlistObj: any, languagesToPreserve: string[]): boolean;
    /**
     * This API preserves subtitle renditions with given language in the JS object &
     * removes any other subtitle renditions. It accepts an array of strings with single / multiple
     * langugages to be preserved.
     *
     * @param playlistObj
     * @param languagesToPreserve
     *
     * @returns It returns a boolean where true infers that atleast one subtitle rendition with language
     * not matching the list of languages was removed.
     */
    static removeSubtitleRenditionsByLanguage(playlistObj: any, languagesToPreserve: string[]): boolean;
    /**
     * This api inserts the auxiliary content to the main asset's playlist. This
     * auxiliary content must be present as individual segments on the origin &
     * must have have its own playlist. This auxiliary content can be inserted as
     * pre/mid/post roll i.e this auxiliary content can be added before/middle/after
     * the primary content segments.
     *
     * @param primaryPlaylistObj
     * @param bumpersList
     *
     * @returns void
     */
    static insertAuxiliaryContent(primaryPlaylistObj: any, bumpersList: Bumper[] | null): void;
}

export { ManifestType, hls };
