import { HLS } from './hls.js';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from "url-search-params";
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { ReadableStream, WritableStream } from 'streams';

const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'];

function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
    if (unsafeResponseHeader in headers) {
      delete headers[unsafeResponseHeader];
    }
  }
  return headers;
}

class HlsStreamAndBufferApproach {
  constructor (request) {
    let readController = null;
    this.readable = new ReadableStream({
      start (controller) {
        readController = controller
      }
    });

    // Write adds '\n'
    let write = function (msg) { readController.enqueue(`${msg}\n`);};

    // It buffers all the chunks & processes in the end
    let responseBody = '';

    async function processStream(buffer, done) {
      // If EOF we process the buffer & write the modified buffer
      if (done) {

        // parse requested manifest
        let playlistObject = HLS.parseManifest(responseBody);
        let keyValuePairs = new URLSearchParams(request.query);

        /**
         * Bitrate Filtering with individual bitrates
         */
        if (keyValuePairs.has('br_in') === true) {
          let bitrate = keyValuePairs.get("br_in");
          // parse value of br_in & assign it to bitrates
          let bitrates = bitrate.split(',');
          HLS.preserveVariantsByBitrate(playlistObject, bitrates);
        }

        /**
         * Bitrate Filtering with range of bitrates
         */
        if (keyValuePairs.has('br_in_range') === true) {
          let bitrate_range = keyValuePairs.get("br_in_range");
          // parse value of br_in_range & assign it to bitrates
          let bitrates = bitrate_range.split(',');
          HLS.preserveVariantsByBitrate(playlistObject, bitrates);
        }
      
        /**
         * Resolution Filtering
         */
        let maxSupportedResolution;
        // get max supported resolution from request.device object
        if (request.device.resolutionWidth && request.device.resolutionHeight) {
          maxSupportedResolution = request.device.resolutionWidth + 'x' + request.device.resolutionHeight;
          HLS.preserveVariantsByResolution(playlistObject, maxSupportedResolution);
        } else {
          //default resolution
          maxSupportedResolution = '1920x1080';
          HLS.preserveVariantsByResolution(playlistObject, maxSupportedResolution);
        }
        
        /**
         * Resolution Reordering
         */
        if (keyValuePairs.has('rs_order') === true) {
          // parse values of rs_order(i.e 1280x720,640x360) & assign it to resArray
          let rs_order = keyValuePairs.get("br_in_range");
          let resArray = rs_order.split(',');
          HLS.updateResolutionOrder(playlistObject, resArray);
        }

        /**
         * Language Localization
         */
        // get language to localize the manifest using User Location Object
        let language = request.userLocation.country.toLowerCase();
        if (!language) {
          language = 'fr';
        }
        // filter audio and subtitle as per languages
        HLS.preserveAudioRenditionsByLanguage(playlistObject, [language]);
        HLS.preserveSubtitleRenditionsByLanguage(playlistObject, [language]);

        /**
         * populate personalized manifest
         */
        const modifiedResponseBody = HLS.stringifyManifest(playlistObject);

        write(modifiedResponseBody);
        return;
      }

      responseBody = responseBody + buffer;
    }

    let completeProcessing = Promise.resolve();
    this.writable = new WritableStream({
      write (text) {
        completeProcessing = processStream(text, false);
      },
      close () {
        processStream('', true); // Signaling EOS
        completeProcessing.then(() => readController.close());
      }
    });
  }
}

export async function responseProvider (request) {
  var req_headers = request.getHeaders();
  delete req_headers["host"];
  return  httpRequest(`${request.scheme}://${request.host}${request.path}`, {headers: req_headers}).then(response => {
    return createResponse(
      response.status,
      getSafeResponseHeaders(response.getHeaders()),
      response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new HlsStreamAndBufferApproach(request)).pipeThrough(new TextEncoderStream())
    );
  });
}