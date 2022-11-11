import { WritableStream } from "streams";

import { crypto, pem2ab } from "crypto";

import { TextEncoder as TextEncoder$1, base16, atob, base64url } from "encoding";

import { logger } from "log";

import { httpRequest } from "http-request";

var TokenType, KeysType;

!function(TokenType) {
    TokenType.CWT = "CWT", TokenType.JWT = "JWT";
}(TokenType || (TokenType = {})), function(KeysType) {
    KeysType[KeysType.BASE64 = 0] = "BASE64", KeysType[KeysType.HEX = 1] = "HEX";
}(KeysType || (KeysType = {}));

"undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;

/*!
 * range-parser
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */ var rangeParser_1 = function(size, str, options) {
    if ("string" != typeof str) throw new TypeError("argument str must be a string");
    var index = str.indexOf("=");
    if (-1 === index) return -2;
    var arr = str.slice(index + 1).split(","), ranges = [];
    ranges.type = str.slice(0, index);
    for (var i = 0; i < arr.length; i++) {
        var range = arr[i].split("-"), start = parseInt(range[0], 10), end = parseInt(range[1], 10);
        isNaN(start) ? (start = size - end, end = size - 1) : isNaN(end) && (end = size - 1), 
        end > size - 1 && (end = size - 1), isNaN(start) || isNaN(end) || start > end || start < 0 || ranges.push({
            start,
            end
        });
    }
    if (ranges.length < 1) return -1;
    return options && options.combine ? function(ranges) {
        for (var ordered = ranges.map(mapWithIndex).sort(sortByRangeStart), j = 0, i = 1; i < ordered.length; i++) {
            var range = ordered[i], current = ordered[j];
            range.start > current.end + 1 ? ordered[++j] = range : range.end > current.end && (current.end = range.end, 
            current.index = Math.min(current.index, range.index));
        }
        ordered.length = j + 1;
        var combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex);
        return combined.type = ranges.type, combined;
    }(ranges) : ranges;
};

function mapWithIndex(range, index) {
    return {
        start: range.start,
        end: range.end,
        index
    };
}

function mapWithoutIndex(range) {
    return {
        start: range.start,
        end: range.end
    };
}

function sortByRangeIndex(a, b) {
    return a.index - b.index;
}

function sortByRangeStart(a, b) {
    return a.start - b.start;
}

class Util {
    static isEmptyString(str) {
        return str instanceof Uint8Array ? !str || 0 === str.length : "string" != typeof str || (!str || 0 === str.trim().length);
    }
    static numberToArrayBuffer(value, view, idx) {
        if (value < this.TWO_POWER_31 && value >= -this.TWO_POWER_31) for (let index = idx; index < idx + 8; index++) view.setUint8(index, value % 256), 
        value >>= 8; else {
            let big = BigInt(value);
            for (let index = idx; index < idx + 8; index++) view.setUint8(index, Number(big % BigInt(256))), 
            big >>= BigInt(8);
        }
    }
    static uint8ArrayToHex(uint8Array) {
        return Array.from(uint8Array, (function(byte) {
            return ("0" + (255 & byte).toString(16)).slice(-2);
        })).join("");
    }
    static parseRangeHeader(rangeHeader) {
        if ("string" == typeof rangeHeader) {
            const ranges = rangeParser_1(1 / 0, rangeHeader);
            if ("number" != typeof ranges && "bytes" === ranges.type && 1 === ranges.length) return ranges[0];
            throw new Error("Invalid range format!!");
        }
        throw new Error("Range header should be string!!");
    }
    static getURLByParts(url) {
        const slashPos = url.lastIndexOf("/");
        return {
            basedir: url.substring(0, slashPos),
            filename: url.substring(slashPos + 1)
        };
    }
    static async streamToUint8Array(stream, size) {
        const buffer = new ArrayBuffer(size), arr = new Uint8Array(buffer);
        let currentPos = 0;
        return await stream.pipeTo(new WritableStream({
            write(chunk) {
                arr.set(chunk, currentPos), currentPos += chunk.length;
            }
        })), arr;
    }
    static async buildKey(keys) {
        let key = "";
        for (const k of keys) k instanceof Uint8Array ? key += Util.uint8ArrayToHex(k) : key += "string" != typeof k ? JSON.stringify(k) : k.trim();
        const hashBuf = await crypto.subtle.digest("SHA-256", (new TextEncoder$1).encode(key));
        return Util.uint8ArrayToHex(new Uint8Array(hashBuf));
    }
}

Util.TWO_POWER_31 = 2147483648, Util.big0 = BigInt(0), Util.big1 = BigInt(1), Util.big8 = BigInt(8);

class IrdetoAlgorithm {
    static async generateTmid(wmid, wmopid, wmidfmt, wmpatlen, secretKey) {
        this.validateIrdetoArguments(wmpatlen, wmopid, secretKey);
        const wmidSHA1 = await this.calculateSHA1(wmid, wmidfmt), iv = this.calculateIV(wmopid), tmidSize = wmpatlen / 8, tmidArr = new Uint8Array(tmidSize);
        for (let i = 0; i < tmidSize; i++) tmidArr[i] = wmidSHA1[i % wmidSHA1.byteLength];
        try {
            const tmidArrCopy = new Uint8Array(tmidSize);
            for (let i = tmidSize / 16 - 1, j = 0; i >= 0; i--) {
                const offset = 16 * i, bufBlock = tmidArr.slice(offset, offset + 16);
                tmidArrCopy.set(bufBlock, j), j += 16;
            }
            const importedKey = await crypto.subtle.importKey("raw", base16.decode(secretKey, "Uint8Array").buffer, {
                name: "AES-CBC",
                length: 128
            }, !1, [ "encrypt" ]), out = await crypto.subtle.encrypt({
                name: "AES-CBC",
                length: 128,
                iv: new Uint8Array(iv.buffer)
            }, importedKey, tmidArrCopy.buffer), data = new Uint8Array(out.slice(0, out.byteLength - 16)), tmidArrReve = new Uint8Array(tmidSize);
            for (let i = tmidSize / 16 - 1, j = 0; i >= 0; i--) {
                const offset = 16 * i, bufBlock = data.slice(offset, offset + 16);
                tmidArrReve.set(bufBlock, j), j += 16;
            }
            return Util.uint8ArrayToHex(tmidArrReve);
        } catch (error) {
            throw new Error(`Irdeto: failed to generate tmid due to ${error.message}`);
        }
    }
    static validateIrdetoArguments(wmpatlen, wmopid, secretKey) {
        if (wmpatlen % 128 != 0) throw new Error("Irdeto: Invalid wmpatlen, it must be multiply of 128");
        if (wmopid < this.MIN_OPERATOR_ID || wmopid > this.MAX_OPERATOR_ID) throw new Error("Irdeto: Invalid wmopid, it must be between 1 and 511");
        if (wmpatlen < this.MIN_TMID_LENGTH || wmpatlen > this.MAX_TMID_LENGTH) throw new Error("Irdeto: Invalid wmpatlen, it must be between 128 and 4096.");
        if (32 != secretKey.length) throw new Error("Irdeto: secretKey is not correctly hex encoded");
    }
    static calculateIV(wmoid) {
        try {
            const ab16 = new ArrayBuffer(16), iv = new DataView(ab16);
            return Util.numberToArrayBuffer(wmoid, iv, 0), Util.numberToArrayBuffer(wmoid, iv, 8), 
            new Uint8Array(iv.buffer);
        } catch (err) {
            throw new Error(`Irdeto: failed to calculate initalization vector due to ${err.message}`);
        }
    }
    static async calculateSHA1(wmid, wmidfmt) {
        if ("string" == typeof wmid) {
            const data = (new TextEncoder$1).encode(wmid), key2DigestBuf = await crypto.subtle.digest("SHA-1", data);
            return new Uint8Array(key2DigestBuf);
        }
        if ("number" == typeof wmid && "uint" === wmidfmt) {
            const ab8 = new ArrayBuffer(8), bufView = new DataView(ab8);
            Util.numberToArrayBuffer(wmid, bufView, 0);
            const key2DigestBuf = await crypto.subtle.digest("SHA-1", bufView.buffer);
            return new Uint8Array(key2DigestBuf);
        }
        throw new Error("Irdeto: invalid wmid and wmidfmt, type doesnt match");
    }
}

let decoder, src, srcEnd;

IrdetoAlgorithm.MAX_OPERATOR_ID = 511, IrdetoAlgorithm.MIN_OPERATOR_ID = 1, IrdetoAlgorithm.MAX_TMID_LENGTH = 4096, 
IrdetoAlgorithm.MIN_TMID_LENGTH = 128;

try {
    decoder = new TextDecoder;
} catch (error) {}

let position$1 = 0;

const STOP_CODE = {};

let currentStructures, srcString, bundledStrings$1, referenceMap, packedValues, dataView, restoreMapsAsObject, currentDecoder = {}, srcStringStart = 0, srcStringEnd = 0, currentExtensions = [], currentExtensionRanges = [], defaultOptions = {
    useRecords: !1,
    mapsAsObjects: !0
}, sequentialMode = !1;

class Decoder {
    constructor(options) {
        if (options && (!options.keyMap && !options._keyMap || options.useRecords || (options.useRecords = !1, 
        options.mapsAsObjects = !0), !1 === options.useRecords && void 0 === options.mapsAsObjects && (options.mapsAsObjects = !0), 
        options.getStructures && (options.getShared = options.getStructures), options.getShared && !options.structures && ((options.structures = []).uninitialized = !0), 
        options.keyMap)) {
            this.mapKey = new Map;
            for (let [k, v] of Object.entries(options.keyMap)) this.mapKey.set(v, k);
        }
        Object.assign(this, options);
    }
    decodeKey(key) {
        return this.keyMap && this.mapKey.get(key) || key;
    }
    encodeKey(key) {
        return this.keyMap && this.keyMap.hasOwnProperty(key) ? this.keyMap[key] : key;
    }
    encodeKeys(rec) {
        if (!this._keyMap) return rec;
        let map = new Map;
        for (let [k, v] of Object.entries(rec)) map.set(this._keyMap.hasOwnProperty(k) ? this._keyMap[k] : k, v);
        return map;
    }
    decodeKeys(map) {
        if (!this._keyMap || "Map" != map.constructor.name) return map;
        if (!this._mapKey) {
            this._mapKey = new Map;
            for (let [k, v] of Object.entries(this._keyMap)) this._mapKey.set(v, k);
        }
        let res = {};
        return map.forEach(((v, k) => res[safeKey(this._mapKey.has(k) ? this._mapKey.get(k) : k)] = v)), 
        res;
    }
    mapDecode(source, end) {
        let res = this.decode(source);
        return this._keyMap && "Array" === res.constructor.name ? res.map((r => this.decodeKeys(r))) : res;
    }
    decode(source, end) {
        if (src) return saveState((() => (clearSource(), this ? this.decode(source, end) : Decoder.prototype.decode.call(defaultOptions, source, end))));
        srcEnd = end > -1 ? end : source.length, position$1 = 0, srcStringEnd = 0, srcString = null, 
        bundledStrings$1 = null, src = source;
        try {
            dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
        } catch (error) {
            if (src = null, source instanceof Uint8Array) throw error;
            throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && "object" == typeof source ? source.constructor.name : typeof source));
        }
        if (this instanceof Decoder) {
            if (currentDecoder = this, packedValues = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues), 
            this.structures) return currentStructures = this.structures, checkedRead();
            (!currentStructures || currentStructures.length > 0) && (currentStructures = []);
        } else currentDecoder = defaultOptions, (!currentStructures || currentStructures.length > 0) && (currentStructures = []), 
        packedValues = null;
        return checkedRead();
    }
    decodeMultiple(source, forEach) {
        let values, lastPosition = 0;
        try {
            let size = source.length;
            sequentialMode = !0;
            let value = this ? this.decode(source, size) : defaultDecoder.decode(source, size);
            if (!forEach) {
                for (values = [ value ]; position$1 < size; ) lastPosition = position$1, values.push(checkedRead());
                return values;
            }
            if (!1 === forEach(value)) return;
            for (;position$1 < size; ) if (lastPosition = position$1, !1 === forEach(checkedRead())) return;
        } catch (error) {
            throw error.lastPosition = lastPosition, error.values = values, error;
        } finally {
            sequentialMode = !1, clearSource();
        }
    }
}

