import { logger } from 'log';
import { DashParser } from './media-delivery-dash-parser.js';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import URLSearchParams from "url-search-params";
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { ReadableStream, WritableStream } from 'streams';

class DashManifestManipulation{
    constructor (bumperObjectList,dashParser) {
        logger.log("dash bumper insertion");
        let readController = null;
        this.readable = new ReadableStream({
            start (controller) {
                readController = controller;
            }
        });
        // It buffers all the chunks & processes in the end
        let responseBody = '';

        async function processStream(buffer, done) {
            // If EOF we process the buffer & write the modified buffer
            if (done) {
                dashParser.parseMPD(responseBody);
                const mpdJson = dashParser.getJSON();
                logger.log("parsing successful");
                dashParser.bumperInsertion(mpdJson,bumperObjectList);
                const modifiedResponseBody = dashParser.stringifyMPD();
                write(modifiedResponseBody);
                return;
            }
            responseBody = responseBody + buffer;
        }
        let write = function (msg) { readController.enqueue(`${msg}`);};
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

export function onClientRequest (request) { }

export function onClientResponse (request, response) {
    response.setHeader(`Request Parameters: scheme:${request.scheme}://${request.host}/hls-clear/rkalra/sample/bumper/TOS/dash/source.mpd`);
}
export async function responseProvider (request) {
    let afterArr = []; let afterArrIndex = 0;
    let bumperObjectList = [];
    let keyValuePairs = new URLSearchParams(request.query);
    let dashParser = new DashParser();

    let bumper1RequestUrl,bumper1Response,bumper1ResponseBody,bumper1ResponseBodyObject;
    if (keyValuePairs.has('ad1') === true) {
        bumper1RequestUrl = `${request.scheme}://${request.host}/hls-clear/rkalra/sample/bumper/TOS/dash/bumper.mpd?cns=1`;
        bumper1Response = await httpRequest(bumper1RequestUrl);
        bumper1ResponseBody = await bumper1Response.text();
        dashParser.parseMPD(bumper1ResponseBody);
        bumper1ResponseBodyObject = dashParser.getJSON();
        const bumper = {responseBodyObject: bumper1ResponseBodyObject, afterSeconds: parseInt(keyValuePairs.get('ad1'))};
        bumperObjectList.push(bumper);
    }

    let bumper2RequestUrl, bumper2Response,bumper2ResponseBody,bumper2ResponseBodyObject;
    if (keyValuePairs.has('ad2') === true) {
        bumper2RequestUrl = `${request.scheme}://${request.host}/hls-clear/rkalra/sample/bumper/TOS/dash/cola.mpd?cns=1`;
        bumper2Response = await httpRequest(bumper2RequestUrl);
        bumper2ResponseBody = await bumper2Response.text();
        dashParser.parseMPD(bumper2ResponseBody);
        bumper2ResponseBodyObject = dashParser.getJSON();
        const bumper = {responseBodyObject: bumper2ResponseBodyObject, afterSeconds: parseInt(keyValuePairs.get('ad2'))};
        bumperObjectList.push(bumper);
    }
    let bumper3RequestUrl, bumper3Response,bumper3ResponseBody,bumper3ResponseBodyObject;
    if (keyValuePairs.has('ad3') === true) {
        bumper3RequestUrl = `${request.scheme}://${request.host}/hls-clear/rkalra/sample/bumper/TOS/dash/bumper.mpd?cns=1`;
        bumper3Response = await httpRequest(bumper3RequestUrl);
        bumper3ResponseBody = await bumper3Response.text();
        dashParser.parseMPD(bumper3ResponseBody);
        bumper3ResponseBodyObject = dashParser.getJSON();
        const bumper = {responseBodyObject: bumper3ResponseBodyObject, afterSeconds: parseInt(keyValuePairs.get('ad3'))};
        bumperObjectList.push(bumper);
    }
    logger.log("bumperObjectList",bumperObjectList.length);
    const primaryResponse = await httpRequest(`${request.scheme}://${request.host}${request.path}`);
    return createResponse(
        primaryResponse.status,
        {},
        primaryResponse.body.pipeThrough(new TextDecoderStream()).pipeThrough(new DashManifestManipulation(bumperObjectList,dashParser)).pipeThrough(new TextEncoderStream())
    );

}