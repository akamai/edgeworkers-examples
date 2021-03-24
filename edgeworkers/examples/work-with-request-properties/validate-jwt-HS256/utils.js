
/**
 * Decodes base-64 string
 * @param {string} input 
 */
var atob = (input) => {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var str = String(input).replace(/=+$/, "");
    if (str.length % 4 == 1) {
      // invalid b64 string
      return "";
    }
    for (
      var bc = 0, bs, buffer, idx = 0, output = "";
      (buffer = str.charAt(idx++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4) ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))) : 0
      ) {
        buffer = chars.indexOf(buffer);
      }
    return output;
  }
  
/**
 * Parses base-64 encoded JSON into JS object
 * @param {string} token 
 */
var b64toJSON = (token) => {
    var base64Url = token;
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

export {b64toJSON as default};