function checkedRead() {
    try {
        let result = read();
        if (bundledStrings$1) {
            if (position$1 >= bundledStrings$1.postBundlePosition) {
                let error = new Error("Unexpected bundle position");
                throw error.incomplete = !0, error;
            }
            position$1 = bundledStrings$1.postBundlePosition, bundledStrings$1 = null;
        }
        if (position$1 == srcEnd) currentStructures = null, src = null, referenceMap && (referenceMap = null); else {
            if (position$1 > srcEnd) {
                let error = new Error("Unexpected end of CBOR data");
                throw error.incomplete = !0, error;
            }
            if (!sequentialMode) throw new Error("Data read, but end of buffer not reached");
        }
        return result;
    } catch (error) {
        throw clearSource(), (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer")) && (error.incomplete = !0), 
        error;
    }
}

function read() {
    let token = src[position$1++], majorType = token >> 5;
    if (token &= 31, token > 23) switch (token) {
      case 24:
        token = src[position$1++];
        break;

      case 25:
        if (7 == majorType) return function() {
            let byte0 = src[position$1++], byte1 = src[position$1++], exponent = (127 & byte0) >> 2;
            if (31 === exponent) return byte1 || 3 & byte0 ? NaN : 128 & byte0 ? -1 / 0 : 1 / 0;
            if (0 === exponent) {
                let abs = ((3 & byte0) << 8 | byte1) / (1 << 24);
                return 128 & byte0 ? -abs : abs;
            }
            return u8Array[3] = 128 & byte0 | 56 + (exponent >> 1), u8Array[2] = (7 & byte0) << 5 | byte1 >> 3, 
            u8Array[1] = byte1 << 5, u8Array[0] = 0, f32Array[0];
        }();
        token = dataView.getUint16(position$1), position$1 += 2;
        break;

      case 26:
        if (7 == majorType) {
            let value = dataView.getFloat32(position$1);
            if (currentDecoder.useFloat32 > 2) {
                let multiplier = mult10[(127 & src[position$1]) << 1 | src[position$1 + 1] >> 7];
                return position$1 += 4, (multiplier * value + (value > 0 ? .5 : -.5) >> 0) / multiplier;
            }
            return position$1 += 4, value;
        }
        token = dataView.getUint32(position$1), position$1 += 4;
        break;

      case 27:
        if (7 == majorType) {
            let value = dataView.getFloat64(position$1);
            return position$1 += 8, value;
        }
        if (majorType > 1) {
            if (dataView.getUint32(position$1) > 0) throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
            token = dataView.getUint32(position$1 + 4);
        } else currentDecoder.int64AsNumber ? (token = 4294967296 * dataView.getUint32(position$1), 
        token += dataView.getUint32(position$1 + 4)) : token = dataView.getBigUint64(position$1);
        position$1 += 8;
        break;

      case 31:
        switch (majorType) {
          case 2:
          case 3:
            throw new Error("Indefinite length not supported for byte or text strings");

          case 4:
            let value, array = [], i = 0;
            for (;(value = read()) != STOP_CODE; ) array[i++] = value;
            return 4 == majorType ? array : 3 == majorType ? array.join("") : Buffer.concat(array);

          case 5:
            let key;
            if (currentDecoder.mapsAsObjects) {
                let object = {};
                if (currentDecoder.keyMap) for (;(key = read()) != STOP_CODE; ) object[safeKey(currentDecoder.decodeKey(key))] = read(); else for (;(key = read()) != STOP_CODE; ) object[safeKey(key)] = read();
                return object;
            }
            {
                restoreMapsAsObject && (currentDecoder.mapsAsObjects = !0, restoreMapsAsObject = !1);
                let map = new Map;
                if (currentDecoder.keyMap) for (;(key = read()) != STOP_CODE; ) map.set(currentDecoder.decodeKey(key), read()); else for (;(key = read()) != STOP_CODE; ) map.set(key, read());
                return map;
            }

          case 7:
            return STOP_CODE;

          default:
            throw new Error("Invalid major type for indefinite length " + majorType);
        }

      default:
        throw new Error("Unknown token " + token);
    }
    switch (majorType) {
      case 0:
        return token;

      case 1:
        return ~token;

      case 2:
        return length = token, currentDecoder.copyBuffers ? Uint8Array.prototype.slice.call(src, position$1, position$1 += length) : src.subarray(position$1, position$1 += length);

      case 3:
        if (srcStringEnd >= position$1) return srcString.slice(position$1 - srcStringStart, (position$1 += token) - srcStringStart);
        if (0 == srcStringEnd && srcEnd < 140 && token < 32) {
            let string = token < 16 ? shortStringInJS(token) : function(length) {
                let start = position$1, bytes = new Array(length);
                for (let i = 0; i < length; i++) {
                    const byte = src[position$1++];
                    if ((128 & byte) > 0) return void (position$1 = start);
                    bytes[i] = byte;
                }
                return fromCharCode.apply(String, bytes);
            }(token);
            if (null != string) return string;
        }
        return readFixedString(token);

      case 4:
        let array = new Array(token);
        for (let i = 0; i < token; i++) array[i] = read();
        return array;

      case 5:
        if (currentDecoder.mapsAsObjects) {
            let object = {};
            if (currentDecoder.keyMap) for (let i = 0; i < token; i++) object[safeKey(currentDecoder.decodeKey(read()))] = read(); else for (let i = 0; i < token; i++) object[safeKey(read())] = read();
            return object;
        }
        {
            restoreMapsAsObject && (currentDecoder.mapsAsObjects = !0, restoreMapsAsObject = !1);
            let map = new Map;
            if (currentDecoder.keyMap) for (let i = 0; i < token; i++) map.set(currentDecoder.decodeKey(read()), read()); else for (let i = 0; i < token; i++) map.set(read(), read());
            return map;
        }

      case 6:
        if (token >= 57337) {
            let structure = currentStructures[8191 & token];
            if (structure) return structure.read || (structure.read = createStructureReader(structure)), 
            structure.read();
            if (token < 65536) {
                if (57343 == token) return recordDefinition(read());
                if (57342 == token) {
                    let length = readJustLength(), id = read();
                    for (let i = 2; i < length; i++) recordDefinition([ id++, read() ]);
                    return read();
                }
                if (57337 == token) return function() {
                    let length = readJustLength(), bundlePosition = position$1 + read();
                    for (let i = 2; i < length; i++) {
                        let bundleLength = readJustLength();
                        position$1 += bundleLength;
                    }
                    let dataPosition = position$1;
                    return position$1 = bundlePosition, bundledStrings$1 = [ readStringJS(readJustLength()), readStringJS(readJustLength()) ], 
                    bundledStrings$1.position0 = 0, bundledStrings$1.position1 = 0, bundledStrings$1.postBundlePosition = position$1, 
                    position$1 = dataPosition, read();
                }();
                if (currentDecoder.getShared && (loadShared(), structure = currentStructures[8191 & token], 
                structure)) return structure.read || (structure.read = createStructureReader(structure)), 
                structure.read();
            }
        }
        let extension = currentExtensions[token];
        if (extension) return extension.handlesRead ? extension(read) : extension(read());
        {
            let input = read();
            for (let i = 0; i < currentExtensionRanges.length; i++) {
                let value = currentExtensionRanges[i](token, input);
                if (void 0 !== value) return value;
            }
            return new Tag(input, token);
        }

      case 7:
        switch (token) {
          case 20:
            return !1;

          case 21:
            return !0;

          case 22:
            return null;

          case 23:
            return;

          default:
            let packedValue = (packedValues || getPackedValues())[token];
            if (void 0 !== packedValue) return packedValue;
            throw new Error("Unknown token " + token);
        }

      default:
        if (isNaN(token)) {
            let error = new Error("Unexpected end of CBOR data");
            throw error.incomplete = !0, error;
        }
        throw new Error("Unknown CBOR token " + token);
    }
    var length;
}

const validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;

function createStructureReader(structure) {
    return structure.slowReads = 0, function() {
        let length = src[position$1++];
        if (length &= 31, length > 23) switch (length) {
          case 24:
            length = src[position$1++];
            break;

          case 25:
            length = dataView.getUint16(position$1), position$1 += 2;
            break;

          case 26:
            length = dataView.getUint32(position$1), position$1 += 4;
            break;

          default:
            throw new Error("Expected array header, but got " + src[position$1 - 1]);
        }
        let compiledReader = this.compiledReader;
        for (;compiledReader; ) {
            if (compiledReader.propertyCount === length) return compiledReader(read);
            compiledReader = compiledReader.next;
        }
        if (this.slowReads++ >= 3) {
            let array = this.length == length ? this : this.slice(0, length);
            return compiledReader = currentDecoder.keyMap ? new Function("r", "return {" + array.map((k => currentDecoder.decodeKey(k))).map((k => validName.test(k) ? safeKey(k) + ":r()" : "[" + JSON.stringify(k) + "]:r()")).join(",") + "}") : new Function("r", "return {" + array.map((key => validName.test(key) ? safeKey(key) + ":r()" : "[" + JSON.stringify(key) + "]:r()")).join(",") + "}"), 
            this.compiledReader && (compiledReader.next = this.compiledReader), compiledReader.propertyCount = length, 
            this.compiledReader = compiledReader, compiledReader(read);
        }
        let object = {};
        if (currentDecoder.keyMap) for (let i = 0; i < length; i++) object[safeKey(currentDecoder.decodeKey(this[i]))] = read(); else for (let i = 0; i < length; i++) object[safeKey(this[i])] = read();
        return object;
    };
}

function safeKey(key) {
    return "__proto__" === key ? "__proto_" : key;
}

let readFixedString = readStringJS;

function readStringJS(length) {
    let result;
    if (length < 16 && (result = shortStringInJS(length))) return result;
    if (length > 64 && decoder) return decoder.decode(src.subarray(position$1, position$1 += length));
    const end = position$1 + length, units = [];
    for (result = ""; position$1 < end; ) {
        const byte1 = src[position$1++];
        if (0 == (128 & byte1)) units.push(byte1); else if (192 == (224 & byte1)) {
            const byte2 = 63 & src[position$1++];
            units.push((31 & byte1) << 6 | byte2);
        } else if (224 == (240 & byte1)) {
            const byte2 = 63 & src[position$1++], byte3 = 63 & src[position$1++];
            units.push((31 & byte1) << 12 | byte2 << 6 | byte3);
        } else if (240 == (248 & byte1)) {
            let unit = (7 & byte1) << 18 | (63 & src[position$1++]) << 12 | (63 & src[position$1++]) << 6 | 63 & src[position$1++];
            unit > 65535 && (unit -= 65536, units.push(unit >>> 10 & 1023 | 55296), unit = 56320 | 1023 & unit), 
            units.push(unit);
        } else units.push(byte1);
        units.length >= 4096 && (result += fromCharCode.apply(String, units), units.length = 0);
    }
    return units.length > 0 && (result += fromCharCode.apply(String, units)), result;
}

let fromCharCode = String.fromCharCode;

function shortStringInJS(length) {
    if (length < 4) {
        if (length < 2) {
            if (0 === length) return "";
            {
                let a = src[position$1++];
                return (128 & a) > 1 ? void (position$1 -= 1) : fromCharCode(a);
            }
        }
        {
            let a = src[position$1++], b = src[position$1++];
            if ((128 & a) > 0 || (128 & b) > 0) return void (position$1 -= 2);
            if (length < 3) return fromCharCode(a, b);
            let c = src[position$1++];
            return (128 & c) > 0 ? void (position$1 -= 3) : fromCharCode(a, b, c);
        }
    }
    {
        let a = src[position$1++], b = src[position$1++], c = src[position$1++], d = src[position$1++];
        if ((128 & a) > 0 || (128 & b) > 0 || (128 & c) > 0 || (128 & d) > 0) return void (position$1 -= 4);
        if (length < 6) {
            if (4 === length) return fromCharCode(a, b, c, d);
            {
                let e = src[position$1++];
                return (128 & e) > 0 ? void (position$1 -= 5) : fromCharCode(a, b, c, d, e);
            }
        }
        if (length < 8) {
            let e = src[position$1++], f = src[position$1++];
            if ((128 & e) > 0 || (128 & f) > 0) return void (position$1 -= 6);
            if (length < 7) return fromCharCode(a, b, c, d, e, f);
            let g = src[position$1++];
            return (128 & g) > 0 ? void (position$1 -= 7) : fromCharCode(a, b, c, d, e, f, g);
        }
        {
            let e = src[position$1++], f = src[position$1++], g = src[position$1++], h = src[position$1++];
            if ((128 & e) > 0 || (128 & f) > 0 || (128 & g) > 0 || (128 & h) > 0) return void (position$1 -= 8);
            if (length < 10) {
                if (8 === length) return fromCharCode(a, b, c, d, e, f, g, h);
                {
                    let i = src[position$1++];
                    return (128 & i) > 0 ? void (position$1 -= 9) : fromCharCode(a, b, c, d, e, f, g, h, i);
                }
            }
            if (length < 12) {
                let i = src[position$1++], j = src[position$1++];
                if ((128 & i) > 0 || (128 & j) > 0) return void (position$1 -= 10);
                if (length < 11) return fromCharCode(a, b, c, d, e, f, g, h, i, j);
                let k = src[position$1++];
                return (128 & k) > 0 ? void (position$1 -= 11) : fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
            }
            {
                let i = src[position$1++], j = src[position$1++], k = src[position$1++], l = src[position$1++];
                if ((128 & i) > 0 || (128 & j) > 0 || (128 & k) > 0 || (128 & l) > 0) return void (position$1 -= 12);
                if (length < 14) {
                    if (12 === length) return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
                    {
                        let m = src[position$1++];
                        return (128 & m) > 0 ? void (position$1 -= 13) : fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
                    }
                }
                {
                    let m = src[position$1++], n = src[position$1++];
                    if ((128 & m) > 0 || (128 & n) > 0) return void (position$1 -= 14);
                    if (length < 15) return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
                    let o = src[position$1++];
                    return (128 & o) > 0 ? void (position$1 -= 15) : fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
                }
            }
        }
    }
}

let f32Array = new Float32Array(1), u8Array = new Uint8Array(f32Array.buffer, 0, 4);

new Array(4096);

class Tag {
    constructor(value, tag) {
        this.value = value, this.tag = tag;
    }
}

currentExtensions[0] = dateString => new Date(dateString), currentExtensions[1] = epochSec => new Date(Math.round(1e3 * epochSec)), 
currentExtensions[2] = buffer => {
    let value = BigInt(0);
    for (let i = 0, l = buffer.byteLength; i < l; i++) value = BigInt(buffer[i]) + value << BigInt(8);
    return value;
}, currentExtensions[3] = buffer => BigInt(-1) - currentExtensions[2](buffer), currentExtensions[4] = fraction => +(fraction[1] + "e" + fraction[0]), 
currentExtensions[5] = fraction => fraction[1] * Math.exp(fraction[0] * Math.log(2));

const recordDefinition = definition => {
    let id = definition[0] - 57344, structure = definition[1], existingStructure = currentStructures[id];
    existingStructure && existingStructure.isShared && ((currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure), 
    currentStructures[id] = structure, structure.read = createStructureReader(structure);
    let object = {};
    if (currentDecoder.keyMap) for (let i = 2, l = definition.length; i < l; i++) {
        object[safeKey(currentDecoder.decodeKey(structure[i - 2]))] = definition[i];
    } else for (let i = 2, l = definition.length; i < l; i++) {
        object[safeKey(structure[i - 2])] = definition[i];
    }
    return object;
};

currentExtensions[105] = recordDefinition, currentExtensions[14] = value => bundledStrings$1 ? bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 += value) : new Tag(value, 14), 
currentExtensions[15] = value => bundledStrings$1 ? bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value) : new Tag(value, 15);

let glbl = {
    Error,
    RegExp
};

currentExtensions[27] = data => (glbl[data[0]] || Error)(data[1], data[2]);

