/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
Version: 0.1
Purpose: Reply instantly to most popular search terms from the Edge, unpopular terms go forward to origin.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/fast-autocomplete
*/

import URLSearchParams from 'url-search-params';
import { default as searchterms } from './searchterms.js';

export function onClientRequest (request) {
  const params = new URLSearchParams(request.query);
  const jsonContentType = { 'Content-Type': ['application/json;charset=utf-8'] };
  const searchResult = searchterms[params.get('term').toLowerCase()];
  if (searchResult) {
    request.respondWith(200, jsonContentType, JSON.stringify(searchResult));
  }
}
