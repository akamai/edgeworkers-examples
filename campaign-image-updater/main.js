/*
Version: 1.0
Purpose:  Use EdgeKV to look for a value containing an Image and Video Manager transformation. 
          If exists, apply it to all the images in the html file.
*/

import { ReadableStream, WritableStream, TransformStream } from 'streams';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import URLSearchParams from 'url-search-params';
import { EdgeKV } from './edgekv.js';


/**
 * Updates all images adding a query string containing an imQuery command
 */
class ImageAutomateStream {
  constructor(command) {
    const TAG_START = '<img';
    const TAG_END_REGEX = '\>';
    const TAG_ATTR_START = 'src=';
    const TAG_ATTR_REGEX = /"\s*([^"\s]+)\s*"/;

    let controller = null;
    let buffer = null;

    const handleReq = async (text) => {
      try {
        if (!command) {
          controller.enqueue(text);
          return;
        }

        let content = '';
        if (buffer) {
          text = buffer + text;
          buffer = null;
        }
        let position;
        while ((position = text.indexOf(TAG_START)) != -1) {
          content += text.substring(0, position);
          text = text.substring(position);
          // Get img tag
          const matchit = text.match(TAG_END_REGEX);
          if (matchit) {
            // Complete tag in this chunk
            let img = text.substring(0, matchit.index + 1);
            let pos_src;
            if ((pos_src = img.indexOf(TAG_ATTR_START)) != -1) {
              const source = img.substring(pos_src + TAG_ATTR_START.length).match(TAG_ATTR_REGEX);
              if (source && source.length > 1) {
                let src = source[1];
                src += (src.indexOf('?') == -1) ? `?${command}` : `&${command}`;
                // Replace source value with the new one with command
                img = img.replace(TAG_ATTR_REGEX, `"${src}"`);
              }
            }
            content += img;
            text = text.substring(matchit.index + 1);
          }
          else {
            // Tag is not complete in this chunk
            buffer = text;
            text = '';
          }
        }
        if (text) {
          if (text.length >= TAG_START.length) {
            buffer = text.substring(text.length - TAG_START.length);
            text = text.substring(0, text.length - TAG_START.length);
            content += text;
          }
          else {
            buffer = text;
          }
        }
        controller.enqueue(content);
      }
      catch (error) {
        controller.enqueue(`<!-- ERROR (ImageAutomateStream): ${error} -->`);
      }
    };

    this.readable = new ReadableStream({
      start(c) {
        controller = c;
      }
    });

    let completeProcessing = Promise.resolve();
    this.writable = new WritableStream({
      write(text) {
        completeProcessing = handleReq(text);
      },
      close() {
        if (buffer) {
          controller.enqueue(buffer);
        }
        completeProcessing.then(_ => controller.close());
      }
    });
  }
}


/**
 * Look for the imQuery command
 */
const getCommand = async () => {
  try {
    const edgeKv = new EdgeKV({ namespace: "test-para", group: "campaigns" });
    return edgeKv.getText({ item: 'bf2020', default_value: null });
  }
  catch (error) {
    return null;
  }
};


export async function responseProvider(request) {
  const params = new URLSearchParams(request.query);
  const doNotApply = params.get('skip-ew');
  const command = await getCommand(); 

  return httpRequest(`${request.scheme}://${request.host}/${request.path}`).then(response => {
    let body = response.body;
    if (command && !doNotApply) {
      body = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new ImageAutomateStream(command))
        .pipeThrough(new TextEncoderStream());
    }

    return createResponse(
      response.status,
      response.headers,
      body
    );
  });
}
