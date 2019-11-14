// Accrue a relevant folder name in the path in a 'visited' cookie as each user navigates the site.
// Keep the visited cookie for a certain number of seconds, and prune over a certain length of names.
// After hitting a certain number of folders visited, trigger another 'promo' cookie to be 'true'.
// These cookies can control layout at origin or in client-side HTML/JS.

import {Cookies, SetCookie} from 'cookies';

const folderPosition = 2;  // in /blah/foo/bar position 1 is blah, 2 is foo, 3 is bar, etc
const trackLastNumSections = 50;
const showPromoAfterNumSections = 6;
const visitedCookieSecs = 24 * 60 * 60;
const promoCookieSecs = 900;

export function onClientResponse(request, response) {
  let matched = request.path.match(/^\/([\w\-]+)\//);  // path is at least /folder/...
  if (matched) {
    const section = request.path.split('/')[folderPosition];

    let cookies = new Cookies(request.getHeader('Cookie') || '');
    let visited = (cookies.get('visited') || '').split(',');
    if (section && visited.indexOf(section) == -1)  // if section does not appear in cookie
      visited.push(section);
    if (visited.length > trackLastNumSections)      // enforce max section names in cookie
      visited = visited.slice(-trackLastNumSections);

    var setCookieHeaders = [];  // will hold updated visited cookie, maybe a promo cookie

    var setCookieVisited = new SetCookie({name: 'visited', value: visited.join(','), path: '/', maxAge: visitedCookieSecs});
    setCookieHeaders.push(setCookieVisited.toHeader());

    if (visited.length >= showPromoAfterNumSections) {
      var setCookiePromo = new SetCookie({name: 'promo', value: 'true', path: '/', maxAge: promoCookieSecs});
      setCookieHeaders.push(setCookiePromo.toHeader());
    }

    response.setHeader('Set-Cookie', setCookieHeaders);
  }
}
