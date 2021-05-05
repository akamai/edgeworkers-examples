import { Cookies, SetCookie } from 'cookies';
import { logger } from 'log';
import { EdgeKV } from './edgekv.js';
const default_path = "ekv_experience/default";
const edgeKv_abpath = new EdgeKV({namespace: "default", group: "abpath"});

export async function onClientRequest(request) {
    let cookies = new Cookies(request.getHeader('Cookie'));
    let bucketCookie = cookies.get('bucket-id');
    let requestUrl = request.url.toLowerCase();
    let bucket_id = getBucketId(bucketCookie);
    let abpath = await getBucketABPath(bucket_id);
    let redir_path = getRedirect(abpath, requestUrl);

    request.setVariable('PMUSER_EKV_ABTEST_EW', bucket_id);
    request.route({
        origin: request.host,
        path: redir_path,
    });
}

export function onClientResponse(request, response) {
    // Retrieve the bucket_id from PMUSER var
    let bucket_id = request.getVariable('PMUSER_EKV_ABTEST_EW');
    if (!bucket_id) {
        bucket_id = randBucket(); // Should not happen!
    }
    // Set bucket_id in cookie with 7 day expiry (A/B selections stickiness)
    let expDate = new Date();
    expDate.setDate(expDate.getDate() + 7);
    let setBucketCookie = 
        new SetCookie({name: "bucket-id", value: bucket_id, expires: expDate});
    response.addHeader('Set-Cookie', setBucketCookie.toHeader());
}

function getRedirect(abpath, req_url) {
    let relpath = '/' + abpath + '/';
    return req_url.toLowerCase().replace("/edgekv/abtest", relpath);
}

function randBucket() {
    let x = Math.random();
    if (x < 0.5){
        return 'A';
    }
    else {
        return 'B';
    }
}

function getBucketId(bucket_cookie) {
    if (!bucket_cookie) {
        return randBucket();
    }
    // Return a random bucket if cookie is not set
    if (bucket_cookie.toUpperCase() == 'A') {
        return 'A';
    } else if (bucket_cookie.toUpperCase() == 'B') {
        return 'B';
    } else {
        return randBucket();
    }
}

async function getBucketABPath(bucket_id) {
    // If we do not have a valid bucket, we will default to the following
    if (!bucket_id) {
        return default_path;
    }
    let path = null;
    let err_msg = "";
    // Retrieve the path associated with the bucket from EdgeKV
    try {
        path = await edgeKv_abpath.getText({ item: bucket_id.toUpperCase(), default_value: default_path });
    } catch (error) {
        // Catch the error and log the error message 
        err_msg = error.toString();
        logger.log("ERROR: " + 
                encodeURI(err_msg).replace(/(%20|%0A|%7B|%22|%7D)/g, " "));
        path = null;
    }
    if (!path) {
        path = default_path;
    }
    return path;
}
