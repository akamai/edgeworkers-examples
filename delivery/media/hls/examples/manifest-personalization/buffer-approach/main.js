import { logger } from 'log';
import { hls } from './hls.js';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from "url-search-params";

export async function responseProvider (request) {
  const response = await httpRequest(`${request.scheme}://${request.host}${request.path}`);
  const responseBody = await response.text();
  let keyValuePairs = new URLSearchParams(request.query);

  try {
    /**
     * parse manifest response body
     */
    let playlistObject = hls.parseManifest(responseBody);

    /**
     * Bitrate Filtering
     */
    if (keyValuePairs.has('br_in') === true) {
      let bitrate = keyValuePairs.get("br_in");
      let bitrates = bitrate.split(',');
      hls.removeVariantsByBitrate(playlistObject, bitrates);
    }

    if (keyValuePairs.has('br_in_range') === true) {
      let bitrate_range = keyValuePairs.get("br_in_range");
      hls.removeVariantsByBitrate(playlistObject, bitrate_range);
    }
  
    /**
     * Resolution Filtering
     */
    if (keyValuePairs.has('rs_device') === true) {
      let maxSupportedResolution = "416x234";
      hls.removeVariantsByResolution(playlistObject, maxSupportedResolution);
    }

    /**
     * Resolution Reordering
     */
    if (keyValuePairs.has('rs_order') === true) {
      let resolutions = [ "640x360", "1280x720" ];
      hls.updateVariantsAtIndex(playlistObject, resolutions);
    }

    /**
     * Language Localization
     */
    if (keyValuePairs.has('lo_geo') === true) {
      hls.removeAudioRenditionsByLanguage(playlistObject, 'fre');
      hls.removeSubtitleRenditionsByLanguage(playlistObject, 'fra');
    }

    const modifiedResponseBody = hls.populateManifest(playlistObject);

    return createResponse(
      response.status,
      response.headers,
      modifiedResponseBody
    );
  // log & handle exception
  } catch (error) {
    logger.log('D:error=%s', error.message);
    return createResponse (
      400,
      response.headers,
      JSON.stringify({ error: error.message })
    );
  }
}