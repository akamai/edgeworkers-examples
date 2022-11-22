import * as HLS from 'hls-parser';
import * as utils from './helper/hls_utils';
import * as AbstractTypes from './models/abstract_types';

// Initialize hls-parser in strictMode to
// disable silent logging of internal errors
HLS.setOptions({ strictMode: true });

/**
 * @enum Defines types of manifest
 */
export enum ManifestType {
  MASTER_MANIFEST = 'Master Manifest',
  MEDIA_MANIFEST = 'Media Manifest'
}

/**
 * This class exposes APIs to cater Manifest Personalization using edgeworkers.
 */
export class hls {
  /**
   * This API parses plain text playlist & creates structured JS object.
   *
   * @param text
   *
   * @returns It returns the structured JS object created from plain text playlist.
   */
  static parseManifest(text: string) {
    if (typeof text !== 'string') {
      throw new Error(
        'HLSParser: parseManifest api failed - Invalid input type, expected input type string.'
      );
    }

    if (text === '') {
      throw new Error(
        'HLSParser: parseManifest api failed - Empty input value, expected non-empty string as input.'
      );
    }

    try {
      return HLS.parse(text);
    } catch (error) {
      throw new Error(
        `HLSParser: hls-parser parse api failed - ${(error as Error).message}`
      );
    }
  }

