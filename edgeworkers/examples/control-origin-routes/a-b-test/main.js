/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:
  Enable A/B testing.
  Randomly assign new users to an A/B testing group.
  Include the A/B group in a query parameter sent to the origin.
  Include the A/B group in a cookie to the browser.
  Allow overriding the group with a query string parameter for easy testing.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/a-b-test
*/

import { Cookies, SetCookie } from 'cookies';
import URLSearchParams from 'url-search-params';

// ====== Begin Configuration ====== //
// Update constants below to configure A/B logic

/** Probability that a user is added to the "A" group.  0.5 = 50% */
const probabilityOfA = 0.5;

/** Name of cookie that stores A/B group assignment. */
const cookieName = 'testGroup';

/**
 * Name of query parameter that contains A/B group assignment
 * This query parameter will be added to the outgoing onClientRequest.
 * The query parameter can be added to the incoming request to force A/B group assignment.
 */
const queryParamName = 'testGroup';

/** Cookie and query string value to use for users in the "A" group. */
const groupAValue = 'A';

/** Cookie and query string value to use for users in the "B" group. */
const groupBValue = 'B';

// ====== End Configuration ====== //

export function onClientRequest (request) {
  const cookies = new Cookies(request.getHeader('Cookie'));
  const params = new URLSearchParams(request.query);

  // Initialize existing and reult group value from the request cookie
  const existingGroupValue = cookies.get(cookieName);
  let resultGroupValue = existingGroupValue;

  // override result group value if forced by query parameter
  const paramValue = params.get(queryParamName);
  if (paramValue) {
    resultGroupValue = paramValue;
  }

  // If no group value has been assigned,
  // then randomly choose one based on configured percentage
  if (!resultGroupValue) {
    if (Math.random() <= probabilityOfA) {
      resultGroupValue = groupAValue;
    } else {
      resultGroupValue = groupBValue;
    }
  }

  // If group value if different than the existing cookie,
  // then replace the incoming cookie with the new value.
  if (resultGroupValue != existingGroupValue) {
    cookies.delete(cookieName);
    cookies.add(cookieName, resultGroupValue);
    request.setHeader('Cookie', cookies.toHeader());
  }

  // If the group was not already included in the incoming query parameter,
  // then add the query parameter to the query string.
  // The query parameter allows the origin to respond with appropriate logic
  // and ensures the A/B group is included in the cache key.
  if (!paramValue) {
    params.append(queryParamName, resultGroupValue);
    request.route({ query: params.toString() });
  }
}

export function onClientResponse (request, response) {
  // Set a response cookie with the A/B group based on
  // the request cookie  set in the onClientRequest handler.
  const cookies = new Cookies(request.getHeader('Cookie'));
  const cookieValue = cookies.get(cookieName);
  const setCookie = new SetCookie({ name: cookieName, value: cookieValue });
  response.setHeader('Set-Cookie', setCookie.toHeader());
}
