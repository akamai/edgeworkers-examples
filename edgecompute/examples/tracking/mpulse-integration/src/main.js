import { httpRequest } from 'http-request';
import { logger } from 'log';

// mPulse App
const API_KEY = 'YOUR API KEY';
const DOMAIN = 'YOUR DOMAIN';
const RTT_INDEX = '0'; // YOUR CUSTOM TIMER INDEX FOR ROUND TRIP TIME
const TAT_INDEX = '1'; // YOUR CUSTOM TIMER INDEX FOR TURNAROUND TIME
const DEVICE_INFO = 'brand'; // YOUR CUSTOM DIMENSION FOR DEVICE INFO
const GEO = 'city'; // YOUR CUSTOM DIMENSION FOR GEO LOCATION
const STATUS = 'status'; // YOUR CUSTOM DIMENSION FOR STATUS CODE
const PAGEGROUP = 'top'; // YOUR PAGE GROUP

export async function onClientRequest(request) {
    // Mark Timer on PM Variable during onClientRequest
    const reqStartTime = Date.now();
    request.setVariable('PMUSER_REQSTART', reqStartTime);
}

export async function onClientResponse(request, response) {
    // Get Device Info, City, and Status Code
    const brand = request.device.brandName;
    const city = request.userLocation.city;
    const responseCode = response.status;

    httpRequest(`https://c.go-mpulse.net/api/config.json?key=${API_KEY}&d=${DOMAIN}`)
        .then((responseConfig) => {
            if (!responseConfig.ok) {
                logger.log("Failed to get config");
                return;
            }

            // Extract mPulse Config
            responseConfig.json().then((configData) => {
                const { beacon_url: beaconFqdn, 'h.t': timestamp, 'h.cr': token } = configData;
                const timestampEnd = Number(timestamp) + 10000;
                // Create mPulse Base Send Beacon URL
                const baseurl = `https:${beaconFqdn}?api=1&api.v=1&h.key=${API_KEY}&h.d=${DOMAIN}&h.pg=${PAGEGROUP}&h.cr=${token}&h.t=${timestamp}&rt.end=${timestampEnd}&rt.start=manual&`;
                // GET PERFORMANCE DATA
                const RTT = request.getVariable('PMUSER_RTT');
                const reqEndTime = Date.now();
                const reqStartTime = request.getVariable('PMUSER_REQSTART');
                const customTAT = reqEndTime - reqStartTime;
                // Construct mPulse Send Beacon URL
                const beaconUrlParams = `${baseurl}t_other=custom${RTT_INDEX}|${RTT},custom${TAT_INDEX}|${customTAT}&t_done=1&cdim.${DEVICE_INFO}=${brand}&cdim.${GEO}=${city}&cdim.${STATUS}=${responseCode}`;
                logger.log(beaconUrlParams);

                // Send Beacon
                send(beaconUrlParams);
            });
        })
        .catch((error) => {
            logger.log(`Error: ${error.message}`);
        });
}

function send(url) {
    httpRequest(url)
        .then((response) => {
            if (!response.ok) {
                logger.log("Failed to send beacon");
            }
        })
        .catch((error) => {
            logger.log(`Error: ${error.message}`);
        });
}
