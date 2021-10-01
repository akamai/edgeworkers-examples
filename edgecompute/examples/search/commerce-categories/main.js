/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Serve a commerce category API directly from a small set of data
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/commerce-categories
*/
import URLSearchParams from 'url-search-params';

const categories =
      [{
        title: 'Furniture',
        id: 1040,
        desc: 'Desks, chairs, couches, tables, lamps, rugs.'
      },
      {
        title: 'Shoes',
        id: 1060,
        desc: 'Athletic shoes, sneakers, booties, flats, heels, sandals, slippers.'
      },
      {
        title: 'Baby',
        id: 1090,
        desc: 'Diapers, pacifiers, newborn clothes, toys, nursery.'
      },
      {
        title: 'Beauty',
        id: 1110,
        desc: 'Makeup, skin care, perfume, cologne, hair care, shampoo, conditioner.'
      },
      {
        title: 'Jewelry',
        id: 1150,
        desc: 'Watches, bracelets, necklaces, earings, gemstones, pearls, diamonds, rings.'
      },
      {
        title: 'Electronics',
        id: 1250,
        desc: 'Smartphones, tablets, fitness trackers, smart pens, computers, monitors.'
      }
      ];

export function onClientRequest (request) {
  if (request.path.match(/\/commerce\/categories/)) {
    const params = new URLSearchParams(request.query);
    const search = params.get('search');
    if (search) {
      const re = new RegExp(search, 'i');
      var data = categories.filter(el => el.title.match(re) || el.desc.match(re) || el.id === parseInt(search));
      request.respondWith(200, { 'Content-Type': ['application/json'] }, JSON.stringify(data));
    }
  }
}
