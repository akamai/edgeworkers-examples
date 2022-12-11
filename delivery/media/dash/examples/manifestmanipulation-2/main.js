import { logger } from 'log';
import { DashParser } from './media-delivery-dash-parser.js';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from "url-search-params";
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { TransformStream } from 'streams';

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
      const mpdJson = DashParser.getJSON();
      let keyValuePairs = new URLSearchParams(request.query);
      if(keyValuePairs.has('br_in_range') === true) {
        const bws = keyValuePairs.get('br_in_range');
        const bws_array = bws.split(",");
        dashParser.filterVariantsByBandwidth(mpdJson, bws_array);
      }
      if (keyValuePairs.has('br_in')) {
        const bws = keyValuePairs.get('br_in');
        const bws_array = bws.split(",");
        dashParser.filterVariantsByBandwidth(mpdJson,bws_array);
      }

      if (keyValuePairs.has('rs_device')){
        const resolution = keyValuePairs.get('rs_device');
        dashParser.filterVariantsByResolution(mpdJson,resolution);
      }

      if (keyValuePairs.has('rs_element') && keyValuePairs.has('rs_index')) {
        const resolution = keyValuePairs.get('rs_element');
        const index = keyValuePairs.get('rs_index');
        dashParser.updateVariantAtIndex(mpdJson, resolution,index );
      }

      if (keyValuePairs.has('rs_order')) {
        const resolutions = keyValuePairs.get('rs_order');
        const resolutions_array = resolutions.split(",");
        dashParser.updateVariants(mpdJson, resolutions_array);
      }

      if (keyValuePairs.has('lo_geo') === true) {
        const langs = keyValuePairs.get('lo_geo');
        const langs_array = (langs && langs.split(',')) || [];
        dashParser.filterVariantsByAudioLanguage(mpdJson, langs_array);
        dashParser.filterVariantsBySubtitlesLanguage(mpdJson, langs_array);
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
    return httpRequest(`${request.scheme}://${request.host}${request.path}`).then(response => {
      return createResponse(
        response.status, {},
        response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new DashManifestManipulation(request)).pipeThrough(new TextEncoderStream())
      );
    });
  }catch(err){
    logger.log("D-RP: %s",err.error);
    return Promise.resolve(createResponse(500,{},err.error));
  }
}