/*jshint esversion: 6 */

// define country top level domain mapping
const tldMap = {
  'CA' : '.ca',
  'GB' : '.co.uk',
  'US' : '.com'
};

export function onClientRequest(request) {

  // Break out sub domain from host
  let subDomain = request.host.split('.')[0];

  // Break out domain from host
  let domain = request.host.split('.')[1];

  // determine top level domain based on request origin country
  let tld = domainMap[request.userLocation.country];

  // if top level domain is supported default to .com
  if (tld === undefined) {
    tld = '.com';
  }

  // built up new domain
  let redirectDomain = subDomain + '.' + domain + tld;

  // check incoming host different against built up host
  if (request.host !== redirectDomain) {

    // redirect to new host
    request.respondWith(302, {
      'Location' : [ request.scheme + '://' + redirectDomain + request.url ]
    },
                        '');
  }
}