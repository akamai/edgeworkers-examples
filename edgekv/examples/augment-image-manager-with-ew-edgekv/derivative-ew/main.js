import {EdgeKV} from './edgekv.js'; //include this file from the parent repository. https://github.com/akamai/edgeworkers-examples/blob/master/edgekv/lib/edgekv.js
import {logger} from 'log';
export async function onClientRequest(request) {
	var edgeKv = new EdgeKV({namespace: "im", group: "pristine"});
	var size = 0;
	try {
		var key=request.getVariable('PMUSER_PATH_SHA1');
	   	var value=await edgeKv.getText({item: key}); 
	    if(value!==null){
	      size = value;
	    }
	} 
	catch (error) {
		logger.log(`EKV: ${error.message} - Key is: ${key}`);
	}
	request.setVariable('PMUSER_PRISTINE_SIZE', size);
}
