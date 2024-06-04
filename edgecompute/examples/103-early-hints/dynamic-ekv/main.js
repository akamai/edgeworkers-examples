import { EdgeKV } from './edgekv.js'; //You need to add the helper library https://techdocs.akamai.com/edgekv/docs/library-helper-methods
const PMUSER_103_LIST='PMUSER_103_LIST';
const edgeKv = new EdgeKV({group: "earlyHints"});

export async function onClientRequest(request){
    if(isEarlyHintsAllowed(request)){
      try {
        let data = await edgeKv.getText({item:'103_list'});
        if(data!=''){
            request.setVariable(PMUSER_103_LIST,data); //Check size limits https://techdocs.akamai.com/edgeworkers/docs/request-object#setvariable
        }
      }
    }
}
