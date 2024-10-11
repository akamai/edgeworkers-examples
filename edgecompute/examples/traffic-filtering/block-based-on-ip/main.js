import { blockedIPs } from './ipList.js';

export async function onClientRequest(request) {
    const clientIP = request.getVariable('PMUSER_IP');

    if (blockedIPs.includes(clientIP)) {
        request.respondWith(
            403, 
            { 'Content-Type': ['application/json;charset=utf-8'] }, 
            '{}', 
            'Denied Response'
        );
    }
}