const packedTable = read => {
    if (132 != src[position$1++]) throw new Error("Packed values structure must be followed by a 4 element array");
    let newPackedValues = read();
    return packedValues = packedValues ? newPackedValues.concat(packedValues.slice(newPackedValues.length)) : newPackedValues, 
    packedValues.prefixes = read(), packedValues.suffixes = read(), read();
};

function combine(a, b) {
    return "string" == typeof a ? a + b : a instanceof Array ? a.concat(b) : Object.assign({}, a, b);
}

function getPackedValues() {
    if (!packedValues) {
        if (!currentDecoder.getShared) throw new Error("No packed values available");
        loadShared();
    }
    return packedValues;
}

packedTable.handlesRead = !0, currentExtensions[51] = packedTable, currentExtensions[6] = data => {
    if (!packedValues) {
        if (!currentDecoder.getShared) return new Tag(data, 6);
        loadShared();
    }
    if ("number" == typeof data) return packedValues[16 + (data >= 0 ? 2 * data : -2 * data - 1)];
    throw new Error("No support for non-integer packed references yet");
}, currentExtensions[25] = id => stringRefs[id], currentExtensions[256] = read => {
    stringRefs = [];
    try {
        return read();
    } finally {
        stringRefs = null;
    }
}, currentExtensions[256].handlesRead = !0, currentExtensions[28] = read => {
    referenceMap || (referenceMap = new Map, referenceMap.id = 0);
    let target, id = referenceMap.id++;
    target = src[position$1] >> 5 == 4 ? [] : {};
    let refEntry = {
        target
    };
    referenceMap.set(id, refEntry);
    let targetProperties = read();
    return refEntry.used ? Object.assign(target, targetProperties) : (refEntry.target = targetProperties, 
    targetProperties);
}, currentExtensions[28].handlesRead = !0, currentExtensions[29] = id => {
    let refEntry = referenceMap.get(id);
    return refEntry.used = !0, refEntry.target;
}, currentExtensions[258] = array => new Set(array), (currentExtensions[259] = read => (currentDecoder.mapsAsObjects && (currentDecoder.mapsAsObjects = !1, 
restoreMapsAsObject = !0), read())).handlesRead = !0;

currentExtensionRanges.push(((tag, input) => tag >= 225 && tag <= 255 ? combine(getPackedValues().prefixes[tag - 224], input) : tag >= 28704 && tag <= 32767 ? combine(getPackedValues().prefixes[tag - 28672], input) : tag >= 1879052288 && tag <= 2147483647 ? combine(getPackedValues().prefixes[tag - 1879048192], input) : tag >= 216 && tag <= 223 ? combine(input, getPackedValues().suffixes[tag - 216]) : tag >= 27647 && tag <= 28671 ? combine(input, getPackedValues().suffixes[tag - 27639]) : tag >= 1811940352 && tag <= 1879048191 ? combine(input, getPackedValues().suffixes[tag - 1811939328]) : 1399353956 == tag ? {
    packedValues,
    structures: currentStructures.slice(0),
    version: input
} : 55799 == tag ? input : void 0));

const isLittleEndianMachine$1 = 1 == new Uint8Array(new Uint16Array([ 1 ]).buffer)[0], typedArrays = [ Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, "undefined" == typeof BigUint64Array ? {
    name: "BigUint64Array"
} : BigUint64Array, Int8Array, Int16Array, Int32Array, "undefined" == typeof BigInt64Array ? {
    name: "BigInt64Array"
} : BigInt64Array, Float32Array, Float64Array ], typedArrayTags = [ 64, 68, 69, 70, 71, 72, 77, 78, 79, 85, 86 ];

for (let i = 0; i < typedArrays.length; i++) registerTypedArray(typedArrays[i], typedArrayTags[i]);

function registerTypedArray(TypedArray, tag) {
    let dvMethod = "get" + TypedArray.name.slice(0, -5);
    "function" != typeof TypedArray && (TypedArray = null);
    let bytesPerElement = TypedArray.BYTES_PER_ELEMENT;
    for (let littleEndian = 0; littleEndian < 2; littleEndian++) {
        if (!littleEndian && 1 == bytesPerElement) continue;
        let sizeShift = 2 == bytesPerElement ? 1 : 4 == bytesPerElement ? 2 : 3;
        currentExtensions[littleEndian ? tag : tag - 4] = 1 == bytesPerElement || littleEndian == isLittleEndianMachine$1 ? buffer => {
            if (!TypedArray) throw new Error("Could not find typed array for code " + tag);
            return new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer);
        } : buffer => {
            if (!TypedArray) throw new Error("Could not find typed array for code " + tag);
            let dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength), elements = buffer.length >> sizeShift, ta = new TypedArray(elements), method = dv[dvMethod];
            for (let i = 0; i < elements; i++) ta[i] = method.call(dv, i << sizeShift, littleEndian);
            return ta;
        };
    }
}

function readJustLength() {
    let token = 31 & src[position$1++];
    if (token > 23) switch (token) {
      case 24:
        token = src[position$1++];
        break;

      case 25:
        token = dataView.getUint16(position$1), position$1 += 2;
        break;

      case 26:
        token = dataView.getUint32(position$1), position$1 += 4;
    }
    return token;
}

function loadShared() {
    if (currentDecoder.getShared) {
        let sharedData = saveState((() => (src = null, currentDecoder.getShared()))) || {}, updatedStructures = sharedData.structures || [];
        currentDecoder.sharedVersion = sharedData.version, packedValues = currentDecoder.sharedValues = sharedData.packedValues, 
        !0 === currentStructures ? currentDecoder.structures = currentStructures = updatedStructures : currentStructures.splice.apply(currentStructures, [ 0, updatedStructures.length ].concat(updatedStructures));
    }
}

function saveState(callback) {
    let savedSrcEnd = srcEnd, savedPosition = position$1, savedSrcStringStart = srcStringStart, savedSrcStringEnd = srcStringEnd, savedSrcString = srcString, savedReferenceMap = referenceMap, savedBundledStrings = bundledStrings$1, savedSrc = new Uint8Array(src.slice(0, srcEnd)), savedStructures = currentStructures, savedDecoder = currentDecoder, savedSequentialMode = sequentialMode, value = callback();
    return srcEnd = savedSrcEnd, position$1 = savedPosition, srcStringStart = savedSrcStringStart, 
    srcStringEnd = savedSrcStringEnd, srcString = savedSrcString, referenceMap = savedReferenceMap, 
    bundledStrings$1 = savedBundledStrings, src = savedSrc, sequentialMode = savedSequentialMode, 
    currentStructures = savedStructures, currentDecoder = savedDecoder, dataView = new DataView(src.buffer, src.byteOffset, src.byteLength), 
    value;
}

function clearSource() {
    src = null, referenceMap = null, currentStructures = null;
}

const mult10 = new Array(147);

for (let i = 0; i < 256; i++) mult10[i] = +("1e" + Math.floor(45.15 - .30103 * i));

let defaultDecoder = new Decoder({
    useRecords: !1
});

const decode = defaultDecoder.decode;

let textEncoder, extensions, extensionClasses;

defaultDecoder.decodeMultiple;

try {
    textEncoder = new TextEncoder;
} catch (error) {}

const hasNodeBuffer = "undefined" != typeof Buffer, ByteArrayAllocate = hasNodeBuffer ? Buffer.allocUnsafeSlow : Uint8Array, ByteArray = hasNodeBuffer ? Buffer : Uint8Array, MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;

let target, targetView, safeEnd, position = 0, bundledStrings = null;

const hasNonLatin = /[\u0080-\uFFFF]/, RECORD_SYMBOL = Symbol("record-id");

