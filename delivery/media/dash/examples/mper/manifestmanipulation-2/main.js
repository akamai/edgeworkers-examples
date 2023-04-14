import { logger } from 'log';
import { DashParser } from './media-delivery-dash-parser.js';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from "url-search-params";
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { TransformStream } from 'streams';

const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade', 'host'];

function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
    if (unsafeResponseHeader in headers) {
      delete headers[unsafeResponseHeader];
    }
  }
  return headers;
}

export class DashManifestManipulation extends TransformStream{
  constructor(request) {
    let manifestBuffer = '';
    function start() {
      logger.log("D-T:start");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
    function transform(chunk, controller){
      manifestBuffer += chunk;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function flush(controller) {
      const dashParser = new DashParser();
      dashParser.parseMPD(manifestBuffer);
      const mpdJson = dashParser.getJSON();
      let keyValuePairs = new URLSearchParams(request.query);
      if(keyValuePairs.has('br_in_range') === true) {
        const bws = keyValuePairs.get('br_in_range');
        const bws_array = bws.split(",");
        dashParser.filterRepresentationsByBandwidth(mpdJson, bws_array);
      }
      if (keyValuePairs.has('br_in')) {
        const bws = keyValuePairs.get('br_in');
        const bws_array = bws.split(",");
        dashParser.filterRepresentationsByBandwidth(mpdJson,bws_array);
      }

      if (keyValuePairs.has('rs_device')){
        const resolution = keyValuePairs.get('rs_device');
        dashParser.filterRepresentationsByResolution(mpdJson,resolution);
      }

      if (keyValuePairs.has('lo_geo') === true) {
        const langs = keyValuePairs.get('lo_geo');
        const langs_array = (langs && langs.split(',')) || [];
        dashParser.filterAdaptationSetsByAudioLanguage(mpdJson, langs_array);
        dashParser.filterAdaptationSetsBySubtitlesLanguage(mpdJson, langs_array);
      }
      const mpdXml =  dashParser.stringifyMPD();
      controller.enqueue(mpdXml);
      logger.log("D-T:flush");
    }

    super({ start, transform, flush: flush});
  }
}


export function responseProvider (request) {
  try {
    let req_headers = request.getHeaders();
    delete req_headers["host"];
    return httpRequest(`${request.scheme}://${request.host}${request.path}`, {headers: req_headers}).then(response => {
      return createResponse(
        response.status,
          getSafeResponseHeaders(response.getHeaders()),
        response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new DashManifestManipulation(request)).pipeThrough(new TextEncoderStream())
      );
    });
  }catch(err){
    logger.log("D-RP: %s",err.error);
    return Promise.resolve(createResponse(500,{},err.error));
  }
}