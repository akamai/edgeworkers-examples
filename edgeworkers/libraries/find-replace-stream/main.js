/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 1.1
Purpose:  Modify an HTML streamed response by replacing a text string two times across the entire response.

*/

import { ReadableStream, WritableStream } from 'streams'
import { httpRequest } from 'http-request'
import { createResponse } from 'create-response'
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform'
import { FindAndReplaceStream } from 'find-replace-stream.js'

export function responseProvider(request) {

	//Get text to be searched for and new replacement text from Property Manager variables in the request object.
	const tosearchfor =  request.getVariable('PMUSER_EWSEARCH');
	const newtext =  request.getVariable('PMUSER_EWNEWTEXT');
    //Set to 0 to replace all, otherwise a number larger than 0 to limit replacements
    const howManyReplacements = 3;
    
    return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(response => {
        return createResponse(
            response.status,
            response.headers,
            response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new FindAndReplaceStream(tosearchfor, newtext, howManyReplacements)).pipeThrough(new TextEncoderStream())
        )
    })
}


