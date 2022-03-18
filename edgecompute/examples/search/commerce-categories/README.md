# commerce-categories

*Keyword(s):* data, dictionary, products, commerce, lookup<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This use-case is the projection forward of a whole endpoint from origin, perhaps useful for slow-changing and simple data that can be statically included in the code.

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

## Usage Examples

    GET /commerce/categories/?search=beauty

    [{"title":"Beauty","id":1110,"desc":"Makeup, skin care, perfume, cologne, hair care, shampoo, conditioner."}]


    GET /commerce/categories/?search=rugs

    [{"title":"Furniture","id":1040,"desc":"Desks, chairs, couches, tables, lamps, rugs."}]


    GET /commerce/categories/?search=1150

    [{"title":"Jewelry","id":1150,"desc":"Watches, bracelets, necklaces, earings, gemstones, pearls, diamonds, rings."}]

## Similar Uses
Could be extended to apply to any small, low volatility dictionary data set to help offload data set lookup roundtrip time.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
