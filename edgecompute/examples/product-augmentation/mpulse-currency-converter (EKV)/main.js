/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
Purpose:  Convert multiple currencies to one to support mPulse
*/

import { ReadableStream, WritableStream } from "streams";
import { httpRequest } from "http-request";
import { createResponse } from "create-response";
import { TextEncoderStream, TextDecoderStream } from "text-encode-transform";
import URLSearchParams from "url-search-params";
import { EdgeKV } from "./edgekv.js";

const edgeKv = new EdgeKV({ namespace: "currencies", group: "code" }); //replace namespace and group values with your own

async function getCurrency(request) {
  //in this example the currency code from the purchase order is pulled from a query parameter
  let params = new URLSearchParams(request.query);
  let currencyCode = params.get("currency");
  let default_value = {value:1};

  let currencyValue = await edgeKv.getJson({
    item: currencyCode,
    default_value: default_value,
  });

  return currencyValue;
}

export async function responseProvider(request) {
  var finalCurrency = {value:1};
  try {
    finalCurrency = await getCurrency(request);
  } catch (error) {
    return error.toString();
  }

  class HTMLStream {
    constructor() {
      let readController = null;
      //in this example, the script added modifies the HTML (the div) to visualise that the conversion worked, but in a production system, this would be hidden from the user
      //the order value is pulled from the HTML
      var script =
        '<div id="normalized">	</div><script>' +
        'var ordervalue= document.getElementById("ordervalue").innerHTML;' +
        "var currency = ordervalue.slice(-3);" +
        "var amount = ordervalue.slice(0, -3);" +
        "var normalized =" +
        (finalCurrency.value || 0) +
        "*amount;" +
        'document.getElementById("normalized").innerHTML = "Normalized value = "+normalized +"EUR (derived from EdgeKV)";' +
        "</script>";

      const tag = "</body>";

      this.readable = new ReadableStream({
        start(controller) {
          readController = controller;
        },
      });

      async function handleTemplate(text) {
        const startIndex = text.indexOf(tag);
        if (startIndex === -1) {
          readController.enqueue(text);
        } else {
          readController.enqueue(text.substring(0, startIndex));
          readController.enqueue(script);
          readController.enqueue(text.substring(startIndex));
        }
      }

      let completeProcessing = Promise.resolve();

      this.writable = new WritableStream({
        write(text) {
          completeProcessing = handleTemplate(text, 0);
        },
        close(controller) {
          completeProcessing.then(() => readController.close());
        },
      });
    }
  }

  return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(
    (response) => {
      return createResponse(
        response.status,
        response.headers,
        response.body
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new HTMLStream(request))
          .pipeThrough(new TextEncoderStream())
      );
    }
  );
}
