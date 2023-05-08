import * as digest from './digest.js';
import { atob } from 'encoding';

const DEBUG_MODE = false;

export function base64toUint8Array(base64_string) {
  const raw = atob(base64_string);
  return Uint8Array.from(Array.prototype.map.call(raw, (c) => { return c.charCodeAt(0); } ));
}

/* Big Endian */
export function getUint24(buffer) {
  const higher = (new DataView(buffer).getUint16(0) << 8);
  const lower = new DataView(buffer).getUint8(2);

  return higher + lower;
}

/* Converts Uint8Array to Uint16Array, honoring Big Endian */
export function uint8to16(input_uint8a) {
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
export function removeGREASE(input) {
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

export function getJA3RawString(buffer) {
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
  const handshake_type = dataView.getUint8(HANDSHAKE_TYPE_START);

  const LENGTH_START = HANDSHAKE_TYPE_START + HANDSHAKE_TYPE_LENGTH;
  const LENGTH_LENGTH = 3;
  const length = getUint24(dataView.buffer, LENGTH_START);

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
  const client_random = new DataView(buffer.slice(CLIENT_RANDOM_START, CLIENT_RANDOM_START + CLIENT_RANDOM_LENGTH).buffer);

  /*
  * Legacy Session ID
  * - opaque legacy_session_id<0..32>
  */
  const SESSION_ID_LENGTH_START = CLIENT_RANDOM_START + CLIENT_RANDOM_LENGTH;
  const SESSION_ID_LENGTH_LENGTH = 1;
  const session_id_length = dataView.getUint8(SESSION_ID_LENGTH_START);

  const SESSION_ID_START = SESSION_ID_LENGTH_START + SESSION_ID_LENGTH_LENGTH;
  const session_id = new DataView(buffer.slice(SESSION_ID_START, SESSION_ID_START + session_id_length).buffer);

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
  const compression_methods = new DataView(buffer.slice(COMPRESSION_METHODS_START, COMPRESSION_METHODS_START + compression_methods_length).buffer);

  /* Extension */
  const EXTENSIONS_LENGTH_START = COMPRESSION_METHODS_START + compression_methods_length;
  const EXTENSIONS_LENGTH_LENGTH = 2;
  const extensions_length = dataView.getUint16(EXTENSIONS_LENGTH_START);

  const EXTENSIONS_START = EXTENSIONS_LENGTH_START + EXTENSIONS_LENGTH_LENGTH;
  const extensions = new DataView(buffer.slice(EXTENSIONS_START, EXTENSIONS_START + extensions_length).buffer);

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
    const ec_point_format_count = extensions_parsed[EXTENSION_TYPE_EC_POINT_FORMAT].extension_data[0];
    const ec_point_formats = Array.from(new Uint8Array(extensions_parsed[EXTENSION_TYPE_EC_POINT_FORMAT].extension_data.buffer.slice(1)));
    ec_point_formats_joined = ec_point_formats.join('-');
  }

  /* Debug Output */
  if (DEBUG_MODE) {
    console.log('=== JA3 Fingerprint inputs ===');
    console.log("protocol version:", protocol_version);
    console.log("cipher suites:", cipher_suites_joined);
    console.log("extensions:", extensions_joined);
    console.log("elliptic curves:", elliptic_curves_joined);
    console.log("ec point formats:", ec_point_formats_joined);
    console.log("extensions type:", extensions_type);
  }

  return [protocol_version, cipher_suites_joined, extensions_joined, elliptic_curves_joined, ec_point_formats_joined].join(',');
}

export function getJA3Fingerprint(buffer) {
  const JA3_input = getJA3RawString(buffer);
  return digest.md5(JA3_input);
}
