# commerce-categories

This use-case is the projection forward of a whole endpoint from
origin, perhaps useful for slow-changing and simple data that can be
statically included in the code.

This example uses the following data:

      [{title: 'Furniture', id: 1040,
        desc: 'Desks, chairs, couches, tables, lamps, rugs.'},
       {title: 'Shoes', id: 1060,
        desc: 'Athletic shoes, sneakers, booties, flats, heels, sandals, slippers.'},
       {title: 'Baby', id: 1090,
        desc: 'Diapers, pacifiers, newborn clothes, toys, nursery.'},
       {title: 'Beauty', id: 1110,
        desc: 'Makeup, skin care, perfume, cologne, hair care, shampoo, conditioner.'},
       {title: 'Jewelry', id: 1150,
        desc: 'Watches, bracelets, necklaces, earings, gemstones, pearls, diamonds, rings.'},
       {title: 'Electronics', id: 1250,
        desc: 'Smartphones, tablets, fitness trackers, smart pens, computers, monitors.'}];

This EdgeWorker tests for `/commerce/categories` in the URI path in
order to act. It will then respond to a GET parameter named `search`
by running a case-insensitive regex against each `title` and `desc`
field, and a numeric comparison against each `id`, and returning an
array of matching category entities, serialized as JSON.

Because the response is generated at the Edge, origin will not be
contacted, and the request will be fully resolved at the first Edge
server that answers it.

## Examples

    GET /commerce/categories/?search=beauty

    [{"title":"Beauty","id":1110,"desc":"Makeup, skin care, perfume, cologne, hair care, shampoo, conditioner."}]


    GET /commerce/categories/?search=rugs

    [{"title":"Furniture","id":1040,"desc":"Desks, chairs, couches, tables, lamps, rugs."}]


    GET /commerce/categories/?search=1150

    [{"title":"Jewelry","id":1150,"desc":"Watches, bracelets, necklaces, earings, gemstones, pearls, diamonds, rings."}]

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
