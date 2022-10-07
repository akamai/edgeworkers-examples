import { Cookies, SetCookie } from 'cookies';
import { logger } from 'log';
import { EdgeKV } from './edgekv.js';

const edgeKv_abpath = new EdgeKV({namespace: "vpanchak", group: "ab-data"});

export async function onClientRequest(request) {
    let abConfig = await edgeKv_abpath.getJson({ item: "ab-config"});

    let cookies = new Cookies(request.getHeader('Cookie'));
    let abVariant = cookies.get('ab-variant');

    if (!abVariant) {
        logger.log('choosing random variant');
        abVariant = getRandomVariant(abConfig)
    }

    request.addHeader(abConfig.forwardHeaderName, abVariant)

    request.setVariable('PMUSER_AB_VARIANT', abVariant);
    request.cacheKey.includeVariable('PMUSER_AB_VARIANT');

    logger.log('Variant: %s', abVariant);
}

export function onClientResponse(request, response) {
    let variantId = request.getVariable('PMUSER_AB_VARIANT');
    if (variantId) {
        let expDate = new Date();
        expDate.setDate(expDate.getDate() + 7);
        let setBucketCookie = new SetCookie({name: "ab-variant", value: variantId, expires: expDate});
        response.addHeader('Set-Cookie', setBucketCookie.toHeader());
    }
}

function getRandomVariant(abConfig){
    let variantsArr = [];
    let cumulativeWeight = 0;
    for (let variantId in abConfig.variants) {
        let variant = abConfig.variants[variantId];
        cumulativeWeight += variant.weight;
        variantsArr.push({id: variantId, cumulativeWeight: cumulativeWeight});
    }
    var random = Math.random() * cumulativeWeight;
    let chosenVariant;
    for (let weightedVariant of variantsArr) {
        if (random < weightedVariant.cumulativeWeight) {
            chosenVariant = weightedVariant.id;
            break;
        }
    }
    return chosenVariant;

}