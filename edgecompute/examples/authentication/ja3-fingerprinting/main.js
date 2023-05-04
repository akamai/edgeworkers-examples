import { atob } from 'encoding';

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/**
 * Add integers, wrapping at 2^32.
 * This uses 16-bit operations internally to work around bugs in interpreters.
 *
 * @param {number} x First integer
 * @param {number} y Second integer
 * @returns {number} Sum
 */
function safeAdd(x, y) {
  let lsw = (x & 0xffff) + (y & 0xffff);
  let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

/**
 * Bitwise rotate a 32-bit number to the left.
 *
 * @param {number} num 32-bit number
 * @param {number} cnt Rotation count
 * @returns {number} Rotated number
 */
function bitRotateLeft(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

/**
 * Basic operation the algorithm uses.
 *
 * @param {number} q q
 * @param {number} a a
 * @param {number} b b
 * @param {number} x x
 * @param {number} s s
 * @param {number} t t
 * @returns {number} Result
 */
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

/**
 * Basic operation the algorithm uses.
 *
 * @param {number} a a
 * @param {number} b b
 * @param {number} c c
 * @param {number} d d
 * @param {number} x x
 * @param {number} s s
 * @param {number} t t
 * @returns {number} Result
 */
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}

/**
 * Basic operation the algorithm uses.
 *
 * @param {number} a a
 * @param {number} b b
 * @param {number} c c
 * @param {number} d d
 * @param {number} x x
 * @param {number} s s
 * @param {number} t t
 * @returns {number} Result
 */
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}

/**
 * Basic operation the algorithm uses.
 *
 * @param {number} a a
 * @param {number} b b
 * @param {number} c c
 * @param {number} d d
 * @param {number} x x
 * @param {number} s s
 * @param {number} t t
 * @returns {number} Result
 */
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

/**
 * Basic operation the algorithm uses.
 *
 * @param {number} a a
 * @param {number} b b
 * @param {number} c c
 * @param {number} d d
 * @param {number} x x
 * @param {number} s s
 * @param {number} t t
 * @returns {number} Result
 */
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

/**
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 *
 * @param {Array} x Array of little-endian words
 * @param {number} len Bit length
 * @returns {Array<number>} MD5 Array
 */
function binlMD5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  let i, olda, oldb, oldc, oldd;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;

    a = md5ff(a, b, c, d, x[i],       7,  -680876936);
    d = md5ff(d, a, b, c, x[i + 1],  12,  -389564586);
    c = md5ff(c, d, a, b, x[i + 2],  17,   606105819);
    b = md5ff(b, c, d, a, x[i + 3],  22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4],   7,  -176418897);
    d = md5ff(d, a, b, c, x[i + 5],  12,  1200080426);
    c = md5ff(c, d, a, b, x[i + 6],  17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7],  22,   -45705983);
    a = md5ff(a, b, c, d, x[i + 8],   7,  1770035416);
    d = md5ff(d, a, b, c, x[i + 9],  12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17,      -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7,   1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12,   -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22,  1236535329);

    a = md5gg(a, b, c, d, x[i + 1],   5,  -165796510);
    d = md5gg(d, a, b, c, x[i + 6],   9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14,   643717713);
    b = md5gg(b, c, d, a, x[i],      20,  -373897302);
    a = md5gg(a, b, c, d, x[i + 5],   5,  -701558691);
    d = md5gg(d, a, b, c, x[i + 10],  9,    38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14,  -660478335);
    b = md5gg(b, c, d, a, x[i + 4],  20,  -405537848);
    a = md5gg(a, b, c, d, x[i + 9],   5,   568446438);
    d = md5gg(d, a, b, c, x[i + 14],  9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3],  14,  -187363961);
    b = md5gg(b, c, d, a, x[i + 8],  20,  1163531501);
    a = md5gg(a, b, c, d, x[i + 13],  5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2],   9,   -51403784);
    c = md5gg(c, d, a, b, x[i + 7],  14,  1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[i + 5],   4,     -378558);
    d = md5hh(d, a, b, c, x[i + 8],  11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16,  1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23,   -35309556);
    a = md5hh(a, b, c, d, x[i + 1],   4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4],  11,  1272893353);
    c = md5hh(c, d, a, b, x[i + 7],  16,  -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13],  4,   681279174);
    d = md5hh(d, a, b, c, x[i],      11,  -358537222);
    c = md5hh(c, d, a, b, x[i + 3],  16,  -722521979);
    b = md5hh(b, c, d, a, x[i + 6],  23,    76029189);
    a = md5hh(a, b, c, d, x[i + 9],   4,  -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11,  -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16,   530742520);
    b = md5hh(b, c, d, a, x[i + 2],  23,  -995338651);

    a = md5ii(a, b, c, d, x[i],       6,  -198630844);
    d = md5ii(d, a, b, c, x[i + 7],  10,  1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5],  21,   -57434055);
    a = md5ii(a, b, c, d, x[i + 12],  6,  1700485571);
    d = md5ii(d, a, b, c, x[i + 3],  10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15,    -1051523);
    b = md5ii(b, c, d, a, x[i + 1],  21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8],   6,  1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10,   -30611744);
    c = md5ii(c, d, a, b, x[i + 6],  15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21,  1309151649);
    a = md5ii(a, b, c, d, x[i + 4],   6,  -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2],  15,   718787259);
    b = md5ii(b, c, d, a, x[i + 9],  21,  -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}

/**
 * Convert an array of little-endian words to a string
 *
 * @param {Array<number>} input MD5 Array
 * @returns {string} MD5 string
 */
function binl2rstr(input) {
  let i;
  let output = '';
  let length32 = input.length * 32;
  for (i = 0; i < length32; i += 8) {
    output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
  }
  return output;
}

/**
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 *
 * @param {string} input Raw input string
 * @returns {Array<number>} Array of little-endian words
 */
function rstr2binl(input) {
  let i, output = [];
  output[(input.length >> 2) - 1] = undefined;
  for (i = 0; i < output.length; i += 1) {
    output[i] = 0;
  }
  let length8 = input.length * 8;
  for (i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
  }
  return output;
}

/**
 * Convert a raw string to a hex string
 *
 * @param {string} input Raw input string
 * @returns {string} Hex encoded string
 */
function rstr2hex(input) {
  let hexTab = '0123456789abcdef';
  let output = '';
  let x, i;
  for (i = 0; i < input.length; i += 1) {
    x = input.charCodeAt(i);
    output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
  }
  return output;
}

/**
 * Calculate the MD5 of a raw string
 *
 * @param {string} s Input string
 * @returns {string} Raw MD5 string
 */
function rstrMD5(s) {
  return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
}

/**
 * Encode a string as UTF-8
 *
 * @param {string} input Input string
 * @returns {string} UTF8 string
 */
function str2rstrUTF8(input) {
  return unescape(encodeURIComponent(input));
}

/**
 * Encodes input string as raw MD5 string
 *
 * @param {string} s Input string
 * @returns {string} Raw MD5 string
 */
function rawMD5(s) {
  return rstrMD5(str2rstrUTF8(s));
}

/**
 * Encodes input string as Hex encoded string
 *
 * @param {string} s Input string
 * @returns {string} Hex encoded string
 */
function md5(input) {
  return rstr2hex(rawMD5(input));
}

/**
 * Dependency
 * md5
 *  |- rstr2hex
 *  `- rawMD5 - rstrMD5 - binl2rstr
 *            |         `- binlMD5 - safeAdd
 *            |                    `- md5ff,gg,hh,ii - md5cmn - safeAdd
 *            |                                      `- bitRotateLeft
 *            |- rstr2binl
 *            `- str2rstrUTF8 - unescape, encodeURIComponent
 */

function base64toUint8Array(base64_string) {
  const raw = atob(base64_string);
  return Uint8Array.from(Array.prototype.map.call(raw, (c) => { return c.charCodeAt(0); } ));
}

/* Big Endian */
function getUint24(buffer) {
  const higher = (new DataView(buffer).getUint16(0) << 8);
  const lower = new DataView(buffer).getUint8(2);

  return higher + lower;
}

/* Converts Uint8Array to Uint16Array, honoring Big Endian */
function uint8to16(input_uint8a) {
  const length = input_uint8a.buffer.byteLength;
	if (length % 2 !== 0) { throw new Error('input Uint8Array.length is not an even number'); }

  let uint16a = new Uint16Array(length / 2);
  for (let i = 0, j = 0; i < length; i += 2, j += 1) {
    uint16a[j] = input_uint8a.getUint16(i);
  }
	return uint16a;
}

/**
 * Remove GREASE values from Array
 * @param Array
 * @returns Array
 */
