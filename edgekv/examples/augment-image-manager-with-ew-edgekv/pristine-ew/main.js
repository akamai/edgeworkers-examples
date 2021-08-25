import {EdgeKV} from './edgekv.js'; //include this file from the parent repository. https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js
import {logger} from 'log';
export function onClientResponse(request, response) {
	if (response.status === 200) {
    	var key=request.getVariable('PMUSER_PATH_SHA1');
    	var size=response.getHeader('Content-Length')[0];
    	var edgeKv = new EdgeKV({namespace: "im", group: "pristine"});
     	
	    edgeKv.putText({item: key, value: size})
    	.catch(
			error => logger.log(`EKV: ${error.message}`)
		);
	}
}
