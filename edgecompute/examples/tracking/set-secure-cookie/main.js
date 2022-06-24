import { SetCookie } from 'cookies';

export function onClientResponse (request, response) {
  const headers = response.getHeader('set-cookie');
  response.removeHeader('set-cookie');

  for (const element of headers) {
    let result = element.toLocaleLowerCase().indexOf('secure');

    if (result == '-1') {
      let addCookie = new SetCookie(element + '; Secure');
      response.addHeader('set-cookie', addCookie.toHeader());
      } else {
      let passCookie = new SetCookie(element);
      response.addHeader('set-cookie', passCookie.toHeader());
    }
  }
}
