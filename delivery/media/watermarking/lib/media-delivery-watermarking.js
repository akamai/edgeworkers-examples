/** @preserve @version 1.0.0 */
import { WritableStream } from "streams";

import { crypto, pem2ab } from "crypto";

import { TextEncoder, base16 } from "encoding";

import { logger } from "log";

import { httpRequest } from "http-request";

import { decode } from "./cbor-x.js";

import { CWTValidator, CWTUtil } from "./cwt.js";

import { JWTValidator } from "./jwt.js";

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

function uint8ArrayToHex(uint8Array) {
    return Array.from(uint8Array, (function(byte) {
        return ("0" + (255 & byte).toString(16)).slice(-2);
    })).join("");
}

async function buildKey(keys) {
    let key = "";
    for (const k of keys) k instanceof Uint8Array ? key += uint8ArrayToHex(k) : key += "string" != typeof k ? JSON.stringify(k) : k.trim();
    const hashBuf = await crypto.subtle.digest("SHA-256", (new TextEncoder).encode(key));
    return uint8ArrayToHex(new Uint8Array(hashBuf));
}

const scLabel_segments = 2, scLabel_fileSize = 3, segmentsLabel_startRange = 4, segmentsLabel_segmentRegex = 5, segmentsLabel_position = 6;

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

