import { EdgeKV } from './edgekv.js'; //You need to add the helper library https://techdocs.akamai.com/edgekv/docs/library-helper-methods
const PMUSER_103_HINTS='PMUSER_103_HINTS';
const edgeKv = new EdgeKV({group: "earlyHints"});

export async function onClientRequest(request){
      try {
        let data = await edgeKv.getText({item:'103_hints'});
        if(data!=''){
            request.setVariable(PMUSER_103_HINTS,data); //Check size limits https://techdocs.akamai.com/edgeworkers/docs/request-object#setvariable
        }
      }
}