class Encoder extends Decoder {
    constructor(options) {
        let start, sharedStructures, hasSharedUpdate, structures, referenceMap;
        super(options), this.offset = 0, options = options || {};
        let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position, maxBytes) {
            return target.utf8Write(string, position, maxBytes);
        } : !(!textEncoder || !textEncoder.encodeInto) && function(string, position) {
            return textEncoder.encodeInto(string, target.subarray(position)).written;
        }, encoder = this, hasSharedStructures = options.structures || options.saveStructures, maxSharedStructures = options.maxSharedStructures;
        if (null == maxSharedStructures && (maxSharedStructures = hasSharedStructures ? 128 : 0), 
        maxSharedStructures > 8190) throw new Error("Maximum maxSharedStructure is 8190");
        let isSequential = options.sequential;
        isSequential && (maxSharedStructures = 0), this.structures || (this.structures = []), 
        this.saveStructures && (this.saveShared = this.saveStructures);
        let samplingPackedValues, packedObjectMap, sharedPackedObjectMap, sharedValues = options.sharedValues;
        if (sharedValues) {
            sharedPackedObjectMap = Object.create(null);
            for (let i = 0, l = sharedValues.length; i < l; i++) sharedPackedObjectMap[sharedValues[i]] = i;
        }
        let recordIdsToRemove = [], transitionsCount = 0, serializationsSinceTransitionRebuild = 0;
        this.mapEncode = function(value, encodeOptions) {
            if (this._keyMap && !this._mapped && "Array" === value.constructor.name) value = value.map((r => this.encodeKeys(r)));
            return this.encode(value, encodeOptions);
        }, this.encode = function(value, encodeOptions) {
            if (target || (target = new ByteArrayAllocate(8192), targetView = new DataView(target.buffer, 0, 8192), 
            position = 0), safeEnd = target.length - 10, safeEnd - position < 2048 ? (target = new ByteArrayAllocate(target.length), 
            targetView = new DataView(target.buffer, 0, target.length), safeEnd = target.length - 10, 
            position = 0) : encodeOptions === REUSE_BUFFER_MODE && (position = position + 7 & 2147483640), 
            start = position, encoder.useSelfDescribedHeader && (targetView.setUint32(position, 3654940416), 
            position += 3), referenceMap = encoder.structuredClone ? new Map : null, encoder.bundleStrings && "string" != typeof value ? (bundledStrings = [], 
            bundledStrings.size = 1 / 0) : bundledStrings = null, sharedStructures = encoder.structures, 
            sharedStructures) {
                if (sharedStructures.uninitialized) {
                    let sharedData = encoder.getShared() || {};
                    encoder.structures = sharedStructures = sharedData.structures || [], encoder.sharedVersion = sharedData.version;
                    let sharedValues = encoder.sharedValues = sharedData.packedValues;
                    if (sharedValues) {
                        sharedPackedObjectMap = {};
                        for (let i = 0, l = sharedValues.length; i < l; i++) sharedPackedObjectMap[sharedValues[i]] = i;
                    }
                }
                let sharedStructuresLength = sharedStructures.length;
                if (sharedStructuresLength > maxSharedStructures && !isSequential && (sharedStructuresLength = maxSharedStructures), 
                !sharedStructures.transitions) {
                    sharedStructures.transitions = Object.create(null);
                    for (let i = 0; i < sharedStructuresLength; i++) {
                        let keys = sharedStructures[i];
                        if (!keys) continue;
                        let nextTransition, transition = sharedStructures.transitions;
                        for (let j = 0, l = keys.length; j < l; j++) {
                            void 0 === transition[RECORD_SYMBOL] && (transition[RECORD_SYMBOL] = i);
                            let key = keys[j];
                            nextTransition = transition[key], nextTransition || (nextTransition = transition[key] = Object.create(null)), 
                            transition = nextTransition;
                        }
                        transition[RECORD_SYMBOL] = 1048576 | i;
                    }
                }
                isSequential || (sharedStructures.nextId = sharedStructuresLength);
            }
            if (hasSharedUpdate && (hasSharedUpdate = !1), structures = sharedStructures || [], 
            packedObjectMap = sharedPackedObjectMap, options.pack) {
                let packedValues = new Map;
                if (packedValues.values = [], packedValues.encoder = encoder, packedValues.maxValues = options.maxPrivatePackedValues || (sharedPackedObjectMap ? 16 : 1 / 0), 
                packedValues.objectMap = sharedPackedObjectMap || !1, packedValues.samplingPackedValues = samplingPackedValues, 
                findRepetitiveStrings(value, packedValues), packedValues.values.length > 0) {
                    target[position++] = 216, target[position++] = 51, writeArrayHeader(4);
                    let valuesArray = packedValues.values;
                    encode(valuesArray), writeArrayHeader(0), writeArrayHeader(0), packedObjectMap = Object.create(sharedPackedObjectMap || null);
                    for (let i = 0, l = valuesArray.length; i < l; i++) packedObjectMap[valuesArray[i]] = i;
                }
            }
            try {
                if (encode(value), bundledStrings && writeBundles(start, encode), encoder.offset = position, 
                referenceMap && referenceMap.idsToInsert) {
                    position += 2 * referenceMap.idsToInsert.length, position > safeEnd && makeRoom(position), 
                    encoder.offset = position;
                    let serialized = function(serialized, idsToInsert) {
                        let nextId, distanceToMove = 2 * idsToInsert.length, lastEnd = serialized.length - distanceToMove;
                        idsToInsert.sort(((a, b) => a.offset > b.offset ? 1 : -1));
                        for (let id = 0; id < idsToInsert.length; id++) {
                            let referee = idsToInsert[id];
                            referee.id = id;
                            for (let position of referee.references) serialized[position++] = id >> 8, serialized[position] = 255 & id;
                        }
                        for (;nextId = idsToInsert.pop(); ) {
                            let offset = nextId.offset;
                            serialized.copyWithin(offset + distanceToMove, offset, lastEnd), distanceToMove -= 2;
                            let position = offset + distanceToMove;
                            serialized[position++] = 216, serialized[position++] = 28, lastEnd = offset;
                        }
                        return serialized;
                    }(target.subarray(start, position), referenceMap.idsToInsert);
                    return referenceMap = null, serialized;
                }
                return encodeOptions & REUSE_BUFFER_MODE ? (target.start = start, target.end = position, 
                target) : target.subarray(start, position);
            } finally {
                if (sharedStructures) if (serializationsSinceTransitionRebuild < 10 && serializationsSinceTransitionRebuild++, 
                sharedStructures.length > maxSharedStructures && (sharedStructures.length = maxSharedStructures), 
                transitionsCount > 1e4) sharedStructures.transitions = null, serializationsSinceTransitionRebuild = 0, 
                transitionsCount = 0, recordIdsToRemove.length > 0 && (recordIdsToRemove = []); else if (recordIdsToRemove.length > 0 && !isSequential) {
                    for (let i = 0, l = recordIdsToRemove.length; i < l; i++) recordIdsToRemove[i][RECORD_SYMBOL] = void 0;
                    recordIdsToRemove = [];
                }
                if (hasSharedUpdate && encoder.saveShared) {
                    encoder.structures.length > maxSharedStructures && (encoder.structures = encoder.structures.slice(0, maxSharedStructures));
                    let returnBuffer = target.subarray(start, position);
                    return !1 === encoder.updateSharedData() ? encoder.encode(value) : returnBuffer;
                }
                encodeOptions & RESET_BUFFER_MODE && (position = start);
            }
        }, this.findCommonStringsToPack = () => (samplingPackedValues = new Map, sharedPackedObjectMap || (sharedPackedObjectMap = Object.create(null)), 
        options => {
            let threshold = options && options.threshold || 4, position = this.pack ? options.maxPrivatePackedValues || 16 : 0;
            sharedValues || (sharedValues = this.sharedValues = []);
            for (let [key, status] of samplingPackedValues) status.count > threshold && (sharedPackedObjectMap[key] = position++, 
            sharedValues.push(key), hasSharedUpdate = !0);
            for (;this.saveShared && !1 === this.updateSharedData(); ) ;
            samplingPackedValues = null;
        });
        const encode = value => {
            position > safeEnd && (target = makeRoom(position));
            var length, type = typeof value;
            if ("string" === type) {
                if (packedObjectMap) {
                    let packedPosition = packedObjectMap[value];
                    if (packedPosition >= 0) return void (packedPosition < 16 ? target[position++] = packedPosition + 224 : (target[position++] = 198, 
                    encode(1 & packedPosition ? 15 - packedPosition >> 1 : packedPosition - 16 >> 1)));
                    if (samplingPackedValues && !options.pack) {
                        let status = samplingPackedValues.get(value);
                        status ? status.count++ : samplingPackedValues.set(value, {
                            count: 1
                        });
                    }
                }
                let headerSize, strLength = value.length;
                if (bundledStrings && strLength >= 4 && strLength < 1024) {
                    if ((bundledStrings.size += strLength) > 61440) {
                        let extStart, maxBytes = (bundledStrings[0] ? 3 * bundledStrings[0].length + bundledStrings[1].length : 0) + 10;
                        position + maxBytes > safeEnd && (target = makeRoom(position + maxBytes)), target[position++] = 217, 
                        target[position++] = 223, target[position++] = 249, target[position++] = bundledStrings.position ? 132 : 130, 
                        target[position++] = 26, extStart = position - start, position += 4, bundledStrings.position && writeBundles(start, encode), 
                        bundledStrings = [ "", "" ], bundledStrings.size = 0, bundledStrings.position = extStart;
                    }
                    let twoByte = hasNonLatin.test(value);
                    return bundledStrings[twoByte ? 0 : 1] += value, target[position++] = twoByte ? 206 : 207, 
                    void encode(strLength);
                }
                headerSize = strLength < 32 ? 1 : strLength < 256 ? 2 : strLength < 65536 ? 3 : 5;
                let maxBytes = 3 * strLength;
                if (position + maxBytes > safeEnd && (target = makeRoom(position + maxBytes)), strLength < 64 || !encodeUtf8) {
                    let i, c1, c2, strPosition = position + headerSize;
                    for (i = 0; i < strLength; i++) c1 = value.charCodeAt(i), c1 < 128 ? target[strPosition++] = c1 : c1 < 2048 ? (target[strPosition++] = c1 >> 6 | 192, 
                    target[strPosition++] = 63 & c1 | 128) : 55296 == (64512 & c1) && 56320 == (64512 & (c2 = value.charCodeAt(i + 1))) ? (c1 = 65536 + ((1023 & c1) << 10) + (1023 & c2), 
                    i++, target[strPosition++] = c1 >> 18 | 240, target[strPosition++] = c1 >> 12 & 63 | 128, 
                    target[strPosition++] = c1 >> 6 & 63 | 128, target[strPosition++] = 63 & c1 | 128) : (target[strPosition++] = c1 >> 12 | 224, 
                    target[strPosition++] = c1 >> 6 & 63 | 128, target[strPosition++] = 63 & c1 | 128);
                    length = strPosition - position - headerSize;
                } else length = encodeUtf8(value, position + headerSize, maxBytes);
                length < 24 ? target[position++] = 96 | length : length < 256 ? (headerSize < 2 && target.copyWithin(position + 2, position + 1, position + 1 + length), 
                target[position++] = 120, target[position++] = length) : length < 65536 ? (headerSize < 3 && target.copyWithin(position + 3, position + 2, position + 2 + length), 
                target[position++] = 121, target[position++] = length >> 8, target[position++] = 255 & length) : (headerSize < 5 && target.copyWithin(position + 5, position + 3, position + 3 + length), 
                target[position++] = 122, targetView.setUint32(position, length), position += 4), 
                position += length;
            } else if ("number" === type) if (value >>> 0 === value) value < 24 ? target[position++] = value : value < 256 ? (target[position++] = 24, 
            target[position++] = value) : value < 65536 ? (target[position++] = 25, target[position++] = value >> 8, 
            target[position++] = 255 & value) : (target[position++] = 26, targetView.setUint32(position, value), 
            position += 4); else if (value >> 0 === value) value >= -24 ? target[position++] = 31 - value : value >= -256 ? (target[position++] = 56, 
            target[position++] = ~value) : value >= -65536 ? (target[position++] = 57, targetView.setUint16(position, ~value), 
            position += 2) : (target[position++] = 58, targetView.setUint32(position, ~value), 
            position += 4); else {
                let useFloat32;
                if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
                    let xShifted;
                    if (target[position++] = 250, targetView.setFloat32(position, value), useFloat32 < 4 || (xShifted = value * mult10[(127 & target[position]) << 1 | target[position + 1] >> 7]) >> 0 === xShifted) return void (position += 4);
                    position--;
                }
                target[position++] = 251, targetView.setFloat64(position, value), position += 8;
            } else if ("object" === type) if (value) {
                if (referenceMap) {
                    let referee = referenceMap.get(value);
                    if (referee) {
                        if (target[position++] = 216, target[position++] = 29, target[position++] = 25, 
                        !referee.references) {
                            let idsToInsert = referenceMap.idsToInsert || (referenceMap.idsToInsert = []);
                            referee.references = [], idsToInsert.push(referee);
                        }
                        return referee.references.push(position - start), void (position += 2);
                    }
                    referenceMap.set(value, {
                        offset: position - start
                    });
                }
                let constructor = value.constructor;
                if (constructor === Object) writeObject(value, !0); else if (constructor === Array) {
                    (length = value.length) < 24 ? target[position++] = 128 | length : writeArrayHeader(length);
                    for (let i = 0; i < length; i++) encode(value[i]);
                } else if (constructor === Map) if ((this.mapsAsObjects ? !1 !== this.useTag259ForMaps : this.useTag259ForMaps) && (target[position++] = 217, 
                target[position++] = 1, target[position++] = 3), (length = value.size) < 24 ? target[position++] = 160 | length : length < 256 ? (target[position++] = 184, 
                target[position++] = length) : length < 65536 ? (target[position++] = 185, target[position++] = length >> 8, 
                target[position++] = 255 & length) : (target[position++] = 186, targetView.setUint32(position, length), 
                position += 4), encoder.keyMap) for (let [key, entryValue] of value) encode(encoder.encodeKey(key)), 
                encode(entryValue); else for (let [key, entryValue] of value) encode(key), encode(entryValue); else {
                    for (let i = 0, l = extensions.length; i < l; i++) {
                        if (value instanceof extensionClasses[i]) {
                            let extension = extensions[i], tag = extension.tag;
                            return null == tag && (tag = extension.getTag && extension.getTag.call(this, value)), 
                            tag < 24 ? target[position++] = 192 | tag : tag < 256 ? (target[position++] = 216, 
                            target[position++] = tag) : tag < 65536 ? (target[position++] = 217, target[position++] = tag >> 8, 
                            target[position++] = 255 & tag) : tag > -1 && (target[position++] = 218, targetView.setUint32(position, tag), 
                            position += 4), void extension.encode.call(this, value, encode, makeRoom);
                        }
                    }
                    if (value[Symbol.iterator]) {
                        target[position++] = 159;
                        for (let entry of value) encode(entry);
                        return void (target[position++] = 255);
                    }
                    writeObject(value, !value.hasOwnProperty);
                }
            } else target[position++] = 246; else if ("boolean" === type) target[position++] = value ? 245 : 244; else if ("bigint" === type) {
                if (value < BigInt(1) << BigInt(64) && value >= 0) target[position++] = 27, targetView.setBigUint64(position, value); else if (value > -(BigInt(1) << BigInt(64)) && value < 0) target[position++] = 59, 
                targetView.setBigUint64(position, -value - BigInt(1)); else {
                    if (!this.largeBigIntToFloat) throw new RangeError(value + " was too large to fit in CBOR 64-bit integer format, set largeBigIntToFloat to convert to float-64");
                    target[position++] = 251, targetView.setFloat64(position, Number(value));
                }
                position += 8;
            } else {
                if ("undefined" !== type) throw new Error("Unknown type: " + type);
                target[position++] = 247;
            }
        }, writeObject = !1 === this.useRecords ? this.variableMapSize ? object => {
            let keys = Object.keys(object), vals = Object.values(object), length = keys.length;
            if (length < 24 ? target[position++] = 160 | length : length < 256 ? (target[position++] = 184, 
            target[position++] = length) : length < 65536 ? (target[position++] = 185, target[position++] = length >> 8, 
            target[position++] = 255 & length) : (target[position++] = 186, targetView.setUint32(position, length), 
            position += 4), encoder.keyMap) for (let i = 0; i < length; i++) encode(encodeKey(keys[i])), 
            encode(vals[i]); else for (let i = 0; i < length; i++) encode(keys[i]), encode(vals[i]);
        } : (object, safePrototype) => {
            target[position++] = 185;
            let objectOffset = position - start;
            position += 2;
            let size = 0;
            if (encoder.keyMap) for (let key in object) (safePrototype || object.hasOwnProperty(key)) && (encode(encoder.encodeKey(key)), 
            encode(object[key]), size++); else for (let key in object) (safePrototype || object.hasOwnProperty(key)) && (encode(key), 
            encode(object[key]), size++);
            target[objectOffset++ + start] = size >> 8, target[objectOffset + start] = 255 & size;
        } : (object, safePrototype) => {
            let nextTransition, parentRecordId, keys, transition = structures.transitions || (structures.transitions = Object.create(null)), newTransitions = 0, length = 0;
            if (this.keyMap) {
                keys = Object.keys(object).map((k => this.encodeKey(k))), length = keys.length;
                for (let i = 0; i < length; i++) {
                    let key = keys[i];
                    nextTransition = transition[key], nextTransition || (nextTransition = transition[key] = Object.create(null), 
                    newTransitions++), transition = nextTransition;
                }
            } else for (let key in object) (safePrototype || object.hasOwnProperty(key)) && (nextTransition = transition[key], 
            nextTransition || (1048576 & transition[RECORD_SYMBOL] && (parentRecordId = 65535 & transition[RECORD_SYMBOL]), 
            nextTransition = transition[key] = Object.create(null), newTransitions++), transition = nextTransition, 
            length++);
            let recordId = transition[RECORD_SYMBOL];
            if (void 0 !== recordId) recordId &= 65535, target[position++] = 217, target[position++] = recordId >> 8 | 224, 
            target[position++] = 255 & recordId; else {
                if (keys || (keys = transition.__keys__ || (transition.__keys__ = Object.keys(object))), 
                void 0 === parentRecordId ? (recordId = structures.nextId++, recordId || (recordId = 0, 
                structures.nextId = 1), recordId >= 256 && (structures.nextId = (recordId = maxSharedStructures) + 1)) : recordId = parentRecordId, 
                structures[recordId] = keys, !(recordId < maxSharedStructures)) {
                    transition[RECORD_SYMBOL] = recordId, targetView.setUint32(position, 3655335680), 
                    position += 3, newTransitions && (transitionsCount += serializationsSinceTransitionRebuild * newTransitions), 
                    recordIdsToRemove.length >= 256 - maxSharedStructures && (recordIdsToRemove.shift()[RECORD_SYMBOL] = void 0), 
                    recordIdsToRemove.push(transition), writeArrayHeader(length + 2), encode(57344 + recordId), 
                    encode(keys);
                    for (let v of Object.values(object)) encode(v);
                    return;
                }
                target[position++] = 217, target[position++] = recordId >> 8 | 224, target[position++] = 255 & recordId, 
                transition = structures.transitions;
                for (let i = 0; i < length; i++) (void 0 === transition[RECORD_SYMBOL] || 1048576 & transition[RECORD_SYMBOL]) && (transition[RECORD_SYMBOL] = recordId), 
                transition = transition[keys[i]];
                transition[RECORD_SYMBOL] = 1048576 | recordId, hasSharedUpdate = !0;
            }
            length < 24 ? target[position++] = 128 | length : writeArrayHeader(length);
            for (let key in object) (safePrototype || object.hasOwnProperty(key)) && encode(object[key]);
        }, makeRoom = end => {
            let newSize;
            if (end > 16777216) {
                if (end - start > MAX_BUFFER_SIZE) throw new Error("Encoded buffer would be larger than maximum buffer size");
                newSize = Math.min(MAX_BUFFER_SIZE, 4096 * Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096));
            } else newSize = 1 + (Math.max(end - start << 2, target.length - 1) >> 12) << 12;
            let newBuffer = new ByteArrayAllocate(newSize);
            return targetView = new DataView(newBuffer.buffer, 0, newSize), target.copy ? target.copy(newBuffer, 0, start, end) : newBuffer.set(target.slice(start, end)), 
            position -= start, start = 0, safeEnd = newBuffer.length - 10, target = newBuffer;
        };
    }
    useBuffer(buffer) {
        target = buffer, targetView = new DataView(target.buffer, target.byteOffset, target.byteLength), 
        position = 0;
    }
    clearSharedData() {
        this.structures && (this.structures = []), this.sharedValues && (this.sharedValues = void 0);
    }
    updateSharedData() {
        let lastVersion = this.sharedVersion || 0;
        this.sharedVersion = lastVersion + 1;
        let structuresCopy = this.structures.slice(0), sharedData = new SharedData(structuresCopy, this.sharedValues, this.sharedVersion), saveResults = this.saveShared(sharedData, (existingShared => (existingShared && existingShared.version || 0) == lastVersion));
        return !1 === saveResults ? (sharedData = this.getShared() || {}, this.structures = sharedData.structures || [], 
        this.sharedValues = sharedData.packedValues, this.sharedVersion = sharedData.version, 
        this.structures.nextId = this.structures.length) : structuresCopy.forEach(((structure, i) => this.structures[i] = structure)), 
        saveResults;
    }
}

