/*
(c) Copyright 2026 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  EdgeWorker that generates a simple html page at the Edge and adds a response header, with LRU cache data.

*/

import { LRUCache, MAX_SIZE } from 'lru-cache';

const MAX = 10;
const SIZE_CALCULATION = (value, key) => 1;
const FETCH_METHOD = (key, staleValue, { options, context }) => `v${key}`;
const TTL = 60_000;

let cache = new LRUCache({
  fetchMethod: FETCH_METHOD,
  max: MAX,
  maxSize: MAX_SIZE,
  sizeCalculation: SIZE_CALCULATION,
  ttl: TTL
});

export function onClientRequest(request) {
  for (let i = 0; i < MAX; i++) {
    cache.set(`k${i}`, `v${i}`);
  }

  request.respondWith(
    200, {},
    '<html><body>\
    <h1>Akamai EdgeWorkers - Native LRU</h1>\
    </body></html>');
}

export async function onClientResponse(request, response) {
  const idx = Math.floor(Math.random() * MAX);
  let cache_value;

  if (request.getHeader('fetch') !== undefined) {
    cache_value = await cache.fetch(`k${idx}`);
    response.setHeader('X-LRU-METHOD', 'fetch');
  } else {
    cache_value = cache.get(`k${idx}`);
    response.setHeader('X-LRU-METHOD', 'get');
  }

  response.setHeader('X-LRU-KEY', `k${idx}`);
  response.setHeader('X-LRU-VALUE', cache_value);
}
