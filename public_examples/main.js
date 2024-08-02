/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.
Version: 0.1
Purpose:  Respond with empty JSON if cart cookie not part of request.
*/
import { EdgeKV } from "./edgekv.js";
import { Rule, defaultEngine, Operator } from "js-rules-engine";
import { logger } from "log";

init();


function init() {
  const caseInsensitivelyEquals = new Operator(
    "caseInsensitivelyEquals",
    function (a, b) {
      return a.toUpperCase() === b.toUpperCase();
    }
  );
  
  defaultEngine.addOperator(caseInsensitivelyEquals);

}


export async function responseProvider(request) 
{
  //logger.log(`In responseProvider function request - ${JSON.stringify(decodeURI(request))}`);
  try 
  {
    const edgeKv = new EdgeKV({ namespace: "edgekv-token-test", group: "1111" });
    logger.log('responseProvider function edgeKv: ', edgeKv);
  }catch(error){
    logger.log('responseProvider function error: ', error);
  }
}
