/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Policy structure accepted by LiveManifestTransformer class
/**
 * [{
      startDate: 'ISO 8601 date',
      endDate:  'ISO 8601 date',
      content:  'URL or valid m3u8 contennt in utf8 encoded'
    }];
 */
// Example
/**
 * [{
      startDate: '2022-06-26T08:37:31.553+01:00',
      endDate:  '2022-06-26T08:37:37.553+01:00'),
      content:  'https://dash-license.westus.cloudapp.azure.com/Slate/Slate734s/Playlist_320x180.m3u8'
    },
    { startDate: '2022-06-26T08:37:15.553+01:00',
      endDate:   '2022-06-26T08:37:23.553+01:00',
      content:  '#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-TARGETDURATION:3...'
    }];
 */

import { createResponse } from 'create-response';
import { httpRequest } from 'http-request';
import { logger } from 'log';
import { TextDecoderStream, TextEncoderStream } from 'text-encode-transform';
import { TransformStream } from 'streams';
import { LiveManifestTransformer} from './hls.js';

const startDate = '2022-08-17T15:07:30.000Z';
const endDate = '2022-08-17T15:07:50.000Z';

const startDate1 = '2022-08-17T15:08:30.000Z';
const endDate1 = '2022-08-17T15:08:50.000Z';

// In this example the video policy is hardcoded.
// You can also load the policy from EdgeKV or Property Manager and filter the applicable policy based on the User Location Object.
const videoPolicy = [{
  "startDate": startDate,
  "endDate": endDate,
  "content":  `#EXTM3U
  #EXT-X-VERSION:6
  ## Generated with https://github.com/google/shaka-packager version v2.5.1-9f11077-release
  #EXT-X-TARGETDURATION:3
  #EXT-X-PLAYLIST-TYPE:VOD
  #EXT-X-MAP:URI="http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/init.mp4"
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0002.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0003.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0004.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0005.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0006.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0007.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0008.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0009.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0010.m4s
  #EXT-X-ENDLIST`
},
{
  "startDate": startDate1,
  "endDate": endDate1,
  "content":  `#EXTM3U
  #EXT-X-VERSION:6
  ## Generated with https://github.com/google/shaka-packager version v2.5.1-9f11077-release
  #EXT-X-TARGETDURATION:3
  #EXT-X-PLAYLIST-TYPE:VOD
  #EXT-X-MAP:URI="http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/init.mp4"
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0002.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0003.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0004.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0005.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0006.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0007.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0008.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0009.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/REPLACE-ME/seg_0010.m4s
  #EXT-X-ENDLIST`
}];

// In this example the audio policy is hardcoded.
//You can also load the policy from EdgeKV or Property Manager and filterthe applicable policy based on the User Location Object.
const audioPolicy = [{
  "startDate": startDate,
  "endDate": endDate,
  "content":  `#EXTM3U
  #EXT-X-VERSION:6
  ## Generated with https://github.com/google/shaka-packager version v2.5.1-9f11077-release
  #EXT-X-TARGETDURATION:3
  #EXT-X-PLAYLIST-TYPE:VOD
  #EXT-X-MAP:URI="http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/init.mp4"
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0002.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0003.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0004.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0005.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0006.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0007.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0008.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0009.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0010.m4s
  #EXT-X-ENDLIST`
},{
  "startDate": startDate1,
  "endDate": endDate1,
  "content":  `#EXTM3U
  #EXT-X-VERSION:6
  ## Generated with https://github.com/google/shaka-packager version v2.5.1-9f11077-release
  #EXT-X-TARGETDURATION:3
  #EXT-X-PLAYLIST-TYPE:VOD
  #EXT-X-MAP:URI="http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/init.mp4"
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0002.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0003.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0004.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0005.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0006.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0007.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0008.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0009.m4s
  #EXTINF:2.000,
  http://example-ew-hls-mper.akamaized.net/Slate/Slate734s/audio_en/seg_0010.m4s
  #EXT-X-ENDLIST`
}];

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

export class HlsProgramReplacementTranform extends TransformStream {
  constructor(policies) {
    //Load all the policies
    const hlsprogramtransformer = new LiveManifestTransformer(policies);
    let residual = '';
    function start(controller) {}
    function transform(chunk, controller) {
      residual += chunk;
    }
    function flush(controller) {
      //Perform replacement
      const data = hlsprogramtransformer.transform(residual);
      if (data.length > 0) {
        controller.enqueue(data);
      }

    }
    super({ start, transform, flush });
  }
}

export async function responseProvider(request) {
  var req_headers = request.getHeaders();
  delete req_headers["host"];
  try {
    if (request.url.includes('live.m3u8')) {
      // If request is for audio manifest, then use audio policy
      if (request.url.includes('audio_en')) {
        // Validate and marshal the policy in the format accepted by LiveManifestTransformer class.
        const inputPolicyPromise = LiveManifestTransformer.marshalPolicy(audioPolicy);
        // Kindly provide any auth related headers from original request if required by origin server
        let responsePromise = httpRequest(`https://${request.host}${request.url}`,{ headers: req_headers });
        let [inputPolicy, response] = await Promise.all([inputPolicyPromise, responsePromise]);
        return createResponse(
          response.status,
          {},
          response.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new HlsProgramReplacementTranform(inputPolicy))
            .pipeThrough(new TextEncoderStream())
        );

      } else {
        // If request is for video manifest, then use video policy.
        // The video policy used in this example is generic for all resolutions.
        // i.e Different resolution blackout slate playlist can be obtained by replacing REPLACE-ME with requested playlist resolution. Slate/Slate734s/REPLACE-ME/seg_0002.m4s
        // You can have a map that stores different blackout slate playlist based on policy.
        // Fetch resolution from requested playlist.
        const parts = request.url.split('/');
        for (const policy of videoPolicy){
          // Replace REPLACE-ME with correct URI file path. In this case the URI path contains resolution at REPLACE-ME position
          policy.content = policy.content.replace(/REPLACE-ME/gi, parts[parts.length -2]);
        }
        const inputPolicyPromise = LiveManifestTransformer.marshalPolicy(audioPolicy);
        // Kindly provide any auth related headers from original request if required by origin server.
        let responsePromise = httpRequest(`https://${request.host}${request.url}`,{ headers: req_headers });
        let [inputPolicy, response] = await Promise.all([inputPolicyPromise, responsePromise]);
        return createResponse(
          response.status,
          {},
          response.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new HlsProgramReplacementTranform(inputPolicy))
            .pipeThrough(new TextEncoderStream())
        );
      }
    } else {
      //other file requeest
      //You can also invoke EdgeWorkers only for media playlist and not for segment request using a Property Manager match rule.
      let response = await httpRequest(`https://${request.host}${request.url}`, { headers: req_headers });
      return createResponse(
        response.status,
        getSafeResponseHeaders(response.getHeaders()),
        response.body
      );
    }
  } catch (err) {
    logger.log('D-RP<ERROR>: %s', err.message);
    return Promise.resolve(createResponse(400, {}, err.message));
  }
}