  /**
   * This API converts structured JS object to plain text playlist.
   *
   * @param playlistObj
   *
   * @returns It returns the plain text playlist recreated from structured JS object.
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static populateManifest(playlistObj: any) {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: populateManifest api failed - Empty playlist object, expected playlist object created using parseManifest api.'
      );
    }

    try {
      return HLS.stringify(playlistObj);
    } catch (error) {
      throw new Error(
        `HLSParser: hls-parser stringify api failed - ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * This API returns type of manifest that was passed to created
   * structured JS object.
   *
   * @param playlistObj
   *
   * @returns Returns string MASTER_MANIFEST / MEDIA_MANIFEST.
   */
  static getManifestType(playlistObj: any) {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: getManifestType api failed - Empty playlist object, expected playlist object created using parseManifest api.'
      );
    }

    try {
      if (playlistObj.isMasterPlaylist) return ManifestType.MASTER_MANIFEST;
      else return ManifestType.MEDIA_MANIFEST;
    } catch (error) {
      throw new Error(
        `HLSParser: getManifestType api failed - Playlist type initialization not found in playlistObj - ${
          (error as Error).message
        }`
      );
    }
  }

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
  static removeVariantsByBitrate(
    playlistObj: any,
    bitrates: string[],
    tolerance = 100000
  ): boolean {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: removeVariantsByBitrate api failed - Empty playlist object, expected playlist object created using parseManifest api.'
      );
    }

    if (!bitrates || !Array.isArray(bitrates) || bitrates.length == 0) {
      throw new Error(
        'HLSParser: removeVariantsByBitrate api failed - Empty bitrates array, expected bitrates array of strings.'
      );
    }

    if (tolerance < 0) {
      throw new Error(
        'HLSParser: removeVariantsByBitrate api failed - Invalid tolerance value, expected non-negative tolerance value.'
      );
    }

    let isVariantRemoved = false;
    try {
      const numOfBitrates = bitrates.length;
      const bitratesToPreserve = new Set();

      // finding bitrates to preserve in the manifest
      for (let i = 0; i < numOfBitrates; i++) {
        if (bitrates[i].length <= 0) continue;
        const [lowerBound, upperBound] = utils.ParseBitrateRange(
          bitrates[i],
          tolerance
        );

        if (lowerBound == -1) return isVariantRemoved;

        let j = 0;
        let numOfVariantsInManifest = playlistObj.variants.length;
        while (j < numOfVariantsInManifest) {
          if (
            playlistObj.variants[j].bandwidth &&
            playlistObj.variants[j].bandwidth >= lowerBound &&
            playlistObj.variants[j].bandwidth <= upperBound
          ) {
            bitratesToPreserve.add(playlistObj.variants[j].bandwidth);
          }
          j++;
        }
      }

      // removing bitrates not in the list of bitrates to be preserved
      if (bitratesToPreserve.size > 0) {
        let j = 0;
        let numOfVariantsInManifest = playlistObj.variants.length;
        while (j < numOfVariantsInManifest) {
          if (
            playlistObj.variants[j].bandwidth &&
            !bitratesToPreserve.has(playlistObj.variants[j].bandwidth)
          ) {
            playlistObj.variants.splice(j, 1);
            isVariantRemoved = true;
            numOfVariantsInManifest--;
          } else {
            j++;
          }
        }
      }
    } catch (error) {
      throw new Error(
        `HLSParser: removeVariantsByBitrate api failed - ${
          (error as Error).message
        }`
      );
    }

    return isVariantRemoved;
  }

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
  static removeVariantsByResolution(
    playlistObj: any,
    maxSupportedResolution: string
  ): boolean {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: removeVariantsByResolution api failed - Empty playlist object, expected playlist object created using parseManifest api.'
      );
    }

    if (typeof maxSupportedResolution !== 'string') {
      throw new Error(
        'HLSParser: removeVariantsByResolution api failed - Invalid maximum supported resolution type, expected type string.'
      );
    }

    if (maxSupportedResolution === '') {
      throw new Error(
        'HLSParser: removeVariantsByResolution api failed - Empty maximum supported resolution value, expected non-empty string.'
      );
    }

    let isVariantRemoved = false;

    try {
      const maxSupportedResolutionObject = utils.parseResolution(
        maxSupportedResolution
      );
      let i = 0;
      let numOfVariantsInManifest = playlistObj.variants.length;
      while (i < numOfVariantsInManifest) {
        if (
          playlistObj.variants[i].resolution &&
          (playlistObj.variants[i].resolution.width >
            maxSupportedResolutionObject.width ||
            playlistObj.variants[i].resolution.height >
              maxSupportedResolutionObject.height)
        ) {
          playlistObj.variants.splice(i, 1);
          isVariantRemoved = true;
          numOfVariantsInManifest--;
        } else {
          i++;
        }
      }
    } catch (error) {
      throw new Error(
        `HLSParser: removeVariantsByResolution api failed - ${
          (error as Error).message
        }`
      );
    }

    return isVariantRemoved;
  }

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
  static moveVariantToIndex(
    playlistObj: any,
    resolution: string,
    newIndex = 0
  ): number {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: moveVariantToIndex api failed - Empty playlist object, expected playlist object created using parseManifest api.'
      );
    }

    if (typeof resolution !== 'string') {
      throw new Error(
        'HLSParser: moveVariantToIndex api failed - Invalid resolution type, expected type string.'
      );
    }

    if (resolution === '') {
      throw new Error(
        'HLSParser: moveVariantToIndex api failed - Empty resolution value, expected non-empty string.'
      );
    }

    if (newIndex < 0) {
      throw new Error(
        'HLSParser: moveVariantToIndex api failed - Invalid new index value, expected non-negative new index value.'
      );
    }

    try {
      // review this if return value required
      if (!playlistObj || !resolution || newIndex < 0) return -1;

      let i = 0;
      const numOfVariantsInManifest = playlistObj.variants.length;
      const resolutionObject = utils.parseResolution(resolution);
      while (
        i < numOfVariantsInManifest &&
        newIndex < numOfVariantsInManifest
      ) {
        if (
          playlistObj.variants[i].resolution &&
          playlistObj.variants[i].resolution.width === resolutionObject.width &&
          playlistObj.variants[i].resolution.height === resolutionObject.height
        ) {
          // if current index of given is equal to newIndex, we don't move the resolution object
          if (i != newIndex) {
            playlistObj.variants.splice(
              newIndex,
              0,
              playlistObj.variants.splice(i, 1)[0]
            );
          }
          newIndex++;
        }
        i++;
      }
    } catch (error) {
      throw new Error(
        `HLSParser: moveVariantToIndex api failed - ${(error as Error).message}`
      );
    }

    return newIndex;
  }

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
  static updateResolutionOrder(
    playlistObj: any,
    resolutions: string[]
  ): boolean {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: updateResolutionOrder api failed - Empty playlistObj object, expected playlistObj object created using parseManifest api.'
      );
    }

    if (
      !resolutions ||
      !Array.isArray(resolutions) ||
      resolutions.length == 0
    ) {
      throw new Error(
        'HLSParser: updateResolutionOrder api failed - Empty list of resolutions, expected non-empty list of resolutions.'
      );
    }

    let isResolutionOrderUpdated = false;

    try {
      if (!playlistObj || !resolutions || resolutions.length == 0)
        return isResolutionOrderUpdated;

      let newIndex = 0;
      const numOfResToBeUpdated = resolutions.length;
      const numOfVariantsInManifest = playlistObj.variants.length;

      if (numOfResToBeUpdated > numOfVariantsInManifest)
        return isResolutionOrderUpdated;

      for (let i = 0; i < numOfResToBeUpdated; i++) {
        const nextIndex = this.moveVariantToIndex(
          playlistObj,
          resolutions[i],
          newIndex
        );
        if (nextIndex != newIndex) {
          isResolutionOrderUpdated = true;
          newIndex = nextIndex;
        }
      }
    } catch (error) {
      throw new Error(
        `HLSParser: updateResolutionOrder api failed - ${
          (error as Error).message
        }`
      );
    }

    return isResolutionOrderUpdated;
  }

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
  static removeAudioRenditionsByLanguage(
    playlistObj: any,
    languagesToPreserve: string[]
  ): boolean {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: removeAudioRenditionsByLanguage api failed - Empty playlistObj object, expected playlistObj object created using parseManifest api.'
      );
    }

    if (
      !languagesToPreserve ||
      !Array.isArray(languagesToPreserve) ||
      languagesToPreserve.length == 0
    ) {
      throw new Error(
        'HLSParser: removeAudioRenditionsByLanguage api failed - Empty list of languages to preserve, expected non-empty list of languages to preserve.'
      );
    }

    let isAudioRenditionRemoved = false;

    try {
      if (
        !playlistObj ||
        !languagesToPreserve ||
        languagesToPreserve.length == 0
      )
        return isAudioRenditionRemoved;

      const numOfVariantsInManifest = playlistObj.variants.length;
      for (let j = 0; j < numOfVariantsInManifest; j++) {
        let k = 0;
        let numOfAudioRenditions = playlistObj.variants[j].audio.length;
        while (k < numOfAudioRenditions) {
          if (
            languagesToPreserve.indexOf(
              playlistObj.variants[j].audio[k].language
            ) < 0
          ) {
            playlistObj.variants[j].audio.splice(k, 1);
            isAudioRenditionRemoved = true;
            numOfAudioRenditions--;
          } else {
            k++;
          }
        }
      }
    } catch (error) {
      throw new Error(
        `HLSParser: removeAudioRenditionsByLanguage api failed - ${
          (error as Error).message
        }`
      );
    }

    return isAudioRenditionRemoved;
  }

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
  static removeSubtitleRenditionsByLanguage(
    playlistObj: any,
    languagesToPreserve: string[]
  ): boolean {
    if (!playlistObj) {
      throw new Error(
        'HLSParser: removeSubtitleRenditionsByLanguage api failed - Empty playlistObj object, expected playlistObj object created using parseManifest api.'
      );
    }

    if (
      !languagesToPreserve ||
      !Array.isArray(languagesToPreserve) ||
      languagesToPreserve.length == 0
    ) {
      throw new Error(
        'HLSParser: removeSubtitleRenditionsByLanguage api failed - Empty list of languages to preserve, expected non-empty list of languages to preserve.'
      );
    }

    let isSubtitleRenditionRemoved = false;

    try {
      const numOfVariantsInManifest = playlistObj.variants.length;
      for (let j = 0; j < numOfVariantsInManifest; j++) {
        let k = 0;
        let numOfSubtitleRenditions = playlistObj.variants[j].subtitles.length;
        while (k < numOfSubtitleRenditions) {
          if (
            languagesToPreserve.indexOf(
              playlistObj.variants[j].subtitles[k].language
            ) < 0
          ) {
            playlistObj.variants[j].subtitles.splice(k, 1);
            isSubtitleRenditionRemoved = true;
            numOfSubtitleRenditions--;
          } else {
            k++;
          }
        }
      }
    } catch (error) {
      throw new Error(
        `HLSParser: removeSubtitleRenditionsByLanguage api failed - ${
          (error as Error).message
        }`
      );
    }

    return isSubtitleRenditionRemoved;
  }

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
  static insertAuxiliaryContent(
    primaryPlaylistObj: any,
    bumpersList: AbstractTypes.Bumper[] | null
  ) {
    if (!primaryPlaylistObj) {
      throw new Error(
        'HLSParser: insertAuxiliaryContent api failed - Empty primaryPlaylistObj object, expected primaryPlaylistObj object created using parseManifest api.'
      );
    }

    if (
      !bumpersList ||
      !Array.isArray(bumpersList) ||
      bumpersList.length == 0
    ) {
      throw new Error(
        'HLSParser: insertAuxiliaryContent api failed - Empty bumpers list, expected non-empty list of bumpers.'
      );
    }

    try {
      const bumpersListSize = bumpersList.length;
      let k = 0;
      let auxContentPosInPrimPlaylistArr = [];
      let elapsedSeconds;
      let primPlaylistCurrSegment;
      let auxContentPosInPrimPlaylist;

      // sort the bumpersList by afterSeconds in ascending order
      bumpersList.sort((a, b) => a.afterSeconds - b.afterSeconds);

      /**
       * Iterating list of bumpers to find absolute position of each
       * bumper in primary playlist
       */
      elapsedSeconds = 0;
      primPlaylistCurrSegment = 0;
      auxContentPosInPrimPlaylist = 0;
      for (let i = 0; i < bumpersList.length; ++i) {
        const bumper = bumpersList[i];
        // CASE: bumper is pre-roll
        if (bumper.afterSeconds == 0) {
          // reinitializing it to 0 to support multiple instances of
          // pre-roll content
          auxContentPosInPrimPlaylist = 0;
          auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;
          primaryPlaylistObj.segments[0].discontinuity = true;

          // CASE: bumper is mid-roll
        } else if (
          bumper.afterSeconds > 0 &&
          bumper.afterSeconds < Number.MAX_VALUE
        ) {
          let segment;
          for (
            let j = primPlaylistCurrSegment;
            j < primaryPlaylistObj.segments.length;
            ++j
          ) {
            segment = primaryPlaylistObj.segments[j];
            if (elapsedSeconds >= bumper.afterSeconds) {
              break;
            }
            elapsedSeconds += segment.duration;
            auxContentPosInPrimPlaylist++;
            primPlaylistCurrSegment++;
          }
          // this handles the case when afterSeconds value of corresponding
          // bumper is greater than the complete primary playlist playback
          if (primPlaylistCurrSegment !== primaryPlaylistObj.segments.length)
            segment.discontinuity = true;
          auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;

          // CASE: bumper is post-roll i.e bumper.afterSeconds == 0
        } else if (bumper.afterSeconds == Number.MAX_VALUE) {
          auxContentPosInPrimPlaylist = primaryPlaylistObj.segments.length;
          auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;
        }
      }

      /**
       * Initializing discontinuity attribute of first segment of each
       * bumper as true. This ensures that beginning of aux content has
       * EXT-X-DISCONTINUITY inserted
       */
      for (const key in bumpersList) {
        const bumper = bumpersList[key];
        bumper.auxContentRespBodyObj.segments[0].discontinuity = true;
      }

      /**
       * Inserting each bumper at absolute position calculated above
       */
      let auxCntSegListLen = 0;
      for (let i = 0; i < bumpersListSize; i++) {
        auxContentPosInPrimPlaylistArr[i] += auxCntSegListLen;
        primaryPlaylistObj.segments.splice(
          auxContentPosInPrimPlaylistArr[i],
          0,
          ...bumpersList[i].auxContentRespBodyObj.segments
        );
        auxCntSegListLen +=
          bumpersList[i].auxContentRespBodyObj.segments.length;
      }
    } catch (error) {
      throw new Error(
        `HLSParser: insertAuxiliaryContent api failed - ${
          (error as Error).message
        }`
      );
    }
  }
}
