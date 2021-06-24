/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Include devcie type in cachekey, allows caching of device specific content without changing the url.
Repo: https://github.com/akamai/edgeworkers-examples/tree/master/cachekey-devicetype
*/

export function onClientRequest (request) {
  request.setVariable('PMUSER_DEVICETYPE', 'Desktop');
  if (request.device.isMobile) {
    request.setVariable('PMUSER_DEVICETYPE', 'Mobile');
  } else if (request.device.isTablet) {
    request.setVariable('PMUSER_DEVICETYPE', 'Tablet');
  }
  request.cacheKey.includeVariable('PMUSER_DEVICETYPE');
}
