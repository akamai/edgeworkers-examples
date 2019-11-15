# cookie-accural

This example will accrue user movements through sections of a web site
in a cookie. The section of the web site will be some part of the URI
path. As the user makes requests, the last several section names will
be saved in a comma-separated `visited` cookie. Upon reaching a
certain number of sections visited, a second short-term `promo` cookie
is activated. The `visited` cookie will also be pruned for a maximum
length in terms of number of section names.

## Examples

    GET /cookieaccrual/about-us/

    visited cookie: about-us


    GET /cookie-accural/history/

    visited cookie: about-us,history


    GET /cookie-accural/products/

    visited cookie: about-us,history,products


    GET /cookie-accural/guarantee/

    visited cookie: about-us,history,products,guarantee


    GET /cookie-accural/pricing/

    visited cookie: about-us,history,products,guarantee,pricing


    GET /cookie-accural/sizing/

    visited cookie: about-us,history,products,guarantee,pricing,sizing
    promo cookie: true

Create a `cookie-accural` folder on origin with various subfolders (or
disregard the origin errors for not existing). Visit various folder
names available on origin. By default, the second folder name in the
path will be considered the section (you can change this by altering
the `folderPosition` constant in the code, which defaults to 2).

Observe that the `visited` cookie is updated as sections are visited,
but will not grow past 50 entries (see the `trackLastNumSections`
constant). After 6 sections are visited (see the
`showPromoAfterNumSections` constant), observe that a `promo` cookie
is issued with a value of `true`. The `visited` cookie TTL is
controlled by the `visitedCookieSecs` constant, and the promo cookie
TTL is controlled by the `promoCookieSecs` constant, both expressed as
integer seconds.

The cookies are issued upon response so origin sees the previous
sections in the `visited` cookie, excluding the current one being
requested. The `promo` cookie is inspirational to possibly alter the
page layout and display a promotion of some sort.

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://developer.akamai.com/akamai-edgeworkers-overview)
- [Akamai EdgeWorkers Examples](https://github.com/akamai/edgeworkers-examples)
- [Akamai CLI for EdgeWorkers](https://developer.akamai.com/legacy/cli/packages/edgeworkers.html)
