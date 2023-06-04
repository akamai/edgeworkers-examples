/** @preserve @version 1.1.0 */
import { WritableStream } from "streams";

import { crypto, pem2ab } from "crypto";

import { TextEncoder, base16, base64url } from "encoding";

import { logger } from "log";

import { httpRequest } from "http-request";

import { decode, Encoder } from "./cbor-x.js";

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
                if (!regex) return seg[segmentsLabel_position];
                if (new RegExp(regex).test(fileName)) return seg[segmentsLabel_position];
            }
        } else {
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
    300: "wmver",
    301: "wmvnd",
    302: "wmpatlen",
    303: "wmsegduration",
    304: "wmpattern",
    305: "wmid",
    306: "wmopid",
    307: "wmkeyver"
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

const CoseAlgTags = {
    3: "A256GCM"
}, HeaderLabelToKey_alg = 1, HeaderLabelToKey_IV = 5;

class DirectAlgorithm {
    static async generateTmid(payload, secretKey) {
        if (64 != secretKey.length) throw new Error("secretKey is not 256 bits / correctly hex encoded");
        if (!(payload.wmpattern instanceof Uint8Array)) throw new Error("Token malformed: wmpattern must be bytes");
        const {alg, headers, ciphertext} = this.decodeWmpattern(payload.wmpattern), {p, u} = headers, iv = u[HeaderLabelToKey_IV], Enc_structure = [ "Encrypt0", p, DirectAlgorithm.EMPTY_BUFFER ], aad = DirectAlgorithm.encoder.encode(Enc_structure), decryptedData = await this.decrypt(alg, ciphertext, iv, aad, secretKey);
        if (void 0 === decryptedData || 0 === decryptedData.byteLength) throw new Error("Error decrypting payload");
        return uint8ArrayToHex(new Uint8Array(decryptedData));
    }
    static decodeWmpattern(wmpattern) {
        let coseMessage = CborParser.decode(wmpattern);
        if ("number" != typeof coseMessage.tag || 16 !== coseMessage.tag) throw new Error("Invalid COSE message structure, expected Encrypt0");
        if (coseMessage = coseMessage.value, !Array.isArray(coseMessage) || 3 !== coseMessage.length) throw new Error("Invalid COSE message structure for COSE CBOR Encrypt0Tag, expected arry of length 3!");
        const [p, u, ciphertext] = coseMessage;
        let pH = p.length ? CborParser.decode(p) : this.EMPTY_BUFFER;
        pH = Object.keys(pH).length ? pH : this.EMPTY_BUFFER;
        const uH = Object.keys(u).length ? u : this.EMPTY_BUFFER;
        let alg = pH !== this.EMPTY_BUFFER ? pH[HeaderLabelToKey_alg] : uH !== this.EMPTY_BUFFER ? u[HeaderLabelToKey_alg] : void 0;
        if (!alg) throw new Error("Missing mandatory alg protected header");
        return alg = CoseAlgTags[Number(alg)], {
            alg,
            headers: {
                p,
                u: uH
            },
            ciphertext
        };
    }
    static async decrypt(alg, ciphertext, iv, aad, secretKey) {
        if ("A256GCM" === alg) {
            const key = await crypto.subtle.importKey("raw", base16.decode(secretKey, "Uint8Array").buffer, {
                name: "AES-GCM"
            }, !1, [ "decrypt" ]);
            return crypto.subtle.decrypt({
                name: "AES-GCM",
                iv,
                additionalData: aad
            }, key, ciphertext);
        }
        throw new Error(`Unsupported Algorithm, ${alg}`);
    }
}

DirectAlgorithm.EMPTY_BUFFER = new Uint8Array(0), DirectAlgorithm.encoder = new Encoder({
    tagUint8Array: !1
});

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
        if ("number" != typeof payload.wmvnd) throw new Error("Token malformed: wmvnd must be number");
        if (payload.wmid) {
            if (![ "string", "number" ].includes(typeof payload.wmid)) throw new Error("Token malformed: wmid must be string or number");
            if ("number" == typeof payload.wmid && Math.floor(payload.wmid) !== payload.wmid) throw new Error("Token malformed: wmid must be integer");
            if (void 0 === payload.wmopid) throw new Error("Token malformed: missing wmopid claim for indirect case");
            if (payload.wmopid && ("number" != typeof payload.wmopid || Math.floor(payload.wmopid) !== payload.wmopid)) throw new Error("Token malformed: wmopid must be number");
            if (payload.wmkeyver && "number" != typeof payload.wmkeyver) throw new Error("Token malformed: wmkeyver must be number");
        } else {
            if (!payload.wmpattern) throw new Error("Token malformed: missing mandatory wmid or wmpattern claim");
            if (!(payload.wmpattern instanceof Uint8Array)) throw new Error("Token malformed: wmpattern must be bytes");
        }
        if (!payload.wmpatlen) throw new Error("Token malformed: missing mandatory wmpatlen claim");
        if ("number" != typeof payload.wmpatlen) throw new Error("Token malformed: wmpatlen must be number");
        if (payload.wmsegduration && !Array.isArray(payload.wmsegduration)) throw new Error("Token malformed: wmsegduration must be array of number");
    }
    async getWMPathWithVariant(path, payload, secretKey, rangeHeader) {
        if ("string" != typeof path) throw new Error("Invalid path type, expected string!");
        if ("object" != typeof payload) throw new Error("Invalid payload type, expected JSON object!");
        if ("string" != typeof secretKey) throw new Error("Invalid secretKey type, expected hex encoded string!");
        if (rangeHeader && "string" != typeof rangeHeader) throw new Error("Invalid rangeHeader type, expected string!");
        let position, tmid;
        const cacheKey = await buildKey([ payload, secretKey ]);
        if (tmid = Cache.getTmid(cacheKey), !tmid) {
            if (payload.wmpattern) tmid = await DirectAlgorithm.generateTmid(payload, secretKey); else {
                if (!payload.wmid) throw new Error("Invalid watermarking token, must contain field wmid (indirect) or wmpattern (direct)!");
                {
                    const vendorAlgorithm = this.vendorAlgorithms.get(payload.wmvnd);
                    if (!vendorAlgorithm) throw new Error(`Unable to find vendor: ${payload.wmvnd} specific algorithm, Kindly provide the algorithm implementation!`);
                    tmid = await vendorAlgorithm.generateTmid(payload, secretKey);
                }
            }
            Cache.storeTmid(cacheKey, tmid);
        }
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
        if (null == position) throw new Error("Unable to find position from the side car file!");
        logger.log("D:pos: %s", position);
        let tmidVariant = 0;
        if (-1 !== position) {
            const tmidLenBits = 4 * tmid.length, tmidPos = position % tmidLenBits, tmidChar = tmid[tmidLenBits / 4 - Math.floor(tmidPos / 4) - 1], tmidBitPos = 1 << tmidPos % 4;
            tmidVariant = 0 == (parseInt(tmidChar, 16) & tmidBitPos) ? 0 : 1;
        }
        return tmidVariant;
    }
    async getSideCarObject(baseDir, filename) {
        if (!baseDir || !filename) throw new Error("Unable to get side car object for the request, invalid url!");
        const paceInfoResponse = await httpRequest(`${baseDir}/${Watermarking.WMPACEINFO_DIR}/${filename}`);
        if (paceInfoResponse.ok) {
            const contentLength = paceInfoResponse.getHeader("Content-Length");
            if (null == contentLength || 0 === contentLength.length) throw new Error("Side car processing failed due to no content-length response header found!");
            {
                const paceinfoLength = parseInt(contentLength[0]);
                if (0 === paceinfoLength) {
                    const wmPaceInfoEgress = paceInfoResponse.getHeader("WMPaceInfoEgress");
                    if (null == wmPaceInfoEgress || 0 === wmPaceInfoEgress.length) throw new Error("Side car processing failed. Could not find side car file in response header or body!");
                    {
                        const dataArr = base64url.decode(wmPaceInfoEgress[0], "Uint8Array");
                        return CborParser.decode(dataArr);
                    }
                }
                {
                    const dataArr = await async function(stream, size) {
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
            }
        }
        throw new Error("Side car processing failed due to error code from origin server!");
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