class SharedData {
    constructor(structures, values, version) {
        this.structures = structures, this.packedValues = values, this.version = version;
    }
}

function writeArrayHeader(length) {
    length < 24 ? target[position++] = 128 | length : length < 256 ? (target[position++] = 152, 
    target[position++] = length) : length < 65536 ? (target[position++] = 153, target[position++] = length >> 8, 
    target[position++] = 255 & length) : (target[position++] = 154, targetView.setUint32(position, length), 
    position += 4);
}

function findRepetitiveStrings(value, packedValues) {
    switch (typeof value) {
      case "string":
        if (value.length > 3) {
            if (packedValues.objectMap[value] > -1 || packedValues.values.length >= packedValues.maxValues) return;
            let packedStatus = packedValues.get(value);
            if (packedStatus) 2 == ++packedStatus.count && packedValues.values.push(value); else if (packedValues.set(value, {
                count: 1
            }), packedValues.samplingPackedValues) {
                let status = packedValues.samplingPackedValues.get(value);
                status ? status.count++ : packedValues.samplingPackedValues.set(value, {
                    count: 1
                });
            }
        }
        break;

      case "object":
        if (value) if (value instanceof Array) for (let i = 0, l = value.length; i < l; i++) findRepetitiveStrings(value[i], packedValues); else {
            let includeKeys = !packedValues.encoder.useRecords;
            for (var key in value) value.hasOwnProperty(key) && (includeKeys && findRepetitiveStrings(key, packedValues), 
            findRepetitiveStrings(value[key], packedValues));
        }
        break;

      case "function":
        console.log(value);
    }
}

const isLittleEndianMachine = 1 == new Uint8Array(new Uint16Array([ 1 ]).buffer)[0];

