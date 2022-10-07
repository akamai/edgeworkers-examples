import { EdgeKV } from './edgekv.js';

// Initialize EdgeKV library
const edgeKv_products = new EdgeKV({namespace: "default", group: "url-redirects"});

// Regex to match URL
const URL_REGEX = /\/sku\/(?<sku>[a-zA-Z0-9]+)\/(?<suffix>.*)/;

export async function onClientRequest(request) {
    let regexMatch = request.url.match(URL_REGEX);

    // If regex matches URL, generate redirect
    if (regexMatch) {
        let sku = regexMatch.groups.sku;

        // Load product data from EdgeKV
        let productData = await edgeKv_products.getJson({ item: sku});
        if (productData) {
            //Construct new URL, using product tag stored in EdgeKV
            let newUrl = `/products/${productData.tag}/${regexMatch.groups.suffix}`
            
            //Respond with 301 redirect
            request.respondWith (301, {location:[newUrl]}, "");
        }
    }
}
