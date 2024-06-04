import { httpRequest } from 'http-request';
const PMUSER_103_HINTS='PMUSER_103_HINTS';
const OPTIONS={timeout:50}; //Cancel Early hints when subrequest takes too long

export async function onClientRequest(request){
    if(isEarlyHintsAllowed(request)){
      try {
        let apiResponse = await httpRequest('https://www.yourdomain.com/api/listofresources',OPTIONS); //Cache+Extreme Prefresh for fast delivery and quick updates
        if(apiResponse.status==200){
            let data = await apiResponse.text();
            request.setVariable(PMUSER_103_HINTS,data); //Check size limits https://techdocs.akamai.com/edgeworkers/docs/request-object#setvariable
        }
      }
    }
}
