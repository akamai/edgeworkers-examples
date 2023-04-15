import { logger } from 'log';
import { DashParser } from './dashparser/media-delivery-dash-parser';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from "url-search-params";
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { ReadableStream, WritableStream } from 'streams';

const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade', 'host'];

function getSafeResponseHeaders(headers:any) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
    if (unsafeResponseHeader in headers) {
      delete headers[unsafeResponseHeader];
    }
  }
  return headers;
}
class DashManifestManipulation{
  readable:ReadableStream;
  writable:WritableStream;
  constructor (request : any) {
    let readController : any;
    this.readable = new ReadableStream({
      start: function (controller) {
        readController = controller;
      }
    });
    // It buffers all the chunks & processes in the end
    let responseBody = '';

    async function processStream(buffer:any, done:any) {
      // If EOF we process the buffer & write the modified buffer
      if (done) {
        const dashParser = new DashParser();
        dashParser.parseMPD(responseBody);
        const mpdJson = dashParser.getJSON();
        logger.log("mpdJson : %s",mpdJson);
        const keyValuePairs = new URLSearchParams(request.query);
        if(keyValuePairs.has('br_in_range') === true) {
          const bws = keyValuePairs.get('br_in_range');
          const bws_array = bws && bws.split(",");
          dashParser.filterRepresentationsByBandwidth(mpdJson, bws_array as Array<string>);
        }
        if (keyValuePairs.has('br_in')) {
          const bws = keyValuePairs.get('br_in');
          const bws_array = bws && bws.split(",");
          dashParser.filterRepresentationsByBandwidth(mpdJson,bws_array as Array<string>);
        }

        if (keyValuePairs.has('rs_device')){
          const resolution = keyValuePairs.get('rs_device');
          dashParser.filterRepresentationsByResolution(mpdJson,resolution as string);
        }

        if (keyValuePairs.has('rs_element') && keyValuePairs.has('rs_index')) {
          const resolution = keyValuePairs.get('rs_element');
          const index = parseInt(<string>keyValuePairs.get('rs_index'),10);
          dashParser.updateRepresentationAtIndex(mpdJson, resolution as string, index as number);
        }

        if (keyValuePairs.has('rs_order')) {
          const resolutions = keyValuePairs.get('rs_order');
          const resolutions_array = resolutions && resolutions.split(",");
          dashParser.updateRepresentations(mpdJson, resolutions_array as Array<string>);
        }

        if (keyValuePairs.has('lo_geo') === true) {
          const langs = keyValuePairs.get('lo_geo');
          const langs_array = (langs && langs.split(',')) || [];
          dashParser.filterAdaptationSetsByAudioLanguage(mpdJson, langs_array as Array<string>);
          dashParser.filterAdaptationSetsBySubtitlesLanguage(mpdJson, langs_array as Array<string>);
        }
        const mpdXml =  dashParser.stringifyMPD();
        write(mpdXml);
        return;
      }
      responseBody = responseBody + buffer;
    }
    const write = function (msg : any) { readController.enqueue(`${msg}`);};
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

export function responseProvider (request: EW.ResponseProviderRequest) {
  try {
    let req_headers = request.getHeaders();
    delete req_headers["host"];
    return httpRequest(`${request.scheme}://${request.host}${request.path}`,{headers: req_headers}).then((response: any) => {
      return createResponse(
        response.status, getSafeResponseHeaders(response.getHeaders()),
        response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new DashManifestManipulation(request)).pipeThrough(new TextEncoderStream())
      );
    });
  }catch(err : any){
    logger.log("D-RP: %s",err.error);
    return Promise.resolve(createResponse(500,{},err.error));
  }
}