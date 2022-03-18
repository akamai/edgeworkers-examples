/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Modify forward path based on device type to point to device specific content.

*/

export function onClientRequest (request) {
  if (request.device.isMobile) {
    request.route({ path: '/mobile' + request.path });
  } else if (request.device.isTablet) {
    request.route({ path: '/tablet' + request.path });
  }
}