function removeGREASE(input) {
  /**
   * JA3 must ignore extensions added by GREASE
   * https://datatracker.ietf.org/doc/html/draft-davidben-tls-grease-01
   * GREASE uses identical set of value for
   * - Cipher Suites (2 byte)
   * - Extension Types (2 byte)
   * - Supported Groups (2 byte)
   */
  const GREASE = [
    2570,
    6682,
    10794,
    14906,
    19018,
    23130,
    27242,
    31354,
    35466,
    39578,
    43690,
    47802,
    51914,
    56026,
    60138,
    64250
  ];

  return input.filter((value) => { return !GREASE.includes(value); });
}

function getJA3RawString(buffer) {
  const dataView = new DataView(buffer.buffer);

  /*
  * TLS Record Layer (a.k.a TLS Header)
  * This code assumes NOT to contain Record Layer
  */

  /*
  * TLS Handshake Header
  *  - enum HandshakeType
  *  - uint24 length
  */
  const HANDSHAKE_TYPE_START = 0;
  const HANDSHAKE_TYPE_LENGTH = 1;
  dataView.getUint8(HANDSHAKE_TYPE_START);

  const LENGTH_START = HANDSHAKE_TYPE_START + HANDSHAKE_TYPE_LENGTH;
  const LENGTH_LENGTH = 3;
  getUint24(dataView.buffer);

  /*
  * ClientHello Header
  *  - uint16 ProtocolVersion
  */
  const PROTOCOL_VERSION_START = LENGTH_START + LENGTH_LENGTH;
  const PROTOCOL_VERSION_LENGTH  = 2;
  // Used for JA3 Fingerprint input (1st field)
  const protocol_version = dataView.getUint16(PROTOCOL_VERSION_START);

  /*
  *  Random
  *  - opaque Random[32] => 32 Byte => Uint8Array で 32 個分の要素
  */
  const CLIENT_RANDOM_START = PROTOCOL_VERSION_START + PROTOCOL_VERSION_LENGTH;
  const CLIENT_RANDOM_LENGTH = 32;
  new DataView(buffer.slice(CLIENT_RANDOM_START, CLIENT_RANDOM_START + CLIENT_RANDOM_LENGTH).buffer);

  /*
  * Legacy Session ID
  * - opaque legacy_session_id<0..32>
  */
  const SESSION_ID_LENGTH_START = CLIENT_RANDOM_START + CLIENT_RANDOM_LENGTH;
  const SESSION_ID_LENGTH_LENGTH = 1;
  const session_id_length = dataView.getUint8(SESSION_ID_LENGTH_START);

  const SESSION_ID_START = SESSION_ID_LENGTH_START + SESSION_ID_LENGTH_LENGTH;
  new DataView(buffer.slice(SESSION_ID_START, SESSION_ID_START + session_id_length).buffer);

  /*
  * Cipher Suites
  * - cipher_suites<2..2^16-2> 
  *   - 可変長なので、Length を 2 バイトで表現
  *   - 各 Cipher Suite を 2 バイトで表現
  */
  const CIPHER_SUITES_LENGTH_START = SESSION_ID_START + session_id_length;
  const CIPHER_SUITES_LENGTH_LENGTH = 2;
  const cipher_suites_length = dataView.getUint16(CIPHER_SUITES_LENGTH_START);

  const CIPHER_SUITES_START = CIPHER_SUITES_LENGTH_START + CIPHER_SUITES_LENGTH_LENGTH;
  const cipher_suites = new DataView(buffer.slice(CIPHER_SUITES_START, CIPHER_SUITES_START + cipher_suites_length).buffer);

  // 各 Cipher Suite を 2 byte の array (= Uint16Array) に変換
  const cipher_suites_parsed = uint8to16(cipher_suites);
  const cipher_suites_without_grease = removeGREASE(cipher_suites_parsed);
  // Used for JA3 Fingerprint input (2nd field)
  const cipher_suites_joined = cipher_suites_without_grease.join('-');

  /* Legacy Compression Methods */
  const COMPRESSION_METHODS_LENGTH_START = CIPHER_SUITES_START + cipher_suites_length;
  const COMPRESSION_METHODS_LENGTH_LENGTH = 1;
  const compression_methods_length = dataView.getUint8(COMPRESSION_METHODS_LENGTH_START);

  const COMPRESSION_METHODS_START = COMPRESSION_METHODS_LENGTH_START + COMPRESSION_METHODS_LENGTH_LENGTH;
  new DataView(buffer.slice(COMPRESSION_METHODS_START, COMPRESSION_METHODS_START + compression_methods_length).buffer);

  /* Extension */
  const EXTENSIONS_LENGTH_START = COMPRESSION_METHODS_START + compression_methods_length;
  const EXTENSIONS_LENGTH_LENGTH = 2;
  const extensions_length = dataView.getUint16(EXTENSIONS_LENGTH_START);

  const EXTENSIONS_START = EXTENSIONS_LENGTH_START + EXTENSIONS_LENGTH_LENGTH;
  new DataView(buffer.slice(EXTENSIONS_START, EXTENSIONS_START + extensions_length).buffer);

  // Extension ごとの塊に分解する
  //   { extension_type: { extension_data_length: (2 byte), extension_data: (dynamic) }, ... }
  //   次の開始点を決定するためには、extension の length が必要。
  //   次のイテレーションでは length を使って extenstion_start を指定する
  const EXTENSION_TYPE_LENGTH = 2;
  const EXTENSION_DATA_LENGTH = 2;
  let extensions_parsed = {};

  // Object.keys() を使うと sort され、並び順が変わってしまうので、Array を使う
  let extensions_type = [];

  for (let extension_start = EXTENSIONS_START; extension_start < EXTENSIONS_START + extensions_length; extension_start) {
    const extension_type = dataView.getUint16(extension_start);

    const extension_data_length_start = extension_start + EXTENSION_TYPE_LENGTH;
    const extension_data_length = dataView.getUint16(extension_data_length_start);

    const extension_data_start = extension_data_length_start + EXTENSION_DATA_LENGTH;
    const extension_data = new DataView(buffer.slice(extension_data_start, extension_data_start + extension_data_length).buffer);

    extensions_parsed[extension_type] = { extension_data_length, extension_data: extension_data };
    extensions_type.push(extension_type);

    extension_start = extension_data_start + extension_data_length;
  }

  // Used for JA3 Fingerprint input (3rd field)
  const extensions_without_grease = removeGREASE(extensions_type);
  const extensions_joined = extensions_without_grease.join('-');

  /*
  * Extension: elliptic_curves (supported_groups) = 0x000a = 10
  * - TLS 1.2 以前は elliptic_curves という名前だったが、
  *   TLS 1.3 では elliptic curve groups に変更
  * - Wireshark では supported_groups と表記
  * - https://www.rfc-editor.org/rfc/rfc8446#section-4.2.7
  */
  const EXTENSION_SUPPORTED_GROUPS = 10;
  let elliptic_curves_joined = '';
  if (extensions_parsed[EXTENSION_SUPPORTED_GROUPS]) {
    // 先頭に Supported Groups List Length 2 byte 分を含む
    const supported_groups = Array.from(uint8to16(extensions_parsed[EXTENSION_SUPPORTED_GROUPS].extension_data));
    // 先頭の Length を除去してから join
    const supported_groups_without_grease = removeGREASE(supported_groups.slice(1));
    elliptic_curves_joined = supported_groups_without_grease.join('-');
  }

  /*
  * Extension: ec_point_formats = 0x000b = 11
  * - [0] は uncompressed
  */
  const EXTENSION_TYPE_EC_POINT_FORMAT = 11;
  let ec_point_formats_joined = '';
  if (extensions_parsed[EXTENSION_TYPE_EC_POINT_FORMAT]) {
    extensions_parsed[EXTENSION_TYPE_EC_POINT_FORMAT].extension_data[0];
    const ec_point_formats = Array.from(new Uint8Array(extensions_parsed[EXTENSION_TYPE_EC_POINT_FORMAT].extension_data.buffer.slice(1)));
    ec_point_formats_joined = ec_point_formats.join('-');
  }

  return [protocol_version, cipher_suites_joined, extensions_joined, elliptic_curves_joined, ec_point_formats_joined].join(',');
}

function getJA3Fingerprint(buffer) {
  const JA3_input = getJA3RawString(buffer);
  return md5(JA3_input);
}

function onClientRequest(request) {
  const client_hello = request.getVariable('PMUSER_TLS_CLIENT_HELLO');
  const buffer = base64toUint8Array(client_hello);

  const JA3_fingerprint = getJA3Fingerprint(buffer);
  request.setVariable('PMUSER_JA3_FINGERPRINT', JA3_fingerprint);

  return JA3_fingerprint;
}

export { onClientRequest };