class Watermarking {
    constructor(wmOptions, vendorAlgorithms) {
        if (this.cryptoKCache = new lru.exports.LRUMap(10), this.wmOptions = wmOptions || {
            tokenType: TokenType.CWT,
            validateWMClaims: !0
        }, this.wmOptions.tokenType = void 0 === this.wmOptions.tokenType ? TokenType.CWT : this.wmOptions.tokenType, 
        this.wmOptions.validateWMClaims = void 0 === this.wmOptions.validateWMClaims || this.wmOptions.validateWMClaims, 
        ![ TokenType.CWT, TokenType.JWT ].includes(this.wmOptions.tokenType)) throw new Error("Invalid token type! Only cwt or jwt auth tokens are supported!");
        this.wmOptions.tokenType === TokenType.CWT ? this.cwtValidator = new CWTValidator(wmOptions) : this.jwtValidator = new JWTValidator(wmOptions), 
        this.vendorAlgorithms = vendorAlgorithms || new Map;
    }
    async validateToken(authToken, keys, keyAlg) {
        if (!("string" == typeof authToken && (str = authToken, !(str instanceof Uint8Array ? !str || 0 === str.length : "string" != typeof str || !str || 0 === str.trim().length)) || authToken instanceof Uint8Array && authToken.length > 0)) throw new Error("Invalid token type, expected non empty string or non empty Uint8Array!");
        var str;
        if (!Array.isArray(keys) || 0 == keys.length || !keys.every((item => "string" == typeof item && item.trim().length > 0))) throw new Error("Invalid keys type, expected array of hex or pem encoded strings!");
        const wmJSON = {}, cacheKey = await buildKey([ authToken ].concat(keys)), v = Cache.getToken(cacheKey);
        if (v) return wmJSON.header = v.header, wmJSON.payload = v.payload, this.validateClaims(wmJSON.payload), 
        wmJSON;
        const cryptoKeys = await this.importCryptoKeys(keys, keyAlg);
        if (this.wmOptions.tokenType === TokenType.CWT) {
            let authTokenBuf;
            authTokenBuf = "string" == typeof authToken ? base16.decode(authToken, "Uint8Array") : authToken;
            const cwtJSON = await this.cwtValidator.validate(authTokenBuf, cryptoKeys);
            wmJSON.header = cwtJSON.header, wmJSON.payload = CWTUtil.claimsTranslate(Object.fromEntries(new Map(cwtJSON.payload)), claimsLabelMap);
        } else {
            if (this.wmOptions.tokenType !== TokenType.JWT) throw new Error("Invalid token type! Only cwt or jwt auth tokens are supported!");
            {
                if ("string" != typeof authToken) throw new Error("JWT token must be base64 url encoded string!");
                const jsonJWT = await this.jwtValidator.validate(authToken, cryptoKeys);
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
            if (!this.vendorAlgorithms.get(payload.wmvnd)) throw new Error(`Unable to find vendor: ${payload.wmvnd} specific algorithm, Kindly provide the algorithm implementation!`);
            let position, tmid;
            const {basedir, filename} = function(url) {
                const slashPos = url.lastIndexOf("/");
                return {
                    basedir: url.substring(0, slashPos),
                    filename: url.substring(slashPos + 1)
                };
            }(path), sidecarObject = await this.getSideCarObject(basedir, filename);
            if (rangeHeader) {
                const range = function(rangeHeader) {
                    if ("string" == typeof rangeHeader) {
                        const ranges = rangeParser_1(1 / 0, rangeHeader);
                        if ("number" != typeof ranges && "bytes" === ranges.type && 1 === ranges.length) return ranges[0];
                        throw new Error("Invalid range format!!");
                    }
                    throw new Error("Range header should be string!!");
                }(rangeHeader);
                position = CborParser.findPosition(sidecarObject, BigInt(range.start), BigInt(range.end));
            } else position = CborParser.findPosition(sidecarObject, BigInt(-1), BigInt(-1), filename);
            if (void 0 === position) throw new Error("Unable to find position from the side car file!");
            logger.log("D:pos: %s", position);
            let subPath, tmidVariant = 0;
            if (-1 == position) subPath = this.getSubVariantPath(variantSubPath, tmidVariant); else {
                const cacheKey = await buildKey([ payload, secretKey ]);
                if (tmid = Cache.getTmid(cacheKey), !tmid) {
                    const vendorAlgorithm = this.vendorAlgorithms.get(payload.wmvnd);
                    vendorAlgorithm ? tmid = await vendorAlgorithm.generateTmid(payload, secretKey) : logger.log("E:vendor alg not registered!"), 
                    Cache.storeTmid(cacheKey, tmid);
                }
                const tmidLenBits = 4 * tmid.length, tmidPos = position % tmidLenBits, tmidChar = tmid[tmidLenBits / 4 - Math.floor(tmidPos / 4) - 1], tmidBitPos = 1 << tmidPos % 4;
                tmidVariant = 0 == (parseInt(tmidChar, 16) & tmidBitPos) ? 0 : 1, subPath = this.getSubVariantPath(variantSubPath, tmidVariant);
            }
            if (null === subPath) throw new Error(`No watermarking subpath found for the variant ${tmidVariant}!`);
            return `${basedir}/${subPath}/${filename}`;
        }
        throw new Error("Invalid wmidtyp, must be 0 (direct) or 1 (indirect)!");
    }
    async getSideCarObject(baseDir, filename) {
        if (!baseDir || !filename) throw new Error("Unable to get side car object for the request, invalid url!");
        const paceInfoResponse = await httpRequest(`${baseDir}/${Watermarking.WMPACEINFO_DIR}/${filename}`), contentLength = paceInfoResponse.getHeader("Content-Length");
        if (null == contentLength || 0 === contentLength.length) throw new Error("Side car processing failed due to no content-length response header found!");
        const paceinfoLength = parseInt(contentLength[0]), dataArr = await async function(stream, size) {
            const buffer = new ArrayBuffer(size), arr = new Uint8Array(buffer);
            let currentPos = 0;
            return await stream.pipeTo(new WritableStream({
                write(chunk) {
                    arr.set(chunk, currentPos), currentPos += chunk.length;
                }
            })), arr;
        }(paceInfoResponse.body, paceinfoLength);
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
    async importCryptoKeys(keys, keyAlg) {
        const cryptoKeys = [];
        switch (keyAlg.toUpperCase()) {
          case "HS512":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                    name: "HMAC",
                    hash: "SHA-512"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "HS384":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                    name: "HMAC",
                    hash: "SHA-384"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "HS256":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("raw", base16.decode(key, "Uint8Array").buffer, {
                    name: "HMAC",
                    hash: "SHA-256"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "RS512":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: "SHA-512"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "RS384":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: "SHA-384"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "RS256":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: "SHA-256"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "ES512":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "ECDSA",
                    namedCurve: "P-521"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "ES384":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "ECDSA",
                    namedCurve: "P-384"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "ES256":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "ECDSA",
                    namedCurve: "P-256"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "PS512":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSA-PSS",
                    hash: "SHA-512"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "PS384":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSA-PSS",
                    hash: "SHA-384"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          case "PS256":
            for (const key of keys) {
                let cKey = this.cryptoKCache.get(key);
                cKey || (cKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSA-PSS",
                    hash: "SHA-256"
                }, !1, [ "verify" ]), this.cryptoKCache.set(key, cKey)), cryptoKeys.push(cKey);
            }
            break;

          default:
            throw new Error(`Unable to import ${keyAlg.toUpperCase()} type keys.`);
        }
        return cryptoKeys;
    }
}

Watermarking.WMPACEINFO_DIR = "WmPaceInfo";

export { TokenType, Watermarking };
