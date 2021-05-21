/*
(c) Copyright 2019 Akamai Technologies, Inc. Licensed under Apache 2 license.

Version: 0.1
Purpose:  Remove inbound/outbound cookies from static files based on extensions
Repo:
https://github.com/akamai/edgeworkers-examples/tree/master/remove-cookies-static-files
*/

// define list of static file extensions that should not have cookies
const staticFileExtensions = [
  '7z', 'avi', 'bmp', 'bz2', 'css', 'csv', 'doc', 'docx', 'eot', 'flac',
  'flv', 'gif', 'gz', 'ico', 'jpeg', 'jpg', 'js', 'less', 'mka', 'mkv',
  'mov', 'mp3', 'mp4', 'mpeg', 'mpg', 'odt', 'otf', 'ogg', 'ogm', 'opus',
  'pdf', 'png', 'ppt', 'pptx', 'rar', 'rtf', 'svg', 'svgz', 'swf', 'tar',
  'tbz', 'tgz', 'ttf', 'txt', 'txz', 'wav', 'webm', 'webp', 'woff', 'woff2',
  'xls', 'xlsx', 'xml', 'xz', 'zip'
];

// remove inbound cookies from static files
export function onClientRequest (request) {
  const extension = request.path.match(/\./)
    ? request.path.match(/\.(\w{2,5})(?:$|\?)/)[1]
    : undefined;

  if (staticFileExtensions.indexOf(extension) > -1) {
    request.removeHeader('Cookie');
  }
}

// remove outbound set-cookies from static files
export function onClientResponse (request, response) {
  const extension = request.path.match(/\./)
    ? request.path.match(/\.(\w{2,5})(?:$|\?)/)[1]
    : undefined;

  if (staticFileExtensions.indexOf(extension) > -1) {
    response.removeHeader('Set-Cookie');
  }
}