function typedArrayEncoder(tag, size) {
    return !isLittleEndianMachine && size > 1 && (tag -= 4), {
        tag,
        encode: function(typedArray, encode) {
            let length = typedArray.byteLength, offset = typedArray.byteOffset || 0, buffer = typedArray.buffer || typedArray;
            encode(hasNodeBuffer ? Buffer.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
        }
    };
}

function writeBuffer(buffer, makeRoom) {
    let length = buffer.byteLength;
    length < 24 ? target[position++] = 64 + length : length < 256 ? (target[position++] = 88, 
    target[position++] = length) : length < 65536 ? (target[position++] = 89, target[position++] = length >> 8, 
    target[position++] = 255 & length) : (target[position++] = 90, targetView.setUint32(position, length), 
    position += 4), position + length >= target.length && makeRoom(position + length), 
    target.set(buffer.buffer ? buffer : new Uint8Array(buffer), position), position += length;
}

function writeBundles(start, encode) {
    targetView.setUint32(bundledStrings.position + start, position - bundledStrings.position - start + 1);
    let writeStrings = bundledStrings;
    bundledStrings = null, encode(writeStrings[0]), encode(writeStrings[1]);
}

extensionClasses = [ Date, Set, Error, RegExp, Tag, ArrayBuffer, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, "undefined" == typeof BigUint64Array ? function() {} : BigUint64Array, Int8Array, Int16Array, Int32Array, "undefined" == typeof BigInt64Array ? function() {} : BigInt64Array, Float32Array, Float64Array, SharedData ], 
extensions = [ {
    tag: 1,
    encode(date, encode) {
        let seconds = date.getTime() / 1e3;
        (this.useTimestamp32 || 0 === date.getMilliseconds()) && seconds >= 0 && seconds < 4294967296 ? (target[position++] = 26, 
        targetView.setUint32(position, seconds), position += 4) : (target[position++] = 251, 
        targetView.setFloat64(position, seconds), position += 8);
    }
}, {
    tag: 258,
    encode(set, encode) {
        encode(Array.from(set));
    }
}, {
    tag: 27,
    encode(error, encode) {
        encode([ error.name, error.message ]);
    }
}, {
    tag: 27,
    encode(regex, encode) {
        encode([ "RegExp", regex.source, regex.flags ]);
    }
}, {
    getTag: tag => tag.tag,
    encode(tag, encode) {
        encode(tag.value);
    }
}, {
    encode(arrayBuffer, encode, makeRoom) {
        writeBuffer(arrayBuffer, makeRoom);
    }
}, {
    getTag(typedArray) {
        if (typedArray.constructor === Uint8Array && (this.tagUint8Array || hasNodeBuffer && !1 !== this.tagUint8Array)) return 64;
    },
    encode(typedArray, encode, makeRoom) {
        writeBuffer(typedArray, makeRoom);
    }
}, typedArrayEncoder(68, 1), typedArrayEncoder(69, 2), typedArrayEncoder(70, 4), typedArrayEncoder(71, 8), typedArrayEncoder(72, 1), typedArrayEncoder(77, 2), typedArrayEncoder(78, 4), typedArrayEncoder(79, 8), typedArrayEncoder(85, 4), typedArrayEncoder(86, 8), {
    encode(sharedData, encode) {
        let packedValues = sharedData.packedValues || [], sharedStructures = sharedData.structures || [];
        if (packedValues.values.length > 0) {
            target[position++] = 216, target[position++] = 51, writeArrayHeader(4);
            let valuesArray = packedValues.values;
            encode(valuesArray), writeArrayHeader(0), writeArrayHeader(0), packedObjectMap = Object.create(sharedPackedObjectMap || null);
            for (let i = 0, l = valuesArray.length; i < l; i++) packedObjectMap[valuesArray[i]] = i;
        }
        if (sharedStructures) {
            targetView.setUint32(position, 3655335424), position += 3;
            let definitions = sharedStructures.slice(0);
            definitions.unshift(57344), definitions.push(new Tag(sharedData.version, 1399353956)), 
            encode(definitions);
        } else encode(new Tag(sharedData.version, 1399353956));
    }
} ], new Encoder({
    useRecords: !1
}).encode;

const REUSE_BUFFER_MODE = 512, RESET_BUFFER_MODE = 1024, scLabel_segments = 2, scLabel_fileSize = 3, segmentsLabel_startRange = 4, segmentsLabel_segmentRegex = 5, segmentsLabel_position = 6;

class CborParser {
    static decode(data) {
        if (0 == data.length) throw new Error("Recieved empty encoded cbor data");
        return decode(data);
    }
    static findPosition(sc, startByte, endByte, fileName) {
        if (void 0 === sc[scLabel_fileSize] || startByte === BigInt(-1)) {
            const segments = sc[scLabel_segments];
            for (const seg of segments) {
                const regex = seg[segmentsLabel_segmentRegex];
                if (new RegExp(regex).test(fileName)) return seg[segmentsLabel_position];
            }
            return -1;
        }
        {
            let startSearch = 0;
            const segments = sc[scLabel_segments], numSegments = segments.length, filesize = BigInt(sc[scLabel_fileSize]);
            let endSearch = numSegments - 1;
            for (;startSearch <= endSearch; ) {
                const middleSearch = Math.floor((startSearch + endSearch) / 2), middleSegment = segments[middleSearch], nextSegment = segments[middleSearch + 1];
                if (void 0 !== middleSegment) {
                    let segmentEndByte;
                    const segmentStartByte = BigInt(middleSegment[segmentsLabel_startRange]), pos = middleSegment[segmentsLabel_position];
                    if (segmentEndByte = void 0 === nextSegment ? BigInt(filesize) : BigInt(nextSegment[segmentsLabel_startRange]) - BigInt(1), 
                    segmentStartByte <= startByte && segmentEndByte >= endByte) return pos;
                    if (segmentEndByte <= startByte) startSearch = middleSearch + 1; else {
                        if (!(segmentStartByte >= startByte)) return;
                        endSearch = middleSearch - 1;
                    }
                }
            }
            return;
        }
    }
}

const COSE_Mac0 = 17, COSE_Mac = 97, COSE_Sign = 98, COSE_Sign1 = 18, COSE_Encrypt0 = 16, COSE_Encrypt = 96, coseAlgTags = {
    5: "HMAC 256/256"
}, HeaderLabelToKey_alg = 1, HeaderLabelToKey_crit = 2, claimsLabelToKey_iss = 1, claimsLabelToKey_sub = 2, claimsLabelToKey_aud = 3, claimsLabelToKey_exp = 4, claimsLabelToKey_nbf = 5;

class Mac {
    static async verifyHMAC(alg, message, signature, keys) {
        if ("HMAC 256/256" === alg) {
            let isSignVerified = !1;
            for (const key of keys) if (isSignVerified = await crypto.subtle.verify({
                name: "HMAC"
            }, key, signature, message), isSignVerified) return Promise.resolve(isSignVerified);
            return Promise.resolve(isSignVerified);
        }
        throw new Error(`Unsupported Algorithm, ${alg}`);
    }
}

class CWTUtil {
    static toHexString(byteArray) {
        return Array.prototype.map.call(byteArray, (function(byte) {
            return ("0" + (255 & byte).toString(16)).slice(-2);
        })).join("");
    }
    static claimsTranslate(payload, labelsMap, translators) {
        const result = {};
        for (const param in payload) {
            const key = labelsMap[param] ? labelsMap[param] : param, theValue = translators && translators[key] ? translators[key](payload[param]) : payload[param];
            result[key] = theValue;
        }
        return result;
    }
}

CWTUtil.EMPTY_BUFFER = new Uint8Array(0), globalThis.cborenc = new Encoder({
    tagUint8Array: !1
}), globalThis.cbordec = new Decoder;

class CWTValidator {
    constructor(cwtOptions) {
        this.cwtOptions = cwtOptions || {}, this.validateOptionTypes();
    }
    async validate(tokenBuf, keys, externalAAD) {
        if (!(tokenBuf instanceof Uint8Array)) throw new Error("Invalid token type, expected Uint8Array!");
        if (externalAAD && !(externalAAD instanceof Uint8Array)) throw new Error("Invalid externalAAD type, expected Uint8Array!");
        if (Array.isArray(keys) && !keys.every((elem => "CryptoKey" === elem.constructor.name))) throw new Error("Invalid keys type, expected list of CryptoKey!");
        let coseMessage = globalThis.cbordec.decode(tokenBuf), cwtType = this.cwtOptions.defaultCoseMsgType;
        if (this.cwtOptions.isCWTTagAdded) {
            if (61 !== coseMessage.tag) throw new Error("CWT malformed: expected CWT CBOR tag for the token!");
            coseMessage = coseMessage.value;
        }
        if (this.cwtOptions.isCoseCborTagAdded) {
            if (cwtType = coseMessage.tag, ![ COSE_Mac0, COSE_Mac, COSE_Sign, COSE_Sign1, COSE_Encrypt, COSE_Encrypt0 ].includes(cwtType)) throw new Error("CWT malformed: invalid COSE CBOR tag!");
            coseMessage = coseMessage.value;
        }
        externalAAD || (externalAAD = CWTUtil.EMPTY_BUFFER);
        const cwtJSON = await this.verifyCoseMessage(coseMessage, cwtType, keys, this.cwtOptions.headerValidation, externalAAD);
        return this.validateClaims(cwtJSON.payload), cwtJSON;
    }
    async verifyCoseMessage(coseMessage, cwtType, keys, headerValidation, externalAAD) {
        if (cwtType === COSE_Mac0) {
            if (!Array.isArray(coseMessage) || 4 !== coseMessage.length) throw new Error("CWT malformed: invalid COSE message structure for COSE CBOR MAC0Tag, expected arry of length 4!");
            const [p, u, payload, tag] = coseMessage;
            let pH = p.length ? globalThis.cbordec.decode(p) : CWTUtil.EMPTY_BUFFER;
            pH = pH.size ? pH : CWTUtil.EMPTY_BUFFER;
            const uH = u.size ? u : CWTUtil.EMPTY_BUFFER;
            headerValidation && this.validateHeader(pH, !0);
            let alg = pH !== CWTUtil.EMPTY_BUFFER ? pH.get(HeaderLabelToKey_alg) : uH !== CWTUtil.EMPTY_BUFFER ? u.get(HeaderLabelToKey_alg) : void 0;
            Number.isInteger(alg) && (alg = coseAlgTags[alg]);
            const MACstructure = [ "MAC0", p, externalAAD, payload ], toBeMACed = globalThis.cborenc.encode(MACstructure);
            if (!await Mac.verifyHMAC(alg, toBeMACed, tag, keys)) throw new Error("CWT token signature verification failed!");
            const decodedPayload = globalThis.cbordec.decode(payload);
            return Promise.resolve({
                header: {
                    p: pH,
                    u: uH
                },
                payload: decodedPayload
            });
        }
        throw new Error(`COSE CBOR tag ${cwtType} is not supported at the moment`);
    }
    validateHeader(headers, pheader) {
        if (headers.size && pheader) {
            const h = headers, crit = h.get(HeaderLabelToKey_crit);
            if (Array.isArray(crit)) {
                if (0 === crit.length) throw new Error("CWT Malformed: malformed protected header, crit array cannot be empty!");
                for (const e of crit) if (void 0 === h.get(e)) throw new Error("CWT Malformed: malformed protected header, crit labels are not part of protected header");
            }
        }
    }
    validateClaims(decodedPayload) {
        if (this.cwtOptions.issuer) {
            const iss = decodedPayload.get(claimsLabelToKey_iss);
            if (iss && this.cwtOptions.issuer !== iss) throw new Error(`CWT malformed: invalid iss, expected ${this.cwtOptions.issuer}`);
        }
        if (this.cwtOptions.subject) {
            const sub = decodedPayload.get(claimsLabelToKey_sub);
            if (sub && this.cwtOptions.subject !== sub) throw new Error(`CWT malformed: invalid sub, expected ${this.cwtOptions.subject}`);
        }
        if (this.cwtOptions.audience) {
            const aud = decodedPayload.get(claimsLabelToKey_aud);
            if (aud && (Array.isArray(aud) || "string" == typeof aud)) {
                if (!(Array.isArray(aud) ? aud : [ aud ]).includes(this.cwtOptions.audience)) throw new Error(`CWT malformed: invalid aud, expected ${this.cwtOptions.audience}`);
            }
        }
        const clockTimestamp = Math.floor(Date.now() / 1e3);
        if (!1 === this.cwtOptions.ignoreExpiration) {
            const exp = decodedPayload.get(claimsLabelToKey_exp);
            if (exp) {
                if ("number" != typeof exp) throw new Error("CWT malformed: exp must be number");
                if (clockTimestamp > exp + (this.cwtOptions.clockTolerance || 0)) throw new Error("CWT token has been expired");
            }
        }
        if (!1 === this.cwtOptions.ignoreNotBefore) {
            const nbf = decodedPayload.get(claimsLabelToKey_nbf);
            if (nbf) {
                if ("number" != typeof nbf) throw new Error("CWT malformed: nbf must be number");
                if (nbf > clockTimestamp + (this.cwtOptions.clockTolerance || 0)) throw new Error("CWT is not active");
            }
        }
    }
    validateOptionTypes() {
        if (void 0 === this.cwtOptions.isCWTTagAdded) this.cwtOptions.isCWTTagAdded = !1; else if ("boolean" != typeof this.cwtOptions.isCWTTagAdded) throw new Error("Invalid cwtOptions: isCWTTagAdded must be boolean");
        if (null == this.cwtOptions.isCoseCborTagAdded) this.cwtOptions.isCoseCborTagAdded = !0; else if ("boolean" != typeof this.cwtOptions.isCoseCborTagAdded) throw new Error("Invalid cwtOptions: isCoseCborTagAdded must be boolean");
        if (void 0 === this.cwtOptions.defaultCoseMsgType) this.cwtOptions.defaultCoseMsgType = COSE_Mac0; else if ("number" != typeof this.cwtOptions.defaultCoseMsgType) throw new Error("Invalid cwtOptions: defaultCoseMsgType must be number");
        if (void 0 === this.cwtOptions.headerValidation) this.cwtOptions.headerValidation = !1; else if ("boolean" != typeof this.cwtOptions.headerValidation) throw new Error("Invalid cwtOptions: headerValidation must be boolean");
        if (void 0 !== this.cwtOptions.issuer && ("string" != typeof this.cwtOptions.issuer || 0 === this.cwtOptions.issuer.trim().length)) throw new Error("Invalid cwtOptions: issuer must be non empty string");
        if (void 0 !== this.cwtOptions.subject && ("string" != typeof this.cwtOptions.subject || 0 === this.cwtOptions.subject.trim().length)) throw new Error("Invalid cwtOptions: subject must be non empty string");
        if (void 0 !== this.cwtOptions.audience && !("string" == typeof this.cwtOptions.audience && this.cwtOptions.audience.trim().length > 0 || Array.isArray(this.cwtOptions.audience))) throw new Error("Invalid cwtOptions: audience must be non empty string or array");
        if (void 0 === this.cwtOptions.ignoreExpiration) this.cwtOptions.ignoreExpiration = !0; else if ("boolean" != typeof this.cwtOptions.ignoreExpiration) throw new Error("Invalid cwtOptions: ignoreExpiration must be boolean");
        if (void 0 === this.cwtOptions.ignoreNotBefore) this.cwtOptions.ignoreNotBefore = !0; else if ("boolean" != typeof this.cwtOptions.ignoreNotBefore) throw new Error("Invalid cwtOptions: ignoreNotBefore must be boolean");
        if (void 0 !== this.cwtOptions.clockTolerance && "number" != typeof this.cwtOptions.clockTolerance) throw new Error("Invalid cwtOptions: clockTolerance must be number");
        this.cwtOptions.clockTolerance = 60;
    }
}

class JWTUtil {
    static isEmptyString(str) {
        return !str || 0 === str.trim().length;
    }
}

class JWTValidator {
    constructor(jwtOptions) {
        this.jwtOptions = jwtOptions || {}, this.algorithms = [ "NONE", "RS256", "RS384", "RS512", "HS256", "HS384", "HS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" ], 
        this.validateOptionTypes();
    }
    async validate(base64JWTToken, keys) {
        var _a;
        if ("string" != typeof base64JWTToken) throw new Error("Invalid token type, expected string!");
        if (!keys.every((elem => "CryptoKey" === elem.constructor.name))) throw new Error("Invalid keys type, expected list of CryptoKey!");
        const jwtParts = base64JWTToken.split(".");
        if (jwtParts.length > 3 || jwtParts.length < 2) throw new Error("JWT malformed: Invalid number of parts for JWT token. expected 3 or 2 (unsecured JWT)!");
        if (JWTUtil.isEmptyString(jwtParts[0])) throw new Error("JWT malformed: jwt header cannot be empty");
        if (JWTUtil.isEmptyString(jwtParts[1])) throw new Error("JWT malformed: jwt payload cannot be empty");
        const jwtHBin = atob(jwtParts[0]), jwtPBin = atob(jwtParts[1]), jwtHeader = JSON.parse(jwtHBin), jwtPayload = JSON.parse(jwtPBin);
        if (this.jwtOptions.issuer && jwtPayload.iss && this.jwtOptions.issuer !== jwtPayload.iss) throw new Error(`JWT malformed: invalid iss, expected ${this.jwtOptions.issuer}`);
        if (this.jwtOptions.subject && jwtPayload.sub && this.jwtOptions.subject !== jwtPayload.sub) throw new Error(`JWT malformed: invalid sub, expected ${this.jwtOptions.subject}`);
        if (this.jwtOptions.audience) {
            const aud = jwtPayload.aud;
            if (aud && (Array.isArray(aud) || "string" == typeof aud)) {
                if (!(Array.isArray(aud) ? aud : [ aud ]).includes(this.jwtOptions.audience)) throw new Error(`JWT malformed: invalid aud, expected ${this.jwtOptions.audience}`);
            }
        }
        const clockTimestamp = Math.floor(Date.now() / 1e3);
        if (!1 === this.jwtOptions.ignoreExpiration) {
            if ("number" != typeof jwtPayload.exp) throw new Error("JWT malformed: exp must be number");
            if (jwtPayload.exp && clockTimestamp > jwtPayload.exp + (this.jwtOptions.clockTolerance || 0)) throw new Error("JWT expired");
        }
        if (!1 === this.jwtOptions.ignoreNotBefore) {
            if ("number" != typeof jwtPayload.nbf) throw new Error("JWT malformed: nbf must be number");
            if (jwtPayload.nbf && jwtPayload.nbf > clockTimestamp + (this.jwtOptions.clockTolerance || 0)) throw new Error("JWT not active");
        }
        if (!jwtHeader.alg) throw new Error("JWT malformed: expected alg field in JWT header");
        if ("NONE" === jwtHeader.alg.toUpperCase()) return {
            header: jwtHeader,
            payload: jwtPayload
        };
        if (!(null === (_a = this.algorithms) || void 0 === _a ? void 0 : _a.includes(jwtHeader.alg.toUpperCase()))) throw new Error(`${jwtHeader.alg} is not supported at the moment`);
        for (const cryptoKey of keys) {
            if (await this.validateSignature(jwtParts, jwtHeader.alg.toUpperCase(), cryptoKey)) return {
                header: jwtHeader,
                payload: jwtPayload
            };
        }
        throw new Error("JWT token signature verification failed!");
    }
    validateOptionTypes() {
        if (void 0 !== this.jwtOptions.issuer && ("string" != typeof this.jwtOptions.issuer || 0 === this.jwtOptions.issuer.trim().length)) throw new Error("Invalid jwtOptions: issuer must be non empty string");
        if (void 0 !== this.jwtOptions.audience && ("string" != typeof this.jwtOptions.audience || 0 === this.jwtOptions.audience.trim().length)) throw new Error("Invalid jwtOptions: audience must be non empty string");
        if (void 0 !== this.jwtOptions.subject && ("string" != typeof this.jwtOptions.subject || 0 === this.jwtOptions.subject.trim().length)) throw new Error("Invalid jwtOptions: subject must be non empty string");
        if (void 0 === this.jwtOptions.ignoreExpiration) this.jwtOptions.ignoreExpiration = !0; else if ("boolean" != typeof this.jwtOptions.ignoreExpiration) throw new Error("Invalid jwtOptions: ignoreExpiration must be boolean");
        if (void 0 === this.jwtOptions.ignoreNotBefore) this.jwtOptions.ignoreNotBefore = !0; else if ("boolean" != typeof this.jwtOptions.ignoreNotBefore) throw new Error("Invalid jwtOptions: ignoreNotBefore must be boolean");
        if (void 0 === this.jwtOptions.clockTolerance) this.jwtOptions.clockTolerance = 60; else if ("number" != typeof this.jwtOptions.clockTolerance) throw new Error("Invalid jwtOptions: clockTimestamp must be number");
    }
    async validateSignature(jwtParts, alg, cryptoKey) {
        switch (alg) {
          case "RS512":
          case "RS384":
          case "RS256":
            return await crypto.subtle.verify({
                name: "RSASSA-PKCS1-v1_5"
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "HS512":
          case "HS384":
          case "HS256":
            return await crypto.subtle.verify({
                name: "HMAC"
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "PS512":
            return await crypto.subtle.verify({
                name: "RSA-PSS",
                saltLength: 64
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "PS384":
            return await crypto.subtle.verify({
                name: "RSA-PSS",
                saltLength: 48
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "PS256":
            return await crypto.subtle.verify({
                name: "RSA-PSS",
                saltLength: 32
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "ES512":
            return await crypto.subtle.verify({
                name: "ECDSA",
                hash: {
                    name: "SHA-512"
                }
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "ES384":
            return await crypto.subtle.verify({
                name: "ECDSA",
                hash: {
                    name: "SHA-384"
                }
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          case "ES256":
            return await crypto.subtle.verify({
                name: "ECDSA",
                hash: {
                    name: "SHA-256"
                }
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder$1).encode(`${jwtParts[0]}.${jwtParts[1]}`));

          default:
            throw new Error(`${alg} is not supported at the moment`);
        }
    }
}

const claimsLabelMap = {
    1: "iss",
    2: "sub",
    3: "aud",
    4: "exp",
    5: "nbf",
    6: "iat",
    7: "cti",
    200: "wmver",
    201: "wmvnd",
    202: "wmidtyp",
    203: "wmidfmt",
    204: "wmpatlen",
    205: "wmid",
    206: "wmsegduration",
    207: "wmidalg",
    208: "wmidivlen",
    209: "wmidivhex",
    210: "wmidpid",
    211: "wmidpalg",
    212: "wmidkeyver",
    213: "wmopid"
};

var lru = {
    exports: {}
};

!function(exports) {
    const NEWER = Symbol("newer"), OLDER = Symbol("older");
    class LRUMap {
        constructor(limit, entries) {
            "number" != typeof limit && (entries = limit, limit = 0), this.size = 0, this.limit = limit, 
            this.oldest = this.newest = void 0, this._keymap = new Map, entries && (this.assign(entries), 
            limit < 1 && (this.limit = this.size));
        }
        _markEntryAsUsed(entry) {
            entry !== this.newest && (entry[NEWER] && (entry === this.oldest && (this.oldest = entry[NEWER]), 
            entry[NEWER][OLDER] = entry[OLDER]), entry[OLDER] && (entry[OLDER][NEWER] = entry[NEWER]), 
            entry[NEWER] = void 0, entry[OLDER] = this.newest, this.newest && (this.newest[NEWER] = entry), 
            this.newest = entry);
        }
        assign(entries) {
            let entry, limit = this.limit || Number.MAX_VALUE;
            this._keymap.clear();
            let it = entries[Symbol.iterator]();
            for (let itv = it.next(); !itv.done; itv = it.next()) {
                let e = new Entry(itv.value[0], itv.value[1]);
                if (this._keymap.set(e.key, e), entry ? (entry[NEWER] = e, e[OLDER] = entry) : this.oldest = e, 
                entry = e, 0 == limit--) throw new Error("overflow");
            }
            this.newest = entry, this.size = this._keymap.size;
        }
        get(key) {
            var entry = this._keymap.get(key);
            if (entry) return this._markEntryAsUsed(entry), entry.value;
        }
        set(key, value) {
            var entry = this._keymap.get(key);
            return entry ? (entry.value = value, this._markEntryAsUsed(entry), this) : (this._keymap.set(key, entry = new Entry(key, value)), 
            this.newest ? (this.newest[NEWER] = entry, entry[OLDER] = this.newest) : this.oldest = entry, 
            this.newest = entry, ++this.size, this.size > this.limit && this.shift(), this);
        }
        shift() {
            var entry = this.oldest;
            if (entry) return this.oldest[NEWER] ? (this.oldest = this.oldest[NEWER], this.oldest[OLDER] = void 0) : (this.oldest = void 0, 
            this.newest = void 0), entry[NEWER] = entry[OLDER] = void 0, this._keymap.delete(entry.key), 
            --this.size, [ entry.key, entry.value ];
        }
        find(key) {
            let e = this._keymap.get(key);
            return e ? e.value : void 0;
        }
        has(key) {
            return this._keymap.has(key);
        }
        delete(key) {
            var entry = this._keymap.get(key);
            if (entry) return this._keymap.delete(entry.key), entry[NEWER] && entry[OLDER] ? (entry[OLDER][NEWER] = entry[NEWER], 
            entry[NEWER][OLDER] = entry[OLDER]) : entry[NEWER] ? (entry[NEWER][OLDER] = void 0, 
            this.oldest = entry[NEWER]) : entry[OLDER] ? (entry[OLDER][NEWER] = void 0, this.newest = entry[OLDER]) : this.oldest = this.newest = void 0, 
            this.size--, entry.value;
        }
        clear() {
            this.oldest = this.newest = void 0, this.size = 0, this._keymap.clear();
        }
        keys() {
            return new KeyIterator(this.oldest);
        }
        values() {
            return new ValueIterator(this.oldest);
        }
        entries() {
            return this;
        }
        [Symbol.iterator]() {
            return new EntryIterator(this.oldest);
        }
        forEach(fun, thisObj) {
            "object" != typeof thisObj && (thisObj = this);
            let entry = this.oldest;
            for (;entry; ) fun.call(thisObj, entry.value, entry.key, this), entry = entry[NEWER];
        }
        toJSON() {
            for (var s = new Array(this.size), i = 0, entry = this.oldest; entry; ) s[i++] = {
                key: entry.key,
                value: entry.value
            }, entry = entry[NEWER];
            return s;
        }
        toString() {
            for (var s = "", entry = this.oldest; entry; ) s += String(entry.key) + ":" + entry.value, 
            (entry = entry[NEWER]) && (s += " < ");
            return s;
        }
    }
    function Entry(key, value) {
        this.key = key, this.value = value, this[NEWER] = void 0, this[OLDER] = void 0;
    }
    function EntryIterator(oldestEntry) {
        this.entry = oldestEntry;
    }
    function KeyIterator(oldestEntry) {
        this.entry = oldestEntry;
    }
    function ValueIterator(oldestEntry) {
        this.entry = oldestEntry;
    }
    exports.LRUMap = LRUMap, EntryIterator.prototype[Symbol.iterator] = function() {
        return this;
    }, EntryIterator.prototype.next = function() {
        let ent = this.entry;
        return ent ? (this.entry = ent[NEWER], {
            done: !1,
            value: [ ent.key, ent.value ]
        }) : {
            done: !0,
            value: void 0
        };
    }, KeyIterator.prototype[Symbol.iterator] = function() {
        return this;
    }, KeyIterator.prototype.next = function() {
        let ent = this.entry;
        return ent ? (this.entry = ent[NEWER], {
            done: !1,
            value: ent.key
        }) : {
            done: !0,
            value: void 0
        };
    }, ValueIterator.prototype[Symbol.iterator] = function() {
        return this;
    }, ValueIterator.prototype.next = function() {
        let ent = this.entry;
        return ent ? (this.entry = ent[NEWER], {
            done: !1,
            value: ent.value
        }) : {
            done: !0,
            value: void 0
        };
    };
}(lru.exports);

class Cache {
    static getToken(key) {
        return this.tokenCache.get(key);
    }
    static storeToken(key, value) {
        this.tokenCache.set(key, value);
    }
    static getShortToken(key) {
        return this.tokenCache.get(key);
    }
    static storeShortToken(key, value) {
        this.tokenCache.set(key, value);
    }
    static getTmid(key) {
        return this.tmidCache.get(key);
    }
    static storeTmid(key, value) {
        this.tmidCache.set(key, value);
    }
}

Cache.CACHE_ENTRIES = 150, Cache.tokenCache = new lru.exports.LRUMap(Cache.CACHE_ENTRIES), 
Cache.tmidCache = new lru.exports.LRUMap(Cache.CACHE_ENTRIES);

var module, sha256 = {
    exports: {}
};

module = sha256, function(root, factory) {
    var exports = {};
    !function(exports) {
        exports.__esModule = !0, exports.digestLength = 32, exports.blockSize = 64;
        var K = new Uint32Array([ 1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298 ]);
        function hashBlocks(w, v, p, pos, len) {
            for (var a, b, c, d, e, f, g, h, u, i, j, t1, t2; len >= 64; ) {
                for (a = v[0], b = v[1], c = v[2], d = v[3], e = v[4], f = v[5], g = v[6], h = v[7], 
                i = 0; i < 16; i++) j = pos + 4 * i, w[i] = (255 & p[j]) << 24 | (255 & p[j + 1]) << 16 | (255 & p[j + 2]) << 8 | 255 & p[j + 3];
                for (i = 16; i < 64; i++) t1 = ((u = w[i - 2]) >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10, 
                t2 = ((u = w[i - 15]) >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3, w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
                for (i = 0; i < 64; i++) t1 = (((e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7)) + (e & f ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0, 
                t2 = ((a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10)) + (a & b ^ a & c ^ b & c) | 0, 
                h = g, g = f, f = e, e = d + t1 | 0, d = c, c = b, b = a, a = t1 + t2 | 0;
                v[0] += a, v[1] += b, v[2] += c, v[3] += d, v[4] += e, v[5] += f, v[6] += g, v[7] += h, 
                pos += 64, len -= 64;
            }
            return pos;
        }
        var Hash = function() {
            function Hash() {
                this.digestLength = exports.digestLength, this.blockSize = exports.blockSize, this.state = new Int32Array(8), 
                this.temp = new Int32Array(64), this.buffer = new Uint8Array(128), this.bufferLength = 0, 
                this.bytesHashed = 0, this.finished = !1, this.reset();
            }
            return Hash.prototype.reset = function() {
                return this.state[0] = 1779033703, this.state[1] = 3144134277, this.state[2] = 1013904242, 
                this.state[3] = 2773480762, this.state[4] = 1359893119, this.state[5] = 2600822924, 
                this.state[6] = 528734635, this.state[7] = 1541459225, this.bufferLength = 0, this.bytesHashed = 0, 
                this.finished = !1, this;
            }, Hash.prototype.clean = function() {
                for (var i = 0; i < this.buffer.length; i++) this.buffer[i] = 0;
                for (i = 0; i < this.temp.length; i++) this.temp[i] = 0;
                this.reset();
            }, Hash.prototype.update = function(data, dataLength) {
                if (void 0 === dataLength && (dataLength = data.length), this.finished) throw new Error("SHA256: can't update because hash was finished.");
                var dataPos = 0;
                if (this.bytesHashed += dataLength, this.bufferLength > 0) {
                    for (;this.bufferLength < 64 && dataLength > 0; ) this.buffer[this.bufferLength++] = data[dataPos++], 
                    dataLength--;
                    64 === this.bufferLength && (hashBlocks(this.temp, this.state, this.buffer, 0, 64), 
                    this.bufferLength = 0);
                }
                for (dataLength >= 64 && (dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength), 
                dataLength %= 64); dataLength > 0; ) this.buffer[this.bufferLength++] = data[dataPos++], 
                dataLength--;
                return this;
            }, Hash.prototype.finish = function(out) {
                if (!this.finished) {
                    var bytesHashed = this.bytesHashed, left = this.bufferLength, bitLenHi = bytesHashed / 536870912 | 0, bitLenLo = bytesHashed << 3, padLength = bytesHashed % 64 < 56 ? 64 : 128;
                    this.buffer[left] = 128;
                    for (var i = left + 1; i < padLength - 8; i++) this.buffer[i] = 0;
                    this.buffer[padLength - 8] = bitLenHi >>> 24 & 255, this.buffer[padLength - 7] = bitLenHi >>> 16 & 255, 
                    this.buffer[padLength - 6] = bitLenHi >>> 8 & 255, this.buffer[padLength - 5] = bitLenHi >>> 0 & 255, 
                    this.buffer[padLength - 4] = bitLenLo >>> 24 & 255, this.buffer[padLength - 3] = bitLenLo >>> 16 & 255, 
                    this.buffer[padLength - 2] = bitLenLo >>> 8 & 255, this.buffer[padLength - 1] = bitLenLo >>> 0 & 255, 
                    hashBlocks(this.temp, this.state, this.buffer, 0, padLength), this.finished = !0;
                }
                for (i = 0; i < 8; i++) out[4 * i + 0] = this.state[i] >>> 24 & 255, out[4 * i + 1] = this.state[i] >>> 16 & 255, 
                out[4 * i + 2] = this.state[i] >>> 8 & 255, out[4 * i + 3] = this.state[i] >>> 0 & 255;
                return this;
            }, Hash.prototype.digest = function() {
                var out = new Uint8Array(this.digestLength);
                return this.finish(out), out;
            }, Hash.prototype._saveState = function(out) {
                for (var i = 0; i < this.state.length; i++) out[i] = this.state[i];
            }, Hash.prototype._restoreState = function(from, bytesHashed) {
                for (var i = 0; i < this.state.length; i++) this.state[i] = from[i];
                this.bytesHashed = bytesHashed, this.finished = !1, this.bufferLength = 0;
            }, Hash;
        }();
        exports.Hash = Hash;
        var HMAC = function() {
            function HMAC(key) {
                this.inner = new Hash, this.outer = new Hash, this.blockSize = this.inner.blockSize, 
                this.digestLength = this.inner.digestLength;
                var pad = new Uint8Array(this.blockSize);
                if (key.length > this.blockSize) (new Hash).update(key).finish(pad).clean(); else for (var i = 0; i < key.length; i++) pad[i] = key[i];
                for (i = 0; i < pad.length; i++) pad[i] ^= 54;
                for (this.inner.update(pad), i = 0; i < pad.length; i++) pad[i] ^= 106;
                for (this.outer.update(pad), this.istate = new Uint32Array(8), this.ostate = new Uint32Array(8), 
                this.inner._saveState(this.istate), this.outer._saveState(this.ostate), i = 0; i < pad.length; i++) pad[i] = 0;
            }
            return HMAC.prototype.reset = function() {
                return this.inner._restoreState(this.istate, this.inner.blockSize), this.outer._restoreState(this.ostate, this.outer.blockSize), 
                this;
            }, HMAC.prototype.clean = function() {
                for (var i = 0; i < this.istate.length; i++) this.ostate[i] = this.istate[i] = 0;
                this.inner.clean(), this.outer.clean();
            }, HMAC.prototype.update = function(data) {
                return this.inner.update(data), this;
            }, HMAC.prototype.finish = function(out) {
                return this.outer.finished ? this.outer.finish(out) : (this.inner.finish(out), this.outer.update(out, this.digestLength).finish(out)), 
                this;
            }, HMAC.prototype.digest = function() {
                var out = new Uint8Array(this.digestLength);
                return this.finish(out), out;
            }, HMAC;
        }();
        function hash(data) {
            var h = (new Hash).update(data), digest = h.digest();
            return h.clean(), digest;
        }
        function hmac(key, data) {
            var h = new HMAC(key).update(data), digest = h.digest();
            return h.clean(), digest;
        }
        function fillBuffer(buffer, hmac, info, counter) {
            var num = counter[0];
            if (0 === num) throw new Error("hkdf: cannot expand more");
            hmac.reset(), num > 1 && hmac.update(buffer), info && hmac.update(info), hmac.update(counter), 
            hmac.finish(buffer), counter[0]++;
        }
        exports.HMAC = HMAC, exports.hash = hash, exports.default = hash, exports.hmac = hmac;
        var hkdfSalt = new Uint8Array(exports.digestLength);
        function hkdf(key, salt, info, length) {
            void 0 === salt && (salt = hkdfSalt), void 0 === length && (length = 32);
            for (var counter = new Uint8Array([ 1 ]), okm = hmac(salt, key), hmac_ = new HMAC(okm), buffer = new Uint8Array(hmac_.digestLength), bufpos = buffer.length, out = new Uint8Array(length), i = 0; i < length; i++) bufpos === buffer.length && (fillBuffer(buffer, hmac_, info, counter), 
            bufpos = 0), out[i] = buffer[bufpos++];
            return hmac_.clean(), buffer.fill(0), counter.fill(0), out;
        }
        function pbkdf2(password, salt, iterations, dkLen) {
            for (var prf = new HMAC(password), len = prf.digestLength, ctr = new Uint8Array(4), t = new Uint8Array(len), u = new Uint8Array(len), dk = new Uint8Array(dkLen), i = 0; i * len < dkLen; i++) {
                var c = i + 1;
                ctr[0] = c >>> 24 & 255, ctr[1] = c >>> 16 & 255, ctr[2] = c >>> 8 & 255, ctr[3] = c >>> 0 & 255, 
                prf.reset(), prf.update(salt), prf.update(ctr), prf.finish(u);
                for (var j = 0; j < len; j++) t[j] = u[j];
                for (j = 2; j <= iterations; j++) {
                    prf.reset(), prf.update(u).finish(u);
                    for (var k = 0; k < len; k++) t[k] ^= u[k];
                }
                for (j = 0; j < len && i * len + j < dkLen; j++) dk[i * len + j] = t[j];
            }
            for (i = 0; i < len; i++) t[i] = u[i] = 0;
            for (i = 0; i < 4; i++) ctr[i] = 0;
            return prf.clean(), dk;
        }
        exports.hkdf = hkdf, exports.pbkdf2 = pbkdf2;
    }(exports);
    var sha256 = exports.default;
    for (var k in exports) sha256[k] = exports[k];
    module.exports = sha256;
}();

class Watermarking {
    constructor(wmOptions) {
        if (this.wmOptions = wmOptions || {
            tokenType: TokenType.CWT,
            validateWMClaims: !0
        }, this.wmOptions.tokenType = void 0 === this.wmOptions.tokenType ? TokenType.CWT : this.wmOptions.tokenType, 
        this.wmOptions.validateWMClaims = void 0 === this.wmOptions.validateWMClaims || this.wmOptions.validateWMClaims, 
        ![ TokenType.CWT, TokenType.JWT ].includes(this.wmOptions.tokenType)) throw new Error("Invalid token type! Only cwt or jwt auth tokens are supported!");
        this.wmOptions.tokenType === TokenType.CWT ? this.cwtValidator = new CWTValidator(wmOptions) : this.jwtValidator = new JWTValidator(wmOptions);
    }
    async validateShortToken(authToken, keys) {
        if ("string" != typeof authToken) throw new Error("Invalid token type, expected string!");
        if (Util.isEmptyString(authToken)) throw new Error("Token cannot be empty!");
        if (0 == keys.length || !keys.every((item => "string" == typeof item && item.trim().length > 0))) throw new Error("Invalid keys type, expected array of hex encoded string!");
        const tokenParts = authToken.split(".");
        if (4 !== tokenParts.length) throw new Error("Token malformed: invalid short token format, expected token with four sets of base64url encoded fields joined by a period ‘.’!");
        const cacheKey = await Util.buildKey([ authToken ].concat(keys)), v = Cache.getShortToken(cacheKey), clockTimestamp = Math.floor(Date.now() / 1e3);
        if (v) {
            if (clockTimestamp > v.exp + (this.wmOptions.clockTolerance || 0)) throw new Error("Token expired!");
            return v;
        }
        const exp = parseInt(Util.uint8ArrayToHex(base64url.decode(tokenParts[0], "Uint8Array")), 16);
        if (clockTimestamp > exp + (this.wmOptions.clockTolerance || 0)) throw new Error("Token expired!");
        const title = base64url.decode(tokenParts[1], "String"), wmid = parseInt(Util.uint8ArrayToHex(base64url.decode(tokenParts[2], "Uint8Array")), 16), signHex = Util.uint8ArrayToHex(base64url.decode(tokenParts[3], "Uint8Array"));
        let isTokenVerified = !1;
        for (const k of keys) {
            const signature = sha256.exports.hmac(base16.decode(k, "Uint8Array"), (new TextEncoder$1).encode(`${tokenParts[0]}.${tokenParts[1]}.${tokenParts[2]}`));
            if (Util.uint8ArrayToHex(new Uint8Array(signature)).substring(0, 30) === signHex) {
                isTokenVerified = !0;
                break;
            }
        }
        if (!isTokenVerified) throw new Error("Token signature verification failed!");
        const shortToken = {
            exp,
            wmid,
            title
        };
        return Cache.storeShortToken(cacheKey, {
            exp,
            wmid,
            title
        }), shortToken;
    }
    async validateToken(authToken, keys) {
        if (!("string" == typeof authToken && !Util.isEmptyString(authToken) || authToken instanceof Uint8Array && authToken.length > 0)) throw new Error("Invalid token type, expected non empty string or non empty Uint8Array!");
        if (!Array.isArray(keys) || 0 == keys.length || !keys.every((item => "string" == typeof item && item.trim().length > 0))) throw new Error("Invalid keys type, expected array of hex or pem encoded strings!");
        const wmJSON = {}, cacheKey = await Util.buildKey([ authToken ].concat(keys)), v = Cache.getToken(cacheKey);
        if (v) return wmJSON.header = v.header, wmJSON.payload = v.payload, this.validateClaims(wmJSON.payload), 
        wmJSON;
        if (this.wmOptions.tokenType === TokenType.CWT) {
            let authTokenBuf;
            authTokenBuf = "string" == typeof authToken ? base16.decode(authToken, "Uint8Array") : authToken;
            const cryptoKeys = await this.importCryptoKeys(keys, authToken), cwtJSON = await this.cwtValidator.validate(authTokenBuf, cryptoKeys);
            wmJSON.header = cwtJSON.header, wmJSON.payload = CWTUtil.claimsTranslate(Object.fromEntries(new Map(cwtJSON.payload)), claimsLabelMap);
        } else {
            if (this.wmOptions.tokenType !== TokenType.JWT) throw new Error("Invalid token type! Only cwt or jwt auth tokens are supported!");
            {
                if ("string" != typeof authToken) throw new Error("JWT token must be base64 url encoded string!");
                const cryptoKeys = await this.importCryptoKeys(keys, authToken), jsonJWT = await this.jwtValidator.validate(authToken, cryptoKeys);
                wmJSON.header = jsonJWT.header, wmJSON.payload = jsonJWT.payload;
            }
        }
        return this.wmOptions.validateWMClaims && this.validateWMJWTRules(wmJSON.payload), 
        Cache.storeToken(cacheKey, wmJSON), wmJSON;
    }
    validateWMJWTRules(payload) {
        if (!payload.wmver) throw new Error("Token malformed: missing mandatory wmver claim");
        if ("number" != typeof payload.wmver) throw new Error("Token malformed: wmver must be number");
        if (!payload.wmvnd) throw new Error("Token malformed: missing mandatory wmvnd claim");
        if ("string" != typeof payload.wmvnd) throw new Error("Token malformed: wmvnd must be string");
        if (!payload.wmid) throw new Error("Token malformed: missing mandatory wmid claim");
        if (![ "string", "number", "" ].includes(typeof payload.wmid)) throw new Error("Token malformed: wmid must be string | number");
        if ("number" == typeof payload.wmid && Math.floor(payload.wmid) !== payload.wmid) throw new Error("Token malformed: wmid must be integer");
        if (!payload.wmpatlen) throw new Error("Token malformed: missing mandatory wmpatlen claim");
        if ("number" != typeof payload.wmpatlen) throw new Error("Token malformed: wmpatlen must be number");
        if (!payload.wmidfmt) throw new Error("Token malformed: missing mandatory wmidfmt claim");
        if (![ "base64", "hexascii", "uint", "ab" ].includes(payload.wmidfmt)) throw new Error("Token malformed: invalid wmidfmt, must be any of base64, hexascii, uint or ab");
        if (payload.segduration && "number" != typeof payload.segduration) throw new Error("Token malformed: segduration must be number");
        if (void 0 === payload.wmidtyp) throw new Error("Token malformed: missing mandatory wmidtyp claim");
        if (0 === payload.wmidtyp) {
            if (!payload.wmidalg) throw new Error("Token malformed: missing wmidalg claim for direct case (i.e wmidtyp = 0)");
            if (![ "aes-128-cbc", "aes-256-cbc" ].includes(payload.wmidalg)) throw new Error("Token malformed: invalid wmidalg, must be any of aes-128-cb or aes-256-cbc");
            if (void 0 === payload.wmidivlen) throw new Error("Token malformed: missing wmidivlen claim for direct case (i.e wmidtyp = 0)");
            if ("number" != typeof payload.wmidivlen) throw new Error("Token malformed: wmidivlen must be number");
            if (!payload.wmidivhex) throw new Error("Token malformed: missing wmidivhex claim for direct case (i.e wmidtyp = 0)");
            if ("string" != typeof payload.wmidivhex) throw new Error("Token malformed: wmidivhex must be string");
            if (!payload.wmidpid) throw new Error("Token malformed: missing wmidpid claim for direct case (i.e wmidtyp = 0)");
            if ("string" != typeof payload.wmidpid) throw new Error("Token malformed: wmidpid must be string");
            if (!payload.wmidpalg) throw new Error("Token malformed: missing wmidpalg claim for direct case (i.e wmidtyp = 0)");
            if ("sha256" !== payload.wmidpalg) throw new Error("Token malformed: invalid wmidpalg, must be sha256");
        } else {
            if (1 !== payload.wmidtyp) throw new Error("Token malformed: invalid wmidtyp, must be 0 or 1");
            if (payload.wmidkeyver && "number" != typeof payload.wmidkeyver) throw new Error("Token malformed: wmidkeyver must be number");
            if (void 0 === payload.wmopid) throw new Error("Token malformed: missing wmopid claim for indirect case (i.e wmidtyp = 1)");
            if (payload.wmopid && ("number" != typeof payload.wmopid || Math.floor(payload.wmopid) !== payload.wmopid)) throw new Error("Token malformed: wmopid must be number");
        }
    }
    async getWMPathWithVariant(path, payload, secretKey, variantSubPath, rangeHeader) {
        if ("string" != typeof path) throw new Error("Invalid path type, expected string!");
        if ("object" != typeof payload) throw new Error("Invalid payload type, expected JSON object!");
        if ("string" != typeof secretKey) throw new Error("Invalid secretKey type, expected hex encoded string!");
        if (!Array.isArray(variantSubPath)) throw new Error("Invalid variantSubPath type, expected list of object containing field variant and subPath. (e.g [{variant: 0, subPath: A}])!");
        if (rangeHeader && "string" != typeof rangeHeader) throw new Error("Invalid rangeHeader type, expected string!");
        if (0 === payload.wmidtyp) throw new Error("Direct case is not supported at the moment!");
        if (1 === payload.wmidtyp) {
            if ("irdeto" === payload.wmvnd) {
                let position, tmid;
                const {basedir, filename} = Util.getURLByParts(path), sidecarObject = await this.getSideCarObject(basedir, filename);
                if (rangeHeader) {
                    const range = Util.parseRangeHeader(rangeHeader);
                    position = CborParser.findPosition(sidecarObject, BigInt(range.start), BigInt(range.end));
                } else position = CborParser.findPosition(sidecarObject, BigInt(-1), BigInt(-1), filename);
                if (void 0 === position) throw new Error("Unable to find position from the side car file!");
                logger.log("D:pos: %s", position);
                let subPath, tmidVariant = 0;
                if (-1 == position) subPath = this.getSubVariantPath(variantSubPath, tmidVariant); else {
                    const cacheKey = await Util.buildKey([ payload, secretKey ]);
                    tmid = Cache.getTmid(cacheKey), tmid || (tmid = await IrdetoAlgorithm.generateTmid(payload.wmid, payload.wmopid, payload.wmidfmt, payload.wmpatlen, secretKey), 
                    Cache.storeTmid(cacheKey, tmid));
                    const tmidLenBits = 4 * tmid.length, tmidPos = position % tmidLenBits, tmidChar = tmid[tmidLenBits / 4 - Math.floor(tmidPos / 4) - 1], tmidBitPos = 1 << tmidPos % 4;
                    tmidVariant = 0 == (parseInt(tmidChar, 16) & tmidBitPos) ? 0 : 1, subPath = this.getSubVariantPath(variantSubPath, tmidVariant);
                }
                if (null === subPath) throw new Error(`No watermarking subpath found for the variant ${tmidVariant}!`);
                return `${basedir}/${subPath}/${filename}`;
            }
            throw new Error("Invalid wmvnd, indirect case with only 'irdeto' vendor is supported at the moment!");
        }
        throw new Error("Invalid wmidtyp, must be 0 (direct) or 1 (indirect)!");
    }
    async getSideCarObject(baseDir, filename) {
        if (!baseDir || !filename) throw new Error("Unable to get side car object for the request, invalid url!");
        const paceInfoResponse = await httpRequest(`${baseDir}/${Watermarking.WMPACEINFO_DIR}/${filename}`), contentLength = paceInfoResponse.getHeader("Content-Length");
        if (null == contentLength || 0 === contentLength.length) throw new Error("Side car processing failed due to no content-length response header found!");
        const paceinfoLength = parseInt(contentLength[0]), dataArr = await Util.streamToUint8Array(paceInfoResponse.body, paceinfoLength);
        return CborParser.decode(dataArr);
    }
    getSubVariantPath(variantSubPaths, tmidVariant) {
        for (let i = 0; i < variantSubPaths.length; i++) {
            const variantSubPath = variantSubPaths[i];
            if (null !== variantSubPath && variantSubPath.variant == tmidVariant) return variantSubPath.subPath;
        }
        return null;
    }
    validateClaims(wmPayload) {
        if (this.wmOptions.issuer && wmPayload.iss && this.wmOptions.issuer !== wmPayload.iss) throw new Error(`${this.wmOptions.tokenType} malformed: invalid iss, expected ${this.wmOptions.issuer}`);
        if (this.wmOptions.subject && wmPayload.sub && this.wmOptions.subject !== wmPayload.sub) throw new Error(`${this.wmOptions.tokenType} malformed: invalid sub, expected ${this.wmOptions.subject}`);
        if (this.wmOptions.audience) {
            const aud = wmPayload.aud;
            if (aud && (Array.isArray(aud) || "string" == typeof aud)) {
                if (!(Array.isArray(aud) ? aud : [ aud ]).includes(this.wmOptions.audience)) throw new Error(`${this.wmOptions.tokenType} malformed: invalid aud, expected ${this.wmOptions.audience}`);
            }
        }
        const clockTimestamp = Math.floor(Date.now() / 1e3);
        if (!1 === this.wmOptions.ignoreExpiration) {
            if (!wmPayload.exp) throw new Error(`${this.wmOptions.tokenType} malformed: missing exp field in payload`);
            if ("number" != typeof wmPayload.exp) throw new Error(`${this.wmOptions.tokenType} malformed: exp must be number`);
            if (clockTimestamp > wmPayload.exp + (this.wmOptions.clockTolerance || 0)) throw new Error(`${this.wmOptions.tokenType} expired`);
        }
        if (!1 === this.wmOptions.ignoreNotBefore) {
            if (!wmPayload.nbf) throw new Error(`${this.wmOptions.tokenType} malformed: missing nbf field in payload`);
            if ("number" != typeof wmPayload.nbf) throw new Error(`${this.wmOptions.tokenType} malformed: nbf must be number`);
            if (wmPayload.nbf > clockTimestamp + (this.wmOptions.clockTolerance || 0)) throw new Error(`${this.wmOptions.tokenType} not active`);
        }
    }
    async importCryptoKeys(keys, authToken) {
        const cryptoKeys = [];
        if (this.wmOptions.tokenType == TokenType.CWT) for (const key of keys) {
            const cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                name: "HMAC",
                hash: "SHA-256"
            }, !1, [ "verify" ]);
            cryptoKeys.push(cKey);
        } else {
            const jwtParts = authToken.split("."), jwtHBin = atob(jwtParts[0]);
            switch (JSON.parse(jwtHBin).alg) {
              case "HS512":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                        name: "HMAC",
                        hash: "SHA-512"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "HS384":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                        name: "HMAC",
                        hash: "SHA-384"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "HS256":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                        name: "HMAC",
                        hash: "SHA-256"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "RS512":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "RSASSA-PKCS1-v1_5",
                        hash: "SHA-512"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "RS384":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "RSASSA-PKCS1-v1_5",
                        hash: "SHA-384"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "RS256":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "RSASSA-PKCS1-v1_5",
                        hash: "SHA-256"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "ES512":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "ECDSA",
                        namedCurve: "P-521"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "ES384":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "ECDSA",
                        namedCurve: "P-384"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "ES256":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "ECDSA",
                        namedCurve: "P-256"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "PS512":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "RSA-PSS",
                        hash: "SHA-512"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "PS384":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "RSA-PSS",
                        hash: "SHA-384"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
                break;

              case "PS256":
                for (const key of keys) {
                    const cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                        name: "RSA-PSS",
                        hash: "SHA-256"
                    }, !1, [ "verify" ]);
                    cryptoKeys.push(cKey);
                }
            }
        }
        return cryptoKeys;
    }
}

Watermarking.WMPACEINFO_DIR = "WmPaceInfo";

export { CWTUtil, CWTValidator, JWTValidator, TokenType, Watermarking };
