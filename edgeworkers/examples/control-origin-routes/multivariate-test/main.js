/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:
  Enable mulitvariate testing.
  Provides the capaility to simultaneously run multiple independent tests
  Randomly assign new users to a variant in each group
  Weights can be assigned to each variant within a test. (default weight is 1)
  Include each variant in a query parameter sent to the origin.
  Include each variant in a cookie to the browser.
  Allow overriding the variant with a query string parameter for easy testing.
  Provide hooks for custom actions to be performed in the request/response of each variant
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/a-b-test
*/

import { Cookies, SetCookie } from 'cookies';
import URLSearchParams from 'url-search-params';

// ====== Begin Configuration ====== //

const groups = [
  {
    // "test1" is a simple test that chooses between 2 variants with a 50/50 split
    // The chosen variant will be included in both:
    //   * a query string parameter that is sent to the origin a
    //   * a cookie that is sent to the browser
    testName: 'test1',
    cookieName: 'test1',
    queryParamName: 'test1',
    variants: [
      { variantName: '1a' },
      { variantName: '1b' }
    ]
  },
  {
    // "test2" is a more complex test that chooses between 3 variants
    // variants "2b" and "2c" are twice as likely to be selected as "2a"
    //  Custom request actions are used to
    //  * route to a different origin in variants "2a" and "2b"
    //  * construct a response at the Edge in variant "2c"
    // Custom response actions are used to add a response header in each variant
    testName: 'test2',
    cookieName: 'test2',
    queryParamName: 'test2',
    variants: [
      {
        variantName: '2a',
        weight: 1,
        requestAction (request) {
          request.route({ origin: 'microservice1' });
        },
        responseAction (request, response) {
          response.addHeader('X-Variant', '2a');
        }
      },
      {
        variantName: '2b',
        weight: 2,
        requestAction (request) {
          request.route({ origin: 'microservice2' });
        },
        responseAction (request, response) {
          response.addHeader('X-Variant', '2b');
        }
      },
      {
        variantName: '2c',
        weight: 2,
        requestAction (request) {
          request.respondWith(
            200, { 'Content-Type': ['application/json'] },
            JSON.stringify({
              heroImageUrl: '/assets/images/hero2c.jpg',
              text: 'This is variant 2c, generated from an Akamai EdgeWorker'
            }));
        },
        responseAction (request, response) {
          response.addHeader('X-Variant', '2c');
        }
      }
    ]
  }
];

// ====== End Configuration ====== //

/**
 * Process each test group to convert "weights" into a "range".
 * The range will be between 0-1, with the upper bound stored in each group.
 * This facilitates selection via Math.random()
*/
function processGroups () {
  groups.forEach((group) => {
    const sumOfWeights = group.variants.reduce((currValue, variant) =>
      currValue + (variant.weight || 1),
    0
    );

    let upperBound = 0;
    group.variants.forEach((variant) => {
      upperBound += (variant.weight || 1) / sumOfWeights;
      variant.upperBound = upperBound;
    });
  });
}

processGroups(groups);

export function onClientRequest (request) {
  const cookies = new Cookies(request.getHeader('Cookie'));
  const params = new URLSearchParams(request.query);

  groups.forEach((group) => {
    const cookieName = group.cookieName;
    const queryParamName = group.queryParamName;

    let resultVariant;

    // Initialize existing and reult variant value from the request cookie
    const existingVariantName = cookies.get(cookieName);

    // override result variant if forced by query parameter
    const paramValue = params.get(queryParamName);
    if (paramValue) {
      resultVariant = group.variants.find((variant) => variant.variantName === paramValue);
    }

    // if not overriden by query prameter, locate variant in cookie
    if (existingVariantName && !resultVariant) {
      resultVariant = group.variants.find((variant) => variant.variantName === existingVariantName);
    }

    // If no variant has been assigned,
    // then randomly choose one based on configured percentage
    if (!resultVariant) {
      const randomNumber = Math.random();
      resultVariant = group.variants.find((variant) => variant.upperBound > randomNumber);
    }

    // If variant if different than the existing cookie,
    // then replace the incoming cookie with the new value.
    if (resultVariant.variantName !== existingVariantName) {
      cookies.delete(cookieName);
      cookies.add(cookieName, resultVariant.variantName);
      request.setHeader('Cookie', cookies.toHeader());
    }

    // If the group was not already included in the incoming query parameter,
    // then add the query parameter to the query string.
    // The query parameter allows the origin to respond with appropriate logic
    // and ensures the A/B group is included in the cache key.
    if (!paramValue) {
      params.append(queryParamName, resultVariant.variantName);
      request.route({ query: params.toString() });
    }

    // Call the requestAction function, if it exists on the variant.
    if (resultVariant.requestAction) {
      resultVariant.requestAction(request);
    }
  });
}

export function onClientResponse (request, response) {
  const cookies = new Cookies(request.getHeader('Cookie'));

  groups.forEach((group) => {
    const cookieName = group.cookieName;
    // Set a response cookie with the A/B group based on
    // the request cookie  set in the onClientRequest handler.
    const cookieValue = cookies.get(cookieName);
    const setCookie = new SetCookie({ name: cookieName, value: cookieValue, path: '/' });
    response.addHeader('Set-Cookie', setCookie.toHeader());

    // Call the responseAction function, if it exists on the variant.
    const variant = group.variants.find((variant) => variant.variantName == cookieValue);
    if (variant.responseAction) {
      variant.responseAction(request, response);
    }
  });
}
