/*
(c) Copyright 2024 Akamai Technologies, Inc. Licensed under Apache 2 license.
Purpose:  Block by IP address
*/

import { blockedIPs } from './ipList.js';

export async function onClientRequest(request) {
    if (blockedIPs.includes(request.clientIp)) {
        request.respondWith(
            403, 
            { 'Content-Type': ['application/json;charset=utf-8'] }, 
            '{}', 
            'Denied Response'
        );
    }
}
