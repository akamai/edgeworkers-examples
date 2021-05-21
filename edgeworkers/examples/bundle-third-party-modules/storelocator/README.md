# storelocator

*Keyword(s):* constructed-response, microservice, geographic-search, npm, rollup, json<br>
*[Since](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-14077BCA-0D9F-422C-8273-2F3E37339D5B.html):* 1.0

This example implements a microservice store locator API call that returns the two stores nearest to the provide latitude and longitude.

To build the EdgeWorker:

````
npm install
npm run build
````

Data was retrieved from the OpenStreetMap project using [Overpass Turbo](https://overpass-turbo.eu/) with the following query:

````
[out:json][timeout:2500];
{{geocodeArea:United States of America}}->.searchArea;
(
  node[brand="Walmart"](area.searchArea);
);
out body;
>;
out skel qt;
````

## Usage Examples

````
/storelocator?lat=42.262&lon=-84.416
[
  {
    "distance": 1.2659788494625828,
    "location": {
      "type": "node",
      "id": 4216260835,
      "lat": 42.2499,
      "lon": -84.4345826,
      "tags": {
        "addr:city": "Jackson",
        "addr:country": "US",
        "addr:housenumber": "1700",
        "addr:postcode": "49202",
        "addr:state": "MI",
        "addr:street": "West Michigan Avenue",
        "brand": "Walmart",
        "brand:wikidata": "Q483551",
        "brand:wikipedia": "en:Walmart",
        "name": "Walmart Supercenter",
        "opening_hours": "24/7",
        "operator": "Walmart",
        "operator:wikidata": "Q483551",
        "operator:wikipedia": "en:Walmart",
        "phone": "+1-517-817-0326",
        "ref:walmart": "5160",
        "shop": "supermarket",
        "website": "https://www.walmart.com/store/5160/jackson-mi/whats-new"
      }
    }
  },
  {
    "distance": 32.22093282523531,
    "location": {
      "type": "node",
      "id": 6977481145,
      "lat": 42.7281982,
      "lon": -84.4075709,
      "tags": {
        "brand": "Walmart",
        "brand:wikidata": "Q483551",
        "brand:wikipedia": "en:Walmart",
        "name": "Walmart Garden Center",
        "shop": "garden_centre"
      }
    }
  }
]
````

## Similar Uses

See the [microservice-geolocation](https://github.com/akamai/edgeworkers-examples/tree/master/edgeworkers/examples/respond-from-edgeworkers/respondwith/microservice-geolocation) example to retrieve the latitude and longitude through EdgeWorkers and Akamai EdgeScape.

The use of npm and rollup to include dependencies provides easy reuse of existing JavaScript libraries.

## Resources
See the repo [README](https://github.com/akamai/edgeworkers-examples#Resources) for additional guidance.
