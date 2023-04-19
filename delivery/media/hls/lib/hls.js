/** @preserve @version 1.0.0 */
import { httpRequest } from "http-request";

var global$1 = "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, lookup = [], revLookup = [], Arr = "undefined" != typeof Uint8Array ? Uint8Array : Array, inited = !1;

function init() {
    inited = !0;
    for (var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, len = code.length; i < len; ++i) lookup[i] = code[i], 
    revLookup[code.charCodeAt(i)] = i;
    revLookup["-".charCodeAt(0)] = 62, revLookup["_".charCodeAt(0)] = 63;
}

function encodeChunk(uint8, start, end) {
    for (var tmp, num, output = [], i = start; i < end; i += 3) tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2], 
    output.push(lookup[(num = tmp) >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num]);
    return output.join("");
}

function fromByteArray(uint8) {
    var tmp;
    inited || init();
    for (var len = uint8.length, extraBytes = len % 3, output = "", parts = [], i = 0, len2 = len - extraBytes; i < len2; i += 16383) parts.push(encodeChunk(uint8, i, i + 16383 > len2 ? len2 : i + 16383));
    return 1 === extraBytes ? (tmp = uint8[len - 1], output += lookup[tmp >> 2], output += lookup[tmp << 4 & 63], 
    output += "==") : 2 === extraBytes && (tmp = (uint8[len - 2] << 8) + uint8[len - 1], 
    output += lookup[tmp >> 10], output += lookup[tmp >> 4 & 63], output += lookup[tmp << 2 & 63], 
    output += "="), parts.push(output), parts.join("");
}

function read(buffer, offset, isLE, mLen, nBytes) {
    var e, m, eLen = 8 * nBytes - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, nBits = -7, i = isLE ? nBytes - 1 : 0, d = isLE ? -1 : 1, s = buffer[offset + i];
    for (i += d, e = s & (1 << -nBits) - 1, s >>= -nBits, nBits += eLen; nBits > 0; e = 256 * e + buffer[offset + i], 
    i += d, nBits -= 8) ;
    for (m = e & (1 << -nBits) - 1, e >>= -nBits, nBits += mLen; nBits > 0; m = 256 * m + buffer[offset + i], 
    i += d, nBits -= 8) ;
    if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : 1 / 0 * (s ? -1 : 1);
        m += Math.pow(2, mLen), e -= eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}

function write(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c, eLen = 8 * nBytes - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0, i = isLE ? 0 : nBytes - 1, d = isLE ? 1 : -1, s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
    for (value = Math.abs(value), isNaN(value) || value === 1 / 0 ? (m = isNaN(value) ? 1 : 0, 
    e = eMax) : (e = Math.floor(Math.log(value) / Math.LN2), value * (c = Math.pow(2, -e)) < 1 && (e--, 
    c *= 2), (value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias)) * c >= 2 && (e++, 
    c /= 2), e + eBias >= eMax ? (m = 0, e = eMax) : e + eBias >= 1 ? (m = (value * c - 1) * Math.pow(2, mLen), 
    e += eBias) : (m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen), e = 0)); mLen >= 8; buffer[offset + i] = 255 & m, 
    i += d, m /= 256, mLen -= 8) ;
    for (e = e << mLen | m, eLen += mLen; eLen > 0; buffer[offset + i] = 255 & e, i += d, 
    e /= 256, eLen -= 8) ;
    buffer[offset + i - d] |= 128 * s;
}

var toString = {}.toString, isArray = Array.isArray || function(arr) {
    return "[object Array]" == toString.call(arr);
};

function kMaxLength() {
    return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}

function createBuffer(that, length) {
    if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
    return Buffer.TYPED_ARRAY_SUPPORT ? (that = new Uint8Array(length)).__proto__ = Buffer.prototype : (null === that && (that = new Buffer(length)), 
    that.length = length), that;
}

function Buffer(arg, encodingOrOffset, length) {
    if (!(Buffer.TYPED_ARRAY_SUPPORT || this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
    if ("number" == typeof arg) {
        if ("string" == typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
        return allocUnsafe(this, arg);
    }
    return from(this, arg, encodingOrOffset, length);
}

function from(that, value, encodingOrOffset, length) {
    if ("number" == typeof value) throw new TypeError('"value" argument must not be a number');
    return "undefined" != typeof ArrayBuffer && value instanceof ArrayBuffer ? function(that, array, byteOffset, length) {
        if (array.byteLength, byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        Buffer.TYPED_ARRAY_SUPPORT ? (that = array).__proto__ = Buffer.prototype : that = fromArrayLike(that, array);
        return that;
    }(that, value, encodingOrOffset, length) : "string" == typeof value ? function(that, string, encoding) {
        "string" == typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
    }(that, value, encodingOrOffset) : function(that, obj) {
        if (internalIsBuffer(obj)) {
            var len = 0 | checked(obj.length);
            return 0 === (that = createBuffer(that, len)).length || obj.copy(that, 0, 0, len), 
            that;
        }
        if (obj) {
            if ("undefined" != typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) return "number" != typeof obj.length || (val = obj.length) != val ? createBuffer(that, 0) : fromArrayLike(that, obj);
            if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        var val;
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
    }(that, value);
}

function assertSize(size) {
    if ("number" != typeof size) throw new TypeError('"size" argument must be a number');
    if (size < 0) throw new RangeError('"size" argument must not be negative');
}

function allocUnsafe(that, size) {
    if (assertSize(size), that = createBuffer(that, size < 0 ? 0 : 0 | checked(size)), 
    !Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
    return that;
}

function fromArrayLike(that, array) {
    var length = array.length < 0 ? 0 : 0 | checked(array.length);
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
    return that;
}

function checked(length) {
    if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
    return 0 | length;
}

function internalIsBuffer(b) {
    return !(null == b || !b._isBuffer);
}

function byteLength(string, encoding) {
    if (internalIsBuffer(string)) return string.length;
    if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
    "string" != typeof string && (string = "" + string);
    var len = string.length;
    if (0 === len) return 0;
    for (var loweredCase = !1; ;) switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len;

      case "utf8":
      case "utf-8":
      case void 0:
        return utf8ToBytes(string).length;

      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return 2 * len;

      case "hex":
        return len >>> 1;

      case "base64":
        return base64ToBytes(string).length;

      default:
        if (loweredCase) return utf8ToBytes(string).length;
        encoding = ("" + encoding).toLowerCase(), loweredCase = !0;
    }
}

function slowToString(encoding, start, end) {
    var loweredCase = !1;
    if ((void 0 === start || start < 0) && (start = 0), start > this.length) return "";
    if ((void 0 === end || end > this.length) && (end = this.length), end <= 0) return "";
    if ((end >>>= 0) <= (start >>>= 0)) return "";
    for (encoding || (encoding = "utf8"); ;) switch (encoding) {
      case "hex":
        return hexSlice(this, start, end);

      case "utf8":
      case "utf-8":
        return utf8Slice(this, start, end);

      case "ascii":
        return asciiSlice(this, start, end);

      case "latin1":
      case "binary":
        return latin1Slice(this, start, end);

      case "base64":
        return base64Slice(this, start, end);

      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase(), loweredCase = !0;
    }
}

function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m], b[m] = i;
}

function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (0 === buffer.length) return -1;
    if ("string" == typeof byteOffset ? (encoding = byteOffset, byteOffset = 0) : byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648), 
    byteOffset = +byteOffset, isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1), 
    byteOffset < 0 && (byteOffset = buffer.length + byteOffset), byteOffset >= buffer.length) {
        if (dir) return -1;
        byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (!dir) return -1;
        byteOffset = 0;
    }
    if ("string" == typeof val && (val = Buffer.from(val, encoding)), internalIsBuffer(val)) return 0 === val.length ? -1 : arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    if ("number" == typeof val) return val &= 255, Buffer.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset) : arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
    throw new TypeError("val must be string, number or Buffer");
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var i, indexSize = 1, arrLength = arr.length, valLength = val.length;
    if (void 0 !== encoding && ("ucs2" === (encoding = String(encoding).toLowerCase()) || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding)) {
        if (arr.length < 2 || val.length < 2) return -1;
        indexSize = 2, arrLength /= 2, valLength /= 2, byteOffset /= 2;
    }
    function read(buf, i) {
        return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
    }
    if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            if (-1 === foundIndex && (foundIndex = i), i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else -1 !== foundIndex && (i -= i - foundIndex), foundIndex = -1;
    } else for (byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength), 
    i = byteOffset; i >= 0; i--) {
        for (var found = !0, j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
            found = !1;
            break;
        }
        if (found) return i;
    }
    return -1;
}

function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    length ? (length = Number(length)) > remaining && (length = remaining) : length = remaining;
    var strLen = string.length;
    if (strLen % 2 != 0) throw new TypeError("Invalid hex string");
    length > strLen / 2 && (length = strLen / 2);
    for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(2 * i, 2), 16);
        if (isNaN(parsed)) return i;
        buf[offset + i] = parsed;
    }
    return i;
}

function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
    return blitBuffer(function(str) {
        for (var byteArray = [], i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
    }(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
    return blitBuffer(function(str, units) {
        for (var c, hi, lo, byteArray = [], i = 0; i < str.length && !((units -= 2) < 0); ++i) hi = (c = str.charCodeAt(i)) >> 8, 
        lo = c % 256, byteArray.push(lo), byteArray.push(hi);
        return byteArray;
    }(string, buf.length - offset), buf, offset, length);
}

function base64Slice(buf, start, end) {
    return 0 === start && end === buf.length ? fromByteArray(buf) : fromByteArray(buf.slice(start, end));
}

function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    for (var res = [], i = start; i < end; ) {
        var secondByte, thirdByte, fourthByte, tempCodePoint, firstByte = buf[i], codePoint = null, bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) switch (bytesPerSequence) {
          case 1:
            firstByte < 128 && (codePoint = firstByte);
            break;

          case 2:
            128 == (192 & (secondByte = buf[i + 1])) && (tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte) > 127 && (codePoint = tempCodePoint);
            break;

          case 3:
            secondByte = buf[i + 1], thirdByte = buf[i + 2], 128 == (192 & secondByte) && 128 == (192 & thirdByte) && (tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte) > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
            break;

          case 4:
            secondByte = buf[i + 1], thirdByte = buf[i + 2], fourthByte = buf[i + 3], 128 == (192 & secondByte) && 128 == (192 & thirdByte) && 128 == (192 & fourthByte) && (tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte) > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
        }
        null === codePoint ? (codePoint = 65533, bytesPerSequence = 1) : codePoint > 65535 && (codePoint -= 65536, 
        res.push(codePoint >>> 10 & 1023 | 55296), codePoint = 56320 | 1023 & codePoint), 
        res.push(codePoint), i += bytesPerSequence;
    }
    return function(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "", i = 0;
        for (;i < len; ) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
    }(res);
}

Buffer.TYPED_ARRAY_SUPPORT = void 0 === global$1.TYPED_ARRAY_SUPPORT || global$1.TYPED_ARRAY_SUPPORT, 
kMaxLength(), Buffer.poolSize = 8192, Buffer._augment = function(arr) {
    return arr.__proto__ = Buffer.prototype, arr;
}, Buffer.from = function(value, encodingOrOffset, length) {
    return from(null, value, encodingOrOffset, length);
}, Buffer.TYPED_ARRAY_SUPPORT && (Buffer.prototype.__proto__ = Uint8Array.prototype, 
Buffer.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && Buffer[Symbol.species]), 
Buffer.alloc = function(size, fill, encoding) {
    return function(that, size, fill, encoding) {
        return assertSize(size), size <= 0 ? createBuffer(that, size) : void 0 !== fill ? "string" == typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill) : createBuffer(that, size);
    }(null, size, fill, encoding);
}, Buffer.allocUnsafe = function(size) {
    return allocUnsafe(null, size);
}, Buffer.allocUnsafeSlow = function(size) {
    return allocUnsafe(null, size);
}, Buffer.isBuffer = function(obj) {
    return null != obj && (!!obj._isBuffer || isFastBuffer(obj) || function(obj) {
        return "function" == typeof obj.readFloatLE && "function" == typeof obj.slice && isFastBuffer(obj.slice(0, 0));
    }(obj));
}, Buffer.compare = function(a, b) {
    if (!internalIsBuffer(a) || !internalIsBuffer(b)) throw new TypeError("Arguments must be Buffers");
    if (a === b) return 0;
    for (var x = a.length, y = b.length, i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
        x = a[i], y = b[i];
        break;
    }
    return x < y ? -1 : y < x ? 1 : 0;
}, Buffer.isEncoding = function(encoding) {
    switch (String(encoding).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;

      default:
        return !1;
    }
}, Buffer.concat = function(list, length) {
    if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (0 === list.length) return Buffer.alloc(0);
    var i;
    if (void 0 === length) for (length = 0, i = 0; i < list.length; ++i) length += list[i].length;
    var buffer = Buffer.allocUnsafe(length), pos = 0;
    for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
        buf.copy(buffer, pos), pos += buf.length;
    }
    return buffer;
}, Buffer.byteLength = byteLength, Buffer.prototype._isBuffer = !0, Buffer.prototype.swap16 = function() {
    var len = this.length;
    if (len % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
    return this;
}, Buffer.prototype.swap32 = function() {
    var len = this.length;
    if (len % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (var i = 0; i < len; i += 4) swap(this, i, i + 3), swap(this, i + 1, i + 2);
    return this;
}, Buffer.prototype.swap64 = function() {
    var len = this.length;
    if (len % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (var i = 0; i < len; i += 8) swap(this, i, i + 7), swap(this, i + 1, i + 6), 
    swap(this, i + 2, i + 5), swap(this, i + 3, i + 4);
    return this;
}, Buffer.prototype.toString = function() {
    var length = 0 | this.length;
    return 0 === length ? "" : 0 === arguments.length ? utf8Slice(this, 0, length) : slowToString.apply(this, arguments);
}, Buffer.prototype.equals = function(b) {
    if (!internalIsBuffer(b)) throw new TypeError("Argument must be a Buffer");
    return this === b || 0 === Buffer.compare(this, b);
}, Buffer.prototype.inspect = function() {
    var str = "";
    return this.length > 0 && (str = this.toString("hex", 0, 50).match(/.{2}/g).join(" "), 
    this.length > 50 && (str += " ... ")), "<Buffer " + str + ">";
}, Buffer.prototype.compare = function(target, start, end, thisStart, thisEnd) {
    if (!internalIsBuffer(target)) throw new TypeError("Argument must be a Buffer");
    if (void 0 === start && (start = 0), void 0 === end && (end = target ? target.length : 0), 
    void 0 === thisStart && (thisStart = 0), void 0 === thisEnd && (thisEnd = this.length), 
    start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
    if (thisStart >= thisEnd && start >= end) return 0;
    if (thisStart >= thisEnd) return -1;
    if (start >= end) return 1;
    if (this === target) return 0;
    for (var x = (thisEnd >>>= 0) - (thisStart >>>= 0), y = (end >>>= 0) - (start >>>= 0), len = Math.min(x, y), thisCopy = this.slice(thisStart, thisEnd), targetCopy = target.slice(start, end), i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i], y = targetCopy[i];
        break;
    }
    return x < y ? -1 : y < x ? 1 : 0;
}, Buffer.prototype.includes = function(val, byteOffset, encoding) {
    return -1 !== this.indexOf(val, byteOffset, encoding);
}, Buffer.prototype.indexOf = function(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, !0);
}, Buffer.prototype.lastIndexOf = function(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, !1);
}, Buffer.prototype.write = function(string, offset, length, encoding) {
    if (void 0 === offset) encoding = "utf8", length = this.length, offset = 0; else if (void 0 === length && "string" == typeof offset) encoding = offset, 
    length = this.length, offset = 0; else {
        if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
        offset |= 0, isFinite(length) ? (length |= 0, void 0 === encoding && (encoding = "utf8")) : (encoding = length, 
        length = void 0);
    }
    var remaining = this.length - offset;
    if ((void 0 === length || length > remaining) && (length = remaining), string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    encoding || (encoding = "utf8");
    for (var loweredCase = !1; ;) switch (encoding) {
      case "hex":
        return hexWrite(this, string, offset, length);

      case "utf8":
      case "utf-8":
        return utf8Write(this, string, offset, length);

      case "ascii":
        return asciiWrite(this, string, offset, length);

      case "latin1":
      case "binary":
        return latin1Write(this, string, offset, length);

      case "base64":
        return base64Write(this, string, offset, length);

      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = ("" + encoding).toLowerCase(), loweredCase = !0;
    }
}, Buffer.prototype.toJSON = function() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};

var MAX_ARGUMENTS_LENGTH = 4096;

function asciiSlice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
    return ret;
}

function latin1Slice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
    return ret;
}

function hexSlice(buf, start, end) {
    var len = buf.length;
    (!start || start < 0) && (start = 0), (!end || end < 0 || end > len) && (end = len);
    for (var out = "", i = start; i < end; ++i) out += toHex(buf[i]);
    return out;
}

function utf16leSlice(buf, start, end) {
    for (var bytes = buf.slice(start, end), res = "", i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
    return res;
}

function checkOffset(offset, ext, length) {
    if (offset % 1 != 0 || offset < 0) throw new RangeError("offset is not uint");
    if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
}

function checkInt(buf, value, offset, ext, max, min) {
    if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
}

function objectWriteUInt16(buf, value, offset, littleEndian) {
    value < 0 && (value = 65535 + value + 1);
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
}

function objectWriteUInt32(buf, value, offset, littleEndian) {
    value < 0 && (value = 4294967295 + value + 1);
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
}

function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
    if (offset < 0) throw new RangeError("Index out of range");
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
    return noAssert || checkIEEE754(buf, 0, offset, 4), write(buf, value, offset, littleEndian, 23, 4), 
    offset + 4;
}

function writeDouble(buf, value, offset, littleEndian, noAssert) {
    return noAssert || checkIEEE754(buf, 0, offset, 8), write(buf, value, offset, littleEndian, 52, 8), 
    offset + 8;
}

Buffer.prototype.slice = function(start, end) {
    var newBuf, len = this.length;
    if ((start = ~~start) < 0 ? (start += len) < 0 && (start = 0) : start > len && (start = len), 
    (end = void 0 === end ? len : ~~end) < 0 ? (end += len) < 0 && (end = 0) : end > len && (end = len), 
    end < start && (end = start), Buffer.TYPED_ARRAY_SUPPORT) (newBuf = this.subarray(start, end)).__proto__ = Buffer.prototype; else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, void 0);
        for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
    }
    return newBuf;
}, Buffer.prototype.readUIntLE = function(offset, byteLength, noAssert) {
    offset |= 0, byteLength |= 0, noAssert || checkOffset(offset, byteLength, this.length);
    for (var val = this[offset], mul = 1, i = 0; ++i < byteLength && (mul *= 256); ) val += this[offset + i] * mul;
    return val;
}, Buffer.prototype.readUIntBE = function(offset, byteLength, noAssert) {
    offset |= 0, byteLength |= 0, noAssert || checkOffset(offset, byteLength, this.length);
    for (var val = this[offset + --byteLength], mul = 1; byteLength > 0 && (mul *= 256); ) val += this[offset + --byteLength] * mul;
    return val;
}, Buffer.prototype.readUInt8 = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 1, this.length), this[offset];
}, Buffer.prototype.readUInt16LE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 2, this.length), this[offset] | this[offset + 1] << 8;
}, Buffer.prototype.readUInt16BE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 2, this.length), this[offset] << 8 | this[offset + 1];
}, Buffer.prototype.readUInt32LE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 4, this.length), (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
}, Buffer.prototype.readUInt32BE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 4, this.length), 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
}, Buffer.prototype.readIntLE = function(offset, byteLength, noAssert) {
    offset |= 0, byteLength |= 0, noAssert || checkOffset(offset, byteLength, this.length);
    for (var val = this[offset], mul = 1, i = 0; ++i < byteLength && (mul *= 256); ) val += this[offset + i] * mul;
    return val >= (mul *= 128) && (val -= Math.pow(2, 8 * byteLength)), val;
}, Buffer.prototype.readIntBE = function(offset, byteLength, noAssert) {
    offset |= 0, byteLength |= 0, noAssert || checkOffset(offset, byteLength, this.length);
    for (var i = byteLength, mul = 1, val = this[offset + --i]; i > 0 && (mul *= 256); ) val += this[offset + --i] * mul;
    return val >= (mul *= 128) && (val -= Math.pow(2, 8 * byteLength)), val;
}, Buffer.prototype.readInt8 = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 1, this.length), 128 & this[offset] ? -1 * (255 - this[offset] + 1) : this[offset];
}, Buffer.prototype.readInt16LE = function(offset, noAssert) {
    noAssert || checkOffset(offset, 2, this.length);
    var val = this[offset] | this[offset + 1] << 8;
    return 32768 & val ? 4294901760 | val : val;
}, Buffer.prototype.readInt16BE = function(offset, noAssert) {
    noAssert || checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | this[offset] << 8;
    return 32768 & val ? 4294901760 | val : val;
}, Buffer.prototype.readInt32LE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 4, this.length), this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
}, Buffer.prototype.readInt32BE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 4, this.length), this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
}, Buffer.prototype.readFloatLE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 4, this.length), read(this, offset, !0, 23, 4);
}, Buffer.prototype.readFloatBE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 4, this.length), read(this, offset, !1, 23, 4);
}, Buffer.prototype.readDoubleLE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 8, this.length), read(this, offset, !0, 52, 8);
}, Buffer.prototype.readDoubleBE = function(offset, noAssert) {
    return noAssert || checkOffset(offset, 8, this.length), read(this, offset, !1, 52, 8);
}, Buffer.prototype.writeUIntLE = function(value, offset, byteLength, noAssert) {
    (value = +value, offset |= 0, byteLength |= 0, noAssert) || checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength) - 1, 0);
    var mul = 1, i = 0;
    for (this[offset] = 255 & value; ++i < byteLength && (mul *= 256); ) this[offset + i] = value / mul & 255;
    return offset + byteLength;
}, Buffer.prototype.writeUIntBE = function(value, offset, byteLength, noAssert) {
    (value = +value, offset |= 0, byteLength |= 0, noAssert) || checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength) - 1, 0);
    var i = byteLength - 1, mul = 1;
    for (this[offset + i] = 255 & value; --i >= 0 && (mul *= 256); ) this[offset + i] = value / mul & 255;
    return offset + byteLength;
}, Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 1, 255, 0), 
    Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value)), this[offset] = 255 & value, 
    offset + 1;
}, Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 2, 65535, 0), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = 255 & value, this[offset + 1] = value >>> 8) : objectWriteUInt16(this, value, offset, !0), 
    offset + 2;
}, Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 2, 65535, 0), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 8, this[offset + 1] = 255 & value) : objectWriteUInt16(this, value, offset, !1), 
    offset + 2;
}, Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 4, 4294967295, 0), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset + 3] = value >>> 24, this[offset + 2] = value >>> 16, 
    this[offset + 1] = value >>> 8, this[offset] = 255 & value) : objectWriteUInt32(this, value, offset, !0), 
    offset + 4;
}, Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 4, 4294967295, 0), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 24, this[offset + 1] = value >>> 16, 
    this[offset + 2] = value >>> 8, this[offset + 3] = 255 & value) : objectWriteUInt32(this, value, offset, !1), 
    offset + 4;
}, Buffer.prototype.writeIntLE = function(value, offset, byteLength, noAssert) {
    if (value = +value, offset |= 0, !noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = 0, mul = 1, sub = 0;
    for (this[offset] = 255 & value; ++i < byteLength && (mul *= 256); ) value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1), 
    this[offset + i] = (value / mul >> 0) - sub & 255;
    return offset + byteLength;
}, Buffer.prototype.writeIntBE = function(value, offset, byteLength, noAssert) {
    if (value = +value, offset |= 0, !noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = byteLength - 1, mul = 1, sub = 0;
    for (this[offset + i] = 255 & value; --i >= 0 && (mul *= 256); ) value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1), 
    this[offset + i] = (value / mul >> 0) - sub & 255;
    return offset + byteLength;
}, Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 1, 127, -128), 
    Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value)), value < 0 && (value = 255 + value + 1), 
    this[offset] = 255 & value, offset + 1;
}, Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 2, 32767, -32768), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = 255 & value, this[offset + 1] = value >>> 8) : objectWriteUInt16(this, value, offset, !0), 
    offset + 2;
}, Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 2, 32767, -32768), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 8, this[offset + 1] = 255 & value) : objectWriteUInt16(this, value, offset, !1), 
    offset + 2;
}, Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648), 
    Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = 255 & value, this[offset + 1] = value >>> 8, 
    this[offset + 2] = value >>> 16, this[offset + 3] = value >>> 24) : objectWriteUInt32(this, value, offset, !0), 
    offset + 4;
}, Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
    return value = +value, offset |= 0, noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648), 
    value < 0 && (value = 4294967295 + value + 1), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 24, 
    this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = 255 & value) : objectWriteUInt32(this, value, offset, !1), 
    offset + 4;
}, Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
    return writeFloat(this, value, offset, !0, noAssert);
}, Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
    return writeFloat(this, value, offset, !1, noAssert);
}, Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
    return writeDouble(this, value, offset, !0, noAssert);
}, Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
    return writeDouble(this, value, offset, !1, noAssert);
}, Buffer.prototype.copy = function(target, targetStart, start, end) {
    if (start || (start = 0), end || 0 === end || (end = this.length), targetStart >= target.length && (targetStart = target.length), 
    targetStart || (targetStart = 0), end > 0 && end < start && (end = start), end === start) return 0;
    if (0 === target.length || 0 === this.length) return 0;
    if (targetStart < 0) throw new RangeError("targetStart out of bounds");
    if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
    if (end < 0) throw new RangeError("sourceEnd out of bounds");
    end > this.length && (end = this.length), target.length - targetStart < end - start && (end = target.length - targetStart + start);
    var i, len = end - start;
    if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    return len;
}, Buffer.prototype.fill = function(val, start, end, encoding) {
    if ("string" == typeof val) {
        if ("string" == typeof start ? (encoding = start, start = 0, end = this.length) : "string" == typeof end && (encoding = end, 
        end = this.length), 1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
        }
        if (void 0 !== encoding && "string" != typeof encoding) throw new TypeError("encoding must be a string");
        if ("string" == typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
    } else "number" == typeof val && (val &= 255);
    if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
    if (end <= start) return this;
    var i;
    if (start >>>= 0, end = void 0 === end ? this.length : end >>> 0, val || (val = 0), 
    "number" == typeof val) for (i = start; i < end; ++i) this[i] = val; else {
        var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString()), len = bytes.length;
        for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
    }
    return this;
};

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function toHex(n) {
    return n < 16 ? "0" + n.toString(16) : n.toString(16);
}

function utf8ToBytes(string, units) {
    var codePoint;
    units = units || 1 / 0;
    for (var length = string.length, leadSurrogate = null, bytes = [], i = 0; i < length; ++i) {
        if ((codePoint = string.charCodeAt(i)) > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    (units -= 3) > -1 && bytes.push(239, 191, 189);
                    continue;
                }
                if (i + 1 === length) {
                    (units -= 3) > -1 && bytes.push(239, 191, 189);
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                (units -= 3) > -1 && bytes.push(239, 191, 189), leadSurrogate = codePoint;
                continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
        } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
        if (leadSurrogate = null, codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
        } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
        }
    }
    return bytes;
}

function base64ToBytes(str) {
    return function(b64) {
        var i, j, l, tmp, placeHolders, arr;
        inited || init();
        var len = b64.length;
        if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
        placeHolders = "=" === b64[len - 2] ? 2 : "=" === b64[len - 1] ? 1 : 0, arr = new Arr(3 * len / 4 - placeHolders), 
        l = placeHolders > 0 ? len - 4 : len;
        var L = 0;
        for (i = 0, j = 0; i < l; i += 4, j += 3) tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)], 
        arr[L++] = tmp >> 16 & 255, arr[L++] = tmp >> 8 & 255, arr[L++] = 255 & tmp;
        return 2 === placeHolders ? (tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4, 
        arr[L++] = 255 & tmp) : 1 === placeHolders && (tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2, 
        arr[L++] = tmp >> 8 & 255, arr[L++] = 255 & tmp), arr;
    }(function(str) {
        if ((str = function(str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
        }(str).replace(INVALID_BASE64_RE, "")).length < 2) return "";
        for (;str.length % 4 != 0; ) str += "=";
        return str;
    }(str));
}

function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length && !(i + offset >= dst.length || i >= src.length); ++i) dst[i + offset] = src[i];
    return i;
}

function isFastBuffer(obj) {
    return !!obj.constructor && "function" == typeof obj.constructor.isBuffer && obj.constructor.isBuffer(obj);
}

let options = {};

function THROW(err) {
    if (options.strictMode) throw err;
    options.silent || console.error(err.message);
}

function toNumber(str, radix = 10) {
    if ("number" == typeof str) return str;
    const num = 10 === radix ? Number.parseFloat(str, radix) : Number.parseInt(str, radix);
    return Number.isNaN(num) ? 0 : num;
}

var utils$3 = {
    THROW,
    ASSERT: function(msg, ...options) {
        for (const [index, param] of options.entries()) param || THROW(new Error(`${msg} : Failed at [${index}]`));
    },
    CONDITIONALASSERT: function(...options) {
        for (const [index, [cond, param]] of options.entries()) cond && (param || THROW(new Error(`Conditional Assert : Failed at [${index}]`)));
    },
    PARAMCHECK: function(...options) {
        for (const [index, param] of options.entries()) void 0 === param && THROW(new Error(`Param Check : Failed at [${index}]`));
    },
    CONDITIONALPARAMCHECK: function(...options) {
        for (const [index, [cond, param]] of options.entries()) cond && void 0 === param && THROW(new Error(`Conditional Param Check : Failed at [${index}]`));
    },
    INVALIDPLAYLIST: function(msg) {
        THROW(new Error(`Invalid Playlist : ${msg}`));
    },
    toNumber,
    hexToByteSequence: function(str) {
        (str.startsWith("0x") || str.startsWith("0X")) && (str = str.slice(2));
        const numArray = [];
        for (let i = 0; i < str.length; i += 2) numArray.push(toNumber(str.slice(i, i + 2), 16));
        return Buffer.from(numArray);
    },
    byteSequenceToHex: function(sequence, start = 0, end = sequence.length) {
        end <= start && THROW(new Error(`end must be larger than start : start=${start}, end=${end}`));
        const array = [];
        for (let i = start; i < end; i++) array.push(`0${(255 & sequence[i]).toString(16).toUpperCase()}`.slice(-2));
        return `0x${array.join("")}`;
    },
    tryCatch: function(body, errorHandler) {
        try {
            return body();
        } catch (err) {
            return errorHandler(err);
        }
    },
    splitAt: function(str, delimiter, index = 0) {
        let lastDelimiterPos = -1;
        for (let i = 0, j = 0; i < str.length; i++) if (str[i] === delimiter) {
            if (j++ === index) return [ str.slice(0, i), str.slice(i + 1) ];
            lastDelimiterPos = i;
        }
        return -1 !== lastDelimiterPos ? [ str.slice(0, lastDelimiterPos), str.slice(lastDelimiterPos + 1) ] : [ str ];
    },
    trim: function(str, char = " ") {
        return str ? (str = str.trim(), " " === char || (str.startsWith(char) && (str = str.slice(1)), 
        str.endsWith(char) && (str = str.slice(0, -1))), str) : str;
    },
    splitByCommaWithPreservingQuotes: function(str) {
        const list = [];
        let doParse = !0, start = 0;
        const prevQuotes = [];
        for (let i = 0; i < str.length; i++) {
            const curr = str[i];
            doParse && "," === curr ? (list.push(str.slice(start, i).trim()), start = i + 1) : '"' !== curr && "'" !== curr || (doParse ? (prevQuotes.push(curr), 
            doParse = !1) : curr === prevQuotes[prevQuotes.length - 1] ? (prevQuotes.pop(), 
            doParse = !0) : prevQuotes.push(curr));
        }
        return list.push(str.slice(start).trim()), list;
    },
    camelify: function(str) {
        const array = [];
        let nextUpper = !1;
        for (const ch of str) "-" !== ch && "_" !== ch ? nextUpper ? (array.push(ch.toUpperCase()), 
        nextUpper = !1) : array.push(ch.toLowerCase()) : nextUpper = !0;
        return array.join("");
    },
    formatDate: function(date) {
        return `${date.getUTCFullYear()}-${("0" + (date.getUTCMonth() + 1)).slice(-2)}-${("0" + date.getUTCDate()).slice(-2)}T${("0" + date.getUTCHours()).slice(-2)}:${("0" + date.getUTCMinutes()).slice(-2)}:${("0" + date.getUTCSeconds()).slice(-2)}.${("00" + date.getUTCMilliseconds()).slice(-3)}Z`;
    },
    hasOwnProp: function(obj, propName) {
        return Object.hasOwnProperty.call(obj, propName);
    },
    setOptions: function(newOptions = {}) {
        options = Object.assign(options, newOptions);
    },
    getOptions: function() {
        return Object.assign({}, options);
    }
};

const utils$2 = utils$3;

class Data {
    constructor(type) {
        utils$2.PARAMCHECK(type), this.type = type;
    }
}

class Playlist extends Data {
    constructor({isMasterPlaylist, uri, version, independentSegments = !1, start, source}) {
        super("playlist"), utils$2.PARAMCHECK(isMasterPlaylist), this.isMasterPlaylist = isMasterPlaylist, 
        this.uri = uri, this.version = version, this.independentSegments = independentSegments, 
        this.start = start, this.source = source;
    }
}

var types$1 = {
    Rendition: class {
        constructor({type, uri, groupId, language, assocLanguage, name, isDefault, autoselect, forced, instreamId, characteristics, channels}) {
            utils$2.PARAMCHECK(type, groupId, name), utils$2.CONDITIONALASSERT([ "SUBTITLES" === type, uri ], [ "CLOSED-CAPTIONS" === type, instreamId ], [ "CLOSED-CAPTIONS" === type, !uri ], [ forced, "SUBTITLES" === type ]), 
            this.type = type, this.uri = uri, this.groupId = groupId, this.language = language, 
            this.assocLanguage = assocLanguage, this.name = name, this.isDefault = isDefault, 
            this.autoselect = autoselect, this.forced = forced, this.instreamId = instreamId, 
            this.characteristics = characteristics, this.channels = channels;
        }
    },
    Variant: class {
        constructor({uri, isIFrameOnly = !1, bandwidth, averageBandwidth, score, codecs, resolution, frameRate, hdcpLevel, allowedCpc, videoRange, stableVariantId, audio = [], video = [], subtitles = [], closedCaptions = [], currentRenditions = {
            audio: 0,
            video: 0,
            subtitles: 0,
            closedCaptions: 0
        }}) {
            utils$2.PARAMCHECK(uri, bandwidth), this.uri = uri, this.isIFrameOnly = isIFrameOnly, 
            this.bandwidth = bandwidth, this.averageBandwidth = averageBandwidth, this.score = score, 
            this.codecs = codecs, this.resolution = resolution, this.frameRate = frameRate, 
            this.hdcpLevel = hdcpLevel, this.allowedCpc = allowedCpc, this.videoRange = videoRange, 
            this.stableVariantId = stableVariantId, this.audio = audio, this.video = video, 
            this.subtitles = subtitles, this.closedCaptions = closedCaptions, this.currentRenditions = currentRenditions;
        }
    },
    SessionData: class {
        constructor({id, value, uri, language}) {
            utils$2.PARAMCHECK(id, value || uri), utils$2.ASSERT("SessionData cannot have both value and uri, shoud be either.", !(value && uri)), 
            this.id = id, this.value = value, this.uri = uri, this.language = language;
        }
    },
    Key: class {
        constructor({method, uri, iv, format, formatVersion}) {
            utils$2.PARAMCHECK(method), utils$2.CONDITIONALPARAMCHECK([ "NONE" !== method, uri ]), 
            utils$2.CONDITIONALASSERT([ "NONE" === method, !(uri || iv || format || formatVersion) ]), 
            this.method = method, this.uri = uri, this.iv = iv, this.format = format, this.formatVersion = formatVersion;
        }
    },
    MediaInitializationSection: class {
        constructor({hint = !1, uri, mimeType, byterange}) {
            utils$2.PARAMCHECK(uri), this.hint = hint, this.uri = uri, this.mimeType = mimeType, 
            this.byterange = byterange;
        }
    },
    DateRange: class {
        constructor({id, classId, start, end, duration, plannedDuration, endOnNext, attributes = {}}) {
            utils$2.PARAMCHECK(id), utils$2.CONDITIONALPARAMCHECK([ !0 === endOnNext, classId ]), 
            utils$2.CONDITIONALASSERT([ end, start ], [ end, start <= end ], [ duration, duration >= 0 ], [ plannedDuration, plannedDuration >= 0 ]), 
            this.id = id, this.classId = classId, this.start = start, this.end = end, this.duration = duration, 
            this.plannedDuration = plannedDuration, this.endOnNext = endOnNext, this.attributes = attributes;
        }
    },
    SpliceInfo: class {
        constructor({type, duration, tagName, value}) {
            utils$2.PARAMCHECK(type), utils$2.CONDITIONALPARAMCHECK([ "OUT" === type, duration ]), 
            utils$2.CONDITIONALPARAMCHECK([ "RAW" === type, tagName ]), this.type = type, this.duration = duration, 
            this.tagName = tagName, this.value = value;
        }
    },
    Playlist,
    MasterPlaylist: class extends Playlist {
        constructor(params = {}) {
            params.isMasterPlaylist = !0, super(params);
            const {variants = [], currentVariant, sessionDataList = [], sessionKeyList = []} = params;
            this.variants = variants, this.currentVariant = currentVariant, this.sessionDataList = sessionDataList, 
            this.sessionKeyList = sessionKeyList;
        }
    },
    MediaPlaylist: class extends Playlist {
        constructor(params = {}) {
            params.isMasterPlaylist = !1, super(params);
            const {targetDuration, mediaSequenceBase = 0, discontinuitySequenceBase = 0, endlist = !1, playlistType, isIFrame, segments = [], prefetchSegments = [], lowLatencyCompatibility, partTargetDuration, renditionReports = [], skip = 0, hash} = params;
            this.targetDuration = targetDuration, this.mediaSequenceBase = mediaSequenceBase, 
            this.discontinuitySequenceBase = discontinuitySequenceBase, this.endlist = endlist, 
            this.playlistType = playlistType, this.isIFrame = isIFrame, this.segments = segments, 
            this.prefetchSegments = prefetchSegments, this.lowLatencyCompatibility = lowLatencyCompatibility, 
            this.partTargetDuration = partTargetDuration, this.renditionReports = renditionReports, 
            this.skip = skip, this.hash = hash;
        }
    },
    Segment: class extends Data {
        constructor({uri, mimeType, data, duration, title, byterange, discontinuity, mediaSequenceNumber = 0, discontinuitySequence = 0, key, map, programDateTime, dateRange, markers = [], parts = []}) {
            super("segment"), this.uri = uri, this.mimeType = mimeType, this.data = data, this.duration = duration, 
            this.title = title, this.byterange = byterange, this.discontinuity = discontinuity, 
            this.mediaSequenceNumber = mediaSequenceNumber, this.discontinuitySequence = discontinuitySequence, 
            this.key = key, this.map = map, this.programDateTime = programDateTime, this.dateRange = dateRange, 
            this.markers = markers, this.parts = parts;
        }
    },
    PartialSegment: class extends Data {
        constructor({hint = !1, uri, duration, independent, byterange, gap}) {
            super("part"), utils$2.PARAMCHECK(uri), this.hint = hint, this.uri = uri, this.duration = duration, 
            this.independent = independent, this.duration = duration, this.byterange = byterange, 
            this.gap = gap;
        }
    },
    PrefetchSegment: class extends Data {
        constructor({uri, discontinuity, mediaSequenceNumber = 0, discontinuitySequence = 0, key}) {
            super("prefetch"), utils$2.PARAMCHECK(uri), this.uri = uri, this.discontinuity = discontinuity, 
            this.mediaSequenceNumber = mediaSequenceNumber, this.discontinuitySequence = discontinuitySequence, 
            this.key = key;
        }
    },
    RenditionReport: class {
        constructor({uri, lastMSN, lastPart}) {
            utils$2.PARAMCHECK(uri), this.uri = uri, this.lastMSN = lastMSN, this.lastPart = lastPart;
        }
    }
};

const utils$1 = utils$3, {Rendition, Variant, SessionData, Key, MediaInitializationSection, DateRange, SpliceInfo, MasterPlaylist, MediaPlaylist, Segment, PartialSegment, PrefetchSegment, RenditionReport} = types$1;

function unquote(str) {
    return utils$1.trim(str, '"');
}

function parseEXTINF(param) {
    const pair = utils$1.splitAt(param, ",");
    return {
        duration: utils$1.toNumber(pair[0]),
        title: decodeURIComponent(escape(pair[1]))
    };
}

function parseBYTERANGE(param) {
    const pair = utils$1.splitAt(param, "@");
    return {
        length: utils$1.toNumber(pair[0]),
        offset: pair[1] ? utils$1.toNumber(pair[1]) : -1
    };
}

function parseResolution$1(str) {
    const pair = utils$1.splitAt(str, "x");
    return {
        width: utils$1.toNumber(pair[0]),
        height: utils$1.toNumber(pair[1])
    };
}

function parseAllowedCpc(str) {
    const message = "ALLOWED-CPC: Each entry must consit of KEYFORMAT and Content Protection Configuration", list = str.split(",");
    0 === list.length && utils$1.INVALIDPLAYLIST(message);
    const allowedCpcList = [];
    for (const item of list) {
        const [format, cpcText] = utils$1.splitAt(item, ":");
        format && cpcText ? allowedCpcList.push({
            format,
            cpcList: cpcText.split("/")
        }) : utils$1.INVALIDPLAYLIST(message);
    }
    return allowedCpcList;
}

function parseIV(str) {
    const iv = utils$1.hexToByteSequence(str);
    return 16 !== iv.length && utils$1.INVALIDPLAYLIST("IV must be a 128-bit unsigned integer"), 
    iv;
}

function setCompatibleVersionOfKey(params, attributes) {
    attributes.IV && params.compatibleVersion < 2 && (params.compatibleVersion = 2), 
    (attributes.KEYFORMAT || attributes.KEYFORMATVERSIONS) && params.compatibleVersion < 5 && (params.compatibleVersion = 5);
}

function parseAttributeList(param) {
    const attributes = {};
    for (const item of utils$1.splitByCommaWithPreservingQuotes(param)) {
        const [key, value] = utils$1.splitAt(item, "="), val = unquote(value);
        switch (key) {
          case "URI":
            attributes[key] = val;
            break;

          case "START-DATE":
          case "END-DATE":
            attributes[key] = new Date(val);
            break;

          case "IV":
            attributes[key] = parseIV(val);
            break;

          case "BYTERANGE":
            attributes[key] = parseBYTERANGE(val);
            break;

          case "RESOLUTION":
            attributes[key] = parseResolution$1(val);
            break;

          case "ALLOWED-CPC":
            attributes[key] = parseAllowedCpc(val);
            break;

          case "END-ON-NEXT":
          case "DEFAULT":
          case "AUTOSELECT":
          case "FORCED":
          case "PRECISE":
          case "CAN-BLOCK-RELOAD":
          case "INDEPENDENT":
          case "GAP":
            attributes[key] = "YES" === val;
            break;

          case "DURATION":
          case "PLANNED-DURATION":
          case "BANDWIDTH":
          case "AVERAGE-BANDWIDTH":
          case "FRAME-RATE":
          case "TIME-OFFSET":
          case "CAN-SKIP-UNTIL":
          case "HOLD-BACK":
          case "PART-HOLD-BACK":
          case "PART-TARGET":
          case "BYTERANGE-START":
          case "BYTERANGE-LENGTH":
          case "LAST-MSN":
          case "LAST-PART":
          case "SKIPPED-SEGMENTS":
          case "SCORE":
            attributes[key] = utils$1.toNumber(val);
            break;

          default:
            key.startsWith("SCTE35-") ? attributes[key] = utils$1.hexToByteSequence(val) : key.startsWith("X-") ? attributes[key] = (str = value).startsWith('"') ? unquote(str) : str.startsWith("0x") || str.startsWith("0X") ? utils$1.hexToByteSequence(str) : utils$1.toNumber(str) : ("VIDEO-RANGE" === key && "SDR" !== val && "HLG" !== val && "PQ" !== val && utils$1.INVALIDPLAYLIST(`VIDEO-RANGE: unknown value "${val}"`), 
            attributes[key] = val);
        }
    }
    var str;
    return attributes;
}

function MIXEDTAGS() {
    utils$1.INVALIDPLAYLIST("The file contains both media and master playlist tags.");
}

function addRendition(variant, line, type) {
    const rendition = function({attributes}) {
        return new Rendition({
            type: attributes.TYPE,
            uri: attributes.URI,
            groupId: attributes["GROUP-ID"],
            language: attributes.LANGUAGE,
            assocLanguage: attributes["ASSOC-LANGUAGE"],
            name: attributes.NAME,
            isDefault: attributes.DEFAULT,
            autoselect: attributes.AUTOSELECT,
            forced: attributes.FORCED,
            instreamId: attributes["INSTREAM-ID"],
            characteristics: attributes.CHARACTERISTICS,
            channels: attributes.CHANNELS
        });
    }(line), renditions = variant[utils$1.camelify(type)], errorMessage = function(renditions, rendition) {
        let defaultFound = !1;
        for (const item of renditions) {
            if (item.name === rendition.name) return "All EXT-X-MEDIA tags in the same Group MUST have different NAME attributes.";
            item.isDefault && (defaultFound = !0);
        }
        return defaultFound && rendition.isDefault ? "EXT-X-MEDIA A Group MUST NOT have more than one member with a DEFAULT attribute of YES." : "";
    }(renditions, rendition);
    errorMessage && utils$1.INVALIDPLAYLIST(errorMessage), renditions.push(rendition), 
    rendition.isDefault && (variant.currentRenditions[utils$1.camelify(type)] = renditions.length - 1);
}

function parseVariant(lines, variantAttrs, uri, iFrameOnly, params) {
    const variant = new Variant({
        uri,
        bandwidth: variantAttrs.BANDWIDTH,
        averageBandwidth: variantAttrs["AVERAGE-BANDWIDTH"],
        score: variantAttrs.SCORE,
        codecs: variantAttrs.CODECS,
        resolution: variantAttrs.RESOLUTION,
        frameRate: variantAttrs["FRAME-RATE"],
        hdcpLevel: variantAttrs["HDCP-LEVEL"],
        allowedCpc: variantAttrs["ALLOWED-CPC"],
        videoRange: variantAttrs["VIDEO-RANGE"],
        stableVariantId: variantAttrs["STABLE-VARIANT-ID"]
    });
    for (const line of lines) if ("EXT-X-MEDIA" === line.name) {
        const renditionAttrs = line.attributes, renditionType = renditionAttrs.TYPE;
        if (renditionType && renditionAttrs["GROUP-ID"] || utils$1.INVALIDPLAYLIST("EXT-X-MEDIA TYPE attribute is REQUIRED."), 
        variantAttrs[renditionType] === renditionAttrs["GROUP-ID"] && (addRendition(variant, line, renditionType), 
        "CLOSED-CAPTIONS" === renditionType)) for (const {instreamId} of variant.closedCaptions) if (instreamId && instreamId.startsWith("SERVICE") && params.compatibleVersion < 7) {
            params.compatibleVersion = 7;
            break;
        }
    }
    return function(attrs, variant, params) {
        for (const type of [ "AUDIO", "VIDEO", "SUBTITLES", "CLOSED-CAPTIONS" ]) "CLOSED-CAPTIONS" === type && "NONE" === attrs[type] ? (params.isClosedCaptionsNone = !0, 
        variant.closedCaptions = []) : attrs[type] && !variant[utils$1.camelify(type)].some((item => item.groupId === attrs[type])) && utils$1.INVALIDPLAYLIST(`${type} attribute MUST match the value of the GROUP-ID attribute of an EXT-X-MEDIA tag whose TYPE attribute is ${type}.`);
    }(variantAttrs, variant, params), variant.isIFrameOnly = iFrameOnly, variant;
}

function sameKey(key1, key2) {
    if (key1.method !== key2.method) return !1;
    if (key1.uri !== key2.uri) return !1;
    if (key1.iv) {
        if (!key2.iv) return !1;
        if (key1.iv.length !== key2.iv.length) return !1;
        for (let i = 0; i < key1.iv.length; i++) if (key1.iv[i] !== key2.iv[i]) return !1;
    } else if (key2.iv) return !1;
    return key1.format === key2.format && key1.formatVersion === key2.formatVersion;
}

function parseSegment(lines, uri, start, end, mediaSequenceNumber, discontinuitySequence, params) {
    const segment = new Segment({
        uri,
        mediaSequenceNumber,
        discontinuitySequence
    });
    let mapHint = !1, partHint = !1;
    for (let i = start; i <= end; i++) {
        const {name, value, attributes} = lines[i];
        if ("EXTINF" === name) !Number.isInteger(value.duration) && params.compatibleVersion < 3 && (params.compatibleVersion = 3), 
        Math.round(value.duration) > params.targetDuration && utils$1.INVALIDPLAYLIST("EXTINF duration, when rounded to the nearest integer, MUST be less than or equal to the target duration"), 
        segment.duration = value.duration, segment.title = value.title; else if ("EXT-X-BYTERANGE" === name) params.compatibleVersion < 4 && (params.compatibleVersion = 4), 
        segment.byterange = value; else if ("EXT-X-DISCONTINUITY" === name) segment.parts.length > 0 && utils$1.INVALIDPLAYLIST("EXT-X-DISCONTINUITY must appear before the first EXT-X-PART tag of the Parent Segment."), 
        segment.discontinuity = !0; else if ("EXT-X-KEY" === name) segment.parts.length > 0 && utils$1.INVALIDPLAYLIST("EXT-X-KEY must appear before the first EXT-X-PART tag of the Parent Segment."), 
        setCompatibleVersionOfKey(params, attributes), segment.key = new Key({
            method: attributes.METHOD,
            uri: attributes.URI,
            iv: attributes.IV,
            format: attributes.KEYFORMAT,
            formatVersion: attributes.KEYFORMATVERSIONS
        }); else if ("EXT-X-MAP" === name) segment.parts.length > 0 && utils$1.INVALIDPLAYLIST("EXT-X-MAP must appear before the first EXT-X-PART tag of the Parent Segment."), 
        params.compatibleVersion < 5 && (params.compatibleVersion = 5), params.hasMap = !0, 
        segment.map = new MediaInitializationSection({
            uri: attributes.URI,
            byterange: attributes.BYTERANGE
        }); else if ("EXT-X-PROGRAM-DATE-TIME" === name) segment.programDateTime = value; else if ("EXT-X-DATERANGE" === name) {
            const attrs = {};
            for (const key of Object.keys(attributes)) (key.startsWith("SCTE35-") || key.startsWith("X-")) && (attrs[key] = attributes[key]);
            segment.dateRange = new DateRange({
                id: attributes.ID,
                classId: attributes.CLASS,
                start: attributes["START-DATE"],
                end: attributes["END-DATE"],
                duration: attributes.DURATION,
                plannedDuration: attributes["PLANNED-DURATION"],
                endOnNext: attributes["END-ON-NEXT"],
                attributes: attrs
            });
        } else if ("EXT-X-CUE-OUT" === name) segment.markers.push(new SpliceInfo({
            type: "OUT",
            duration: attributes && attributes.DURATION || value
        })); else if ("EXT-X-CUE-IN" === name) segment.markers.push(new SpliceInfo({
            type: "IN"
        })); else if ("EXT-X-CUE-OUT-CONT" === name || "EXT-X-CUE" === name || "EXT-OATCLS-SCTE35" === name || "EXT-X-ASSET" === name || "EXT-X-SCTE35" === name) segment.markers.push(new SpliceInfo({
            type: "RAW",
            tagName: name,
            value
        })); else if ("EXT-X-PRELOAD-HINT" !== name || attributes.TYPE) if ("EXT-X-PRELOAD-HINT" === name && "PART" === attributes.TYPE && partHint) utils$1.INVALIDPLAYLIST("Servers should not add more than one EXT-X-PRELOAD-HINT tag with the same TYPE attribute to a Playlist."); else if ("EXT-X-PART" !== name && "EXT-X-PRELOAD-HINT" !== name || attributes.URI) {
            if ("EXT-X-PRELOAD-HINT" === name && "MAP" === attributes.TYPE) mapHint && utils$1.INVALIDPLAYLIST("Servers should not add more than one EXT-X-PRELOAD-HINT tag with the same TYPE attribute to a Playlist."), 
            mapHint = !0, params.hasMap = !0, segment.map = new MediaInitializationSection({
                hint: !0,
                uri: attributes.URI,
                byterange: {
                    length: attributes["BYTERANGE-LENGTH"],
                    offset: attributes["BYTERANGE-START"] || 0
                }
            }); else if ("EXT-X-PART" === name || "EXT-X-PRELOAD-HINT" === name && "PART" === attributes.TYPE) {
                "EXT-X-PART" !== name || attributes.DURATION || utils$1.INVALIDPLAYLIST("EXT-X-PART: DURATION attribute is mandatory"), 
                "EXT-X-PRELOAD-HINT" === name && (partHint = !0);
                const partialSegment = new PartialSegment({
                    hint: "EXT-X-PRELOAD-HINT" === name,
                    uri: attributes.URI,
                    byterange: "EXT-X-PART" === name ? attributes.BYTERANGE : {
                        length: attributes["BYTERANGE-LENGTH"],
                        offset: attributes["BYTERANGE-START"] || 0
                    },
                    duration: attributes.DURATION,
                    independent: attributes.INDEPENDENT,
                    gap: attributes.GAP
                });
                segment.parts.push(partialSegment);
            }
        } else utils$1.INVALIDPLAYLIST("EXT-X-PART / EXT-X-PRELOAD-HINT: URI attribute is mandatory"); else utils$1.INVALIDPLAYLIST("EXT-X-PRELOAD-HINT: TYPE attribute is mandatory");
    }
    return segment;
}

function parsePrefetchSegment(lines, uri, start, end, mediaSequenceNumber, discontinuitySequence, params) {
    const segment = new PrefetchSegment({
        uri,
        mediaSequenceNumber,
        discontinuitySequence
    });
    for (let i = start; i <= end; i++) {
        const {name, attributes} = lines[i];
        "EXTINF" === name ? utils$1.INVALIDPLAYLIST("A prefetch segment must not be advertised with an EXTINF tag.") : "EXT-X-DISCONTINUITY" === name ? utils$1.INVALIDPLAYLIST("A prefetch segment must not be advertised with an EXT-X-DISCONTINUITY tag.") : "EXT-X-PREFETCH-DISCONTINUITY" === name ? segment.discontinuity = !0 : "EXT-X-KEY" === name ? (setCompatibleVersionOfKey(params, attributes), 
        segment.key = new Key({
            method: attributes.METHOD,
            uri: attributes.URI,
            iv: attributes.IV,
            format: attributes.KEYFORMAT,
            formatVersion: attributes.KEYFORMATVERSIONS
        })) : "EXT-X-MAP" === name && utils$1.INVALIDPLAYLIST("Prefetch segments must not be advertised with an EXT-X-MAP tag.");
    }
    return segment;
}

function parseMediaPlaylist(lines, params) {
    const playlist = new MediaPlaylist;
    let segmentStart = -1, mediaSequence = 0, discontinuityFound = !1, prefetchFound = !1, discontinuitySequence = 0, currentKey = null, currentMap = null, containsParts = !1;
    for (const [index, line] of lines.entries()) {
        const {name, value, attributes, category} = line;
        if ("Segment" !== category) {
            if ("EXT-X-VERSION" === name) void 0 === playlist.version ? playlist.version = value : utils$1.INVALIDPLAYLIST("A Playlist file MUST NOT contain more than one EXT-X-VERSION tag."); else if ("EXT-X-TARGETDURATION" === name) playlist.targetDuration = params.targetDuration = value; else if ("EXT-X-MEDIA-SEQUENCE" === name) playlist.segments.length > 0 && utils$1.INVALIDPLAYLIST("The EXT-X-MEDIA-SEQUENCE tag MUST appear before the first Media Segment in the Playlist."), 
            playlist.mediaSequenceBase = mediaSequence = value; else if ("EXT-X-DISCONTINUITY-SEQUENCE" === name) playlist.segments.length > 0 && utils$1.INVALIDPLAYLIST("The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first Media Segment in the Playlist."), 
            discontinuityFound && utils$1.INVALIDPLAYLIST("The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-X-DISCONTINUITY tag."), 
            playlist.discontinuitySequenceBase = discontinuitySequence = value; else if ("EXT-X-ENDLIST" === name) playlist.endlist = !0; else if ("EXT-X-PLAYLIST-TYPE" === name) playlist.playlistType = value; else if ("EXT-X-I-FRAMES-ONLY" === name) params.compatibleVersion < 4 && (params.compatibleVersion = 4), 
            playlist.isIFrame = !0; else if ("EXT-X-INDEPENDENT-SEGMENTS" === name) playlist.independentSegments && utils$1.INVALIDPLAYLIST("EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once in a Playlist"), 
            playlist.independentSegments = !0; else if ("EXT-X-START" === name) playlist.start && utils$1.INVALIDPLAYLIST("EXT-X-START tag MUST NOT appear more than once in a Playlist"), 
            "number" != typeof attributes["TIME-OFFSET"] && utils$1.INVALIDPLAYLIST("EXT-X-START: TIME-OFFSET attribute is REQUIRED"), 
            playlist.start = {
                offset: attributes["TIME-OFFSET"],
                precise: attributes.PRECISE || !1
            }; else if ("EXT-X-SERVER-CONTROL" === name) attributes["CAN-BLOCK-RELOAD"] || utils$1.INVALIDPLAYLIST("EXT-X-SERVER-CONTROL: CAN-BLOCK-RELOAD=YES is mandatory for Low-Latency HLS"), 
            playlist.lowLatencyCompatibility = {
                canBlockReload: attributes["CAN-BLOCK-RELOAD"],
                canSkipUntil: attributes["CAN-SKIP-UNTIL"],
                holdBack: attributes["HOLD-BACK"],
                partHoldBack: attributes["PART-HOLD-BACK"]
            }; else if ("EXT-X-PART-INF" === name) attributes["PART-TARGET"] || utils$1.INVALIDPLAYLIST("EXT-X-PART-INF: PART-TARGET attribute is mandatory"), 
            playlist.partTargetDuration = attributes["PART-TARGET"]; else if ("EXT-X-RENDITION-REPORT" === name) attributes.URI || utils$1.INVALIDPLAYLIST("EXT-X-RENDITION-REPORT: URI attribute is mandatory"), 
            0 === attributes.URI.search(/^[a-z]+:/) && utils$1.INVALIDPLAYLIST("EXT-X-RENDITION-REPORT: URI must be relative to the playlist uri"), 
            playlist.renditionReports.push(new RenditionReport({
                uri: attributes.URI,
                lastMSN: attributes["LAST-MSN"],
                lastPart: attributes["LAST-PART"]
            })); else if ("EXT-X-SKIP" === name) attributes["SKIPPED-SEGMENTS"] || utils$1.INVALIDPLAYLIST("EXT-X-SKIP: SKIPPED-SEGMENTS attribute is mandatory"), 
            params.compatibleVersion < 9 && (params.compatibleVersion = 9), playlist.skip = attributes["SKIPPED-SEGMENTS"], 
            mediaSequence += playlist.skip; else if ("EXT-X-PREFETCH" === name) {
                const segment = parsePrefetchSegment(lines, value, -1 === segmentStart ? index : segmentStart, index - 1, mediaSequence++, discontinuitySequence, params);
                segment && (segment.discontinuity && (segment.discontinuitySequence++, discontinuitySequence = segment.discontinuitySequence), 
                segment.key ? currentKey = segment.key : segment.key = currentKey, playlist.prefetchSegments.push(segment)), 
                prefetchFound = !0, segmentStart = -1;
            } else if ("string" == typeof line) {
                -1 === segmentStart && utils$1.INVALIDPLAYLIST("A URI line is not preceded by any segment tags"), 
                playlist.targetDuration || utils$1.INVALIDPLAYLIST("The EXT-X-TARGETDURATION tag is REQUIRED"), 
                prefetchFound && utils$1.INVALIDPLAYLIST("These segments must appear after all complete segments.");
                const segment = parseSegment(lines, line, segmentStart, index - 1, mediaSequence++, discontinuitySequence, params);
                segment && ([discontinuitySequence, currentKey, currentMap] = addSegment(playlist, segment, discontinuitySequence, currentKey, currentMap), 
                !containsParts && segment.parts.length > 0 && (containsParts = !0)), segmentStart = -1;
            }
        } else -1 === segmentStart && (segmentStart = index), "EXT-X-DISCONTINUITY" === name && (discontinuityFound = !0);
    }
    if (-1 !== segmentStart) {
        const segment = parseSegment(lines, "", segmentStart, lines.length - 1, mediaSequence++, discontinuitySequence, params);
        if (segment) {
            const {parts} = segment;
            parts.length > 0 && !playlist.endlist && !parts[parts.length - 1].hint && utils$1.INVALIDPLAYLIST("If the Playlist contains EXT-X-PART tags and does not contain an EXT-X-ENDLIST tag, the Playlist must contain an EXT-X-PRELOAD-HINT tag with a TYPE=PART attribute"), 
            addSegment(playlist, segment, currentKey, currentMap), !containsParts && segment.parts.length > 0 && (containsParts = !0);
        }
    }
    return function(segments) {
        const earliestDates = new Map, rangeList = new Map;
        let hasDateRange = !1, hasProgramDateTime = !1;
        for (let i = segments.length - 1; i >= 0; i--) {
            const {programDateTime, dateRange} = segments[i];
            if (programDateTime && (hasProgramDateTime = !0), dateRange && dateRange.start) {
                hasDateRange = !0, dateRange.endOnNext && (dateRange.end || dateRange.duration) && utils$1.INVALIDPLAYLIST("An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST NOT contain DURATION or END-DATE attributes.");
                const start = dateRange.start.getTime(), duration = dateRange.duration || 0;
                dateRange.end && dateRange.duration && start + 1e3 * duration !== dateRange.end.getTime() && utils$1.INVALIDPLAYLIST("END-DATE MUST be equal to the value of the START-DATE attribute plus the value of the DURATION"), 
                dateRange.endOnNext && (dateRange.end = earliestDates.get(dateRange.classId)), earliestDates.set(dateRange.classId, dateRange.start);
                const end = dateRange.end ? dateRange.end.getTime() : dateRange.start.getTime() + 1e3 * (dateRange.duration || 0), range = rangeList.get(dateRange.classId);
                if (range) {
                    for (const entry of range) (entry.start <= start && entry.end > start || entry.start >= start && entry.start < end) && utils$1.INVALIDPLAYLIST("DATERANGE tags with the same CLASS should not overlap");
                    range.push({
                        start,
                        end
                    });
                } else rangeList.set(dateRange.classId, [ {
                    start,
                    end
                } ]);
            }
        }
        hasDateRange && !hasProgramDateTime && utils$1.INVALIDPLAYLIST("If a Playlist contains an EXT-X-DATERANGE tag, it MUST also contain at least one EXT-X-PROGRAM-DATE-TIME tag.");
    }(playlist.segments), playlist.lowLatencyCompatibility && function({lowLatencyCompatibility, targetDuration, partTargetDuration, segments, renditionReports}, containsParts) {
        const {canSkipUntil, holdBack, partHoldBack} = lowLatencyCompatibility;
        canSkipUntil < 6 * targetDuration && utils$1.INVALIDPLAYLIST("The Skip Boundary must be at least six times the EXT-X-TARGETDURATION.");
        holdBack < 3 * targetDuration && utils$1.INVALIDPLAYLIST("HOLD-BACK must be at least three times the EXT-X-TARGETDURATION.");
        if (containsParts) {
            void 0 === partTargetDuration && utils$1.INVALIDPLAYLIST("EXT-X-PART-INF is required if a Playlist contains one or more EXT-X-PART tags"), 
            void 0 === partHoldBack && utils$1.INVALIDPLAYLIST("EXT-X-PART: PART-HOLD-BACK attribute is mandatory"), 
            partHoldBack < partTargetDuration && utils$1.INVALIDPLAYLIST("PART-HOLD-BACK must be at least PART-TARGET");
            for (const [segmentIndex, {parts}] of segments.entries()) {
                parts.length > 0 && segmentIndex < segments.length - 3 && utils$1.INVALIDPLAYLIST("Remove EXT-X-PART tags from the Playlist after they are greater than three target durations from the end of the Playlist.");
                for (const [partIndex, {duration}] of parts.entries()) void 0 !== duration && (duration > partTargetDuration && utils$1.INVALIDPLAYLIST("PART-TARGET is the maximum duration of any Partial Segment"), 
                partIndex < parts.length - 1 && duration < .85 * partTargetDuration && utils$1.INVALIDPLAYLIST("All Partial Segments except the last part of a segment must have a duration of at least 85% of PART-TARGET"));
            }
        }
        for (const report of renditionReports) {
            const lastSegment = segments[segments.length - 1];
            null !== report.lastMSN && void 0 !== report.lastMSN || (report.lastMSN = lastSegment.mediaSequenceNumber), 
            (null === report.lastPart || void 0 === report.lastPart) && lastSegment.parts.length > 0 && (report.lastPart = lastSegment.parts.length - 1);
        }
    }(playlist, containsParts), playlist;
}

function addSegment(playlist, segment, discontinuitySequence, currentKey, currentMap) {
    const {discontinuity, key, map, byterange, uri} = segment;
    if (discontinuity && (segment.discontinuitySequence = discontinuitySequence + 1), 
    key || (segment.key = currentKey), map || (segment.map = currentMap), byterange && -1 === byterange.offset) {
        const {segments} = playlist;
        if (segments.length > 0) {
            const prevSegment = segments[segments.length - 1];
            prevSegment.byterange && prevSegment.uri === uri ? byterange.offset = prevSegment.byterange.offset + prevSegment.byterange.length : utils$1.INVALIDPLAYLIST("If offset of EXT-X-BYTERANGE is not present, a previous Media Segment MUST be a sub-range of the same media resource");
        } else utils$1.INVALIDPLAYLIST("If offset of EXT-X-BYTERANGE is not present, a previous Media Segment MUST appear in the Playlist file");
    }
    return playlist.segments.push(segment), [ segment.discontinuitySequence, segment.key, segment.map ];
}

function parseTag(line, params) {
    const [name, param] = function(line) {
        const index = line.indexOf(":");
        return -1 === index ? [ line.slice(1).trim(), null ] : [ line.slice(1, index).trim(), line.slice(index + 1).trim() ];
    }(line), category = function(tagName) {
        switch (tagName) {
          case "EXTM3U":
          case "EXT-X-VERSION":
            return "Basic";

          case "EXTINF":
          case "EXT-X-BYTERANGE":
          case "EXT-X-DISCONTINUITY":
          case "EXT-X-PREFETCH-DISCONTINUITY":
          case "EXT-X-KEY":
          case "EXT-X-MAP":
          case "EXT-X-PROGRAM-DATE-TIME":
          case "EXT-X-DATERANGE":
          case "EXT-X-CUE-OUT":
          case "EXT-X-CUE-IN":
          case "EXT-X-CUE-OUT-CONT":
          case "EXT-X-CUE":
          case "EXT-OATCLS-SCTE35":
          case "EXT-X-ASSET":
          case "EXT-X-SCTE35":
          case "EXT-X-PART":
          case "EXT-X-PRELOAD-HINT":
            return "Segment";

          case "EXT-X-TARGETDURATION":
          case "EXT-X-MEDIA-SEQUENCE":
          case "EXT-X-DISCONTINUITY-SEQUENCE":
          case "EXT-X-ENDLIST":
          case "EXT-X-PLAYLIST-TYPE":
          case "EXT-X-I-FRAMES-ONLY":
          case "EXT-X-SERVER-CONTROL":
          case "EXT-X-PART-INF":
          case "EXT-X-PREFETCH":
          case "EXT-X-RENDITION-REPORT":
          case "EXT-X-SKIP":
            return "MediaPlaylist";

          case "EXT-X-MEDIA":
          case "EXT-X-STREAM-INF":
          case "EXT-X-I-FRAME-STREAM-INF":
          case "EXT-X-SESSION-DATA":
          case "EXT-X-SESSION-KEY":
            return "MasterPlaylist";

          case "EXT-X-INDEPENDENT-SEGMENTS":
          case "EXT-X-START":
            return "MediaorMasterPlaylist";

          default:
            return "Unknown";
        }
    }(name);
    if (function(category, params) {
        if ("Segment" === category || "MediaPlaylist" === category) return void 0 === params.isMasterPlaylist ? void (params.isMasterPlaylist = !1) : void (params.isMasterPlaylist && MIXEDTAGS());
        if ("MasterPlaylist" === category) {
            if (void 0 === params.isMasterPlaylist) return void (params.isMasterPlaylist = !0);
            !1 === params.isMasterPlaylist && MIXEDTAGS();
        }
    }(category, params), "Unknown" === category) return null;
    "MediaPlaylist" === category && "EXT-X-RENDITION-REPORT" !== name && "EXT-X-PREFETCH" !== name && (params.hash[name] && utils$1.INVALIDPLAYLIST("There MUST NOT be more than one Media Playlist tag of each type in any Media Playlist"), 
    params.hash[name] = !0);
    const [value, attributes] = function(name, param) {
        switch (name) {
          case "EXTM3U":
          case "EXT-X-DISCONTINUITY":
          case "EXT-X-ENDLIST":
          case "EXT-X-I-FRAMES-ONLY":
          case "EXT-X-INDEPENDENT-SEGMENTS":
          case "EXT-X-CUE-IN":
            return [ null, null ];

          case "EXT-X-VERSION":
          case "EXT-X-TARGETDURATION":
          case "EXT-X-MEDIA-SEQUENCE":
          case "EXT-X-DISCONTINUITY-SEQUENCE":
            return [ utils$1.toNumber(param), null ];

          case "EXT-X-CUE-OUT":
            return Number.isNaN(Number(param)) ? [ null, parseAttributeList(param) ] : [ utils$1.toNumber(param), null ];

          case "EXT-X-KEY":
          case "EXT-X-MAP":
          case "EXT-X-DATERANGE":
          case "EXT-X-MEDIA":
          case "EXT-X-STREAM-INF":
          case "EXT-X-I-FRAME-STREAM-INF":
          case "EXT-X-SESSION-DATA":
          case "EXT-X-SESSION-KEY":
          case "EXT-X-START":
          case "EXT-X-SERVER-CONTROL":
          case "EXT-X-PART-INF":
          case "EXT-X-PART":
          case "EXT-X-PRELOAD-HINT":
          case "EXT-X-RENDITION-REPORT":
          case "EXT-X-SKIP":
            return [ null, parseAttributeList(param) ];

          case "EXTINF":
            return [ parseEXTINF(param), null ];

          case "EXT-X-BYTERANGE":
            return [ parseBYTERANGE(param), null ];

          case "EXT-X-PROGRAM-DATE-TIME":
            return [ new Date(param), null ];

          default:
            return [ param, null ];
        }
    }(name, param);
    return {
        name,
        category,
        value,
        attributes
    };
}

function semanticParse(lines, params) {
    let playlist;
    return params.isMasterPlaylist ? playlist = function(lines, params) {
        const playlist = new MasterPlaylist;
        let variantIsScored = !1;
        for (const [index, {name, value, attributes}] of lines.entries()) if ("EXT-X-VERSION" === name) playlist.version = value; else if ("EXT-X-STREAM-INF" === name) {
            const uri = lines[index + 1];
            ("string" != typeof uri || uri.startsWith("#EXT")) && utils$1.INVALIDPLAYLIST("EXT-X-STREAM-INF must be followed by a URI line");
            const variant = parseVariant(lines, attributes, uri, !1, params);
            variant && ("number" == typeof variant.score && (variantIsScored = !0, variant.score < 0 && utils$1.INVALIDPLAYLIST("SCORE attribute on EXT-X-STREAM-INF must be positive decimal-floating-point number.")), 
            playlist.variants.push(variant));
        } else if ("EXT-X-I-FRAME-STREAM-INF" === name) {
            const variant = parseVariant(lines, attributes, attributes.URI, !0, params);
            variant && playlist.variants.push(variant);
        } else if ("EXT-X-SESSION-DATA" === name) {
            const sessionData = new SessionData({
                id: attributes["DATA-ID"],
                value: attributes.VALUE,
                uri: attributes.URI,
                language: attributes.LANGUAGE
            });
            playlist.sessionDataList.some((item => item.id === sessionData.id && item.language === sessionData.language)) && utils$1.INVALIDPLAYLIST("A Playlist MUST NOT contain more than one EXT-X-SESSION-DATA tag with the same DATA-ID attribute and the same LANGUAGE attribute."), 
            playlist.sessionDataList.push(sessionData);
        } else if ("EXT-X-SESSION-KEY" === name) {
            "NONE" === attributes.METHOD && utils$1.INVALIDPLAYLIST("EXT-X-SESSION-KEY: The value of the METHOD attribute MUST NOT be NONE");
            const sessionKey = new Key({
                method: attributes.METHOD,
                uri: attributes.URI,
                iv: attributes.IV,
                format: attributes.KEYFORMAT,
                formatVersion: attributes.KEYFORMATVERSIONS
            });
            playlist.sessionKeyList.some((item => sameKey(item, sessionKey))) && utils$1.INVALIDPLAYLIST("A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS attribute values."), 
            setCompatibleVersionOfKey(params, attributes), playlist.sessionKeyList.push(sessionKey);
        } else "EXT-X-INDEPENDENT-SEGMENTS" === name ? (playlist.independentSegments && utils$1.INVALIDPLAYLIST("EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once in a Playlist"), 
        playlist.independentSegments = !0) : "EXT-X-START" === name && (playlist.start && utils$1.INVALIDPLAYLIST("EXT-X-START tag MUST NOT appear more than once in a Playlist"), 
        "number" != typeof attributes["TIME-OFFSET"] && utils$1.INVALIDPLAYLIST("EXT-X-START: TIME-OFFSET attribute is REQUIRED"), 
        playlist.start = {
            offset: attributes["TIME-OFFSET"],
            precise: attributes.PRECISE || !1
        });
        if (variantIsScored) for (const variant of playlist.variants) "number" != typeof variant.score && utils$1.INVALIDPLAYLIST("If any Variant Stream contains the SCORE attribute, then all Variant Streams in the Master Playlist SHOULD have a SCORE attribute");
        if (params.isClosedCaptionsNone) for (const variant of playlist.variants) variant.closedCaptions.length > 0 && utils$1.INVALIDPLAYLIST("If there is a variant with CLOSED-CAPTIONS attribute of NONE, all EXT-X-STREAM-INF tags MUST have this attribute with a value of NONE");
        return playlist;
    }(lines, params) : (playlist = parseMediaPlaylist(lines, params), !playlist.isIFrame && params.hasMap && params.compatibleVersion < 6 && (params.compatibleVersion = 6)), 
    params.compatibleVersion > 1 && (!playlist.version || playlist.version < params.compatibleVersion) && utils$1.INVALIDPLAYLIST(`EXT-X-VERSION needs to be ${params.compatibleVersion} or higher.`), 
    playlist;
}

var parse_1 = function(text) {
    const params = {
        version: void 0,
        isMasterPlaylist: void 0,
        hasMap: !1,
        targetDuration: 0,
        compatibleVersion: 1,
        isClosedCaptionsNone: !1,
        hash: {}
    }, playlist = semanticParse(function(text, params) {
        const lines = [];
        for (const l of text.split("\n")) {
            const line = Buffer.from(l.trim()).toString();
            if (line) if (line.startsWith("#")) {
                if (line.startsWith("#EXT")) {
                    const tag = parseTag(line, params);
                    tag && lines.push(tag);
                }
            } else lines.push(line);
        }
        return 0 !== lines.length && "EXTM3U" === lines[0].name || utils$1.INVALIDPLAYLIST("The EXTM3U tag MUST be the first line."), 
        lines;
    }(text, params), params);
    return playlist.source = text, playlist;
};

const utils = utils$3, ALLOW_REDUNDANCY = [ "#EXTINF", "#EXT-X-BYTERANGE", "#EXT-X-DISCONTINUITY", "#EXT-X-STREAM-INF", "#EXT-X-CUE-OUT", "#EXT-X-CUE-IN", "#EXT-X-KEY", "#EXT-X-MAP" ], SKIP_IF_REDUNDANT = [ "#EXT-X-MEDIA" ];

class LineArray extends Array {
    constructor(baseUri) {
        super(), this.baseUri = baseUri;
    }
    push(...elems) {
        for (const elem of elems) if (elem.startsWith("#")) if (ALLOW_REDUNDANCY.some((item => elem.startsWith(item)))) super.push(elem); else {
            if (this.includes(elem)) {
                if (SKIP_IF_REDUNDANT.some((item => elem.startsWith(item)))) continue;
                utils.INVALIDPLAYLIST(`Redundant item (${elem})`);
            }
            super.push(elem);
        } else super.push(elem);
    }
}

function buildDecimalFloatingNumber(num, fixed) {
    let roundFactor = 1e3;
    fixed && (roundFactor = 10 ** fixed);
    const rounded = Math.round(num * roundFactor) / roundFactor;
    return fixed ? rounded.toFixed(fixed) : rounded;
}

function buildSessionData(sessionData) {
    const attrs = [ `DATA-ID="${sessionData.id}"` ];
    return sessionData.language && attrs.push(`LANGUAGE="${sessionData.language}"`), 
    sessionData.value ? attrs.push(`VALUE="${sessionData.value}"`) : sessionData.uri && attrs.push(`URI="${sessionData.uri}"`), 
    `#EXT-X-SESSION-DATA:${attrs.join(",")}`;
}

function buildKey(key, isSessionKey) {
    const name = isSessionKey ? "#EXT-X-SESSION-KEY" : "#EXT-X-KEY", attrs = [ `METHOD=${key.method}` ];
    return key.uri && attrs.push(`URI="${key.uri}"`), key.iv && (16 !== key.iv.length && utils.INVALIDPLAYLIST("IV must be a 128-bit unsigned integer"), 
    attrs.push(`IV=${utils.byteSequenceToHex(key.iv)}`)), key.format && attrs.push(`KEYFORMAT="${key.format}"`), 
    key.formatVersion && attrs.push(`KEYFORMATVERSIONS="${key.formatVersion}"`), `${name}:${attrs.join(",")}`;
}

function buildVariant(lines, variant) {
    const name = variant.isIFrameOnly ? "#EXT-X-I-FRAME-STREAM-INF" : "#EXT-X-STREAM-INF", attrs = [ `BANDWIDTH=${variant.bandwidth}` ];
    if (variant.averageBandwidth && attrs.push(`AVERAGE-BANDWIDTH=${variant.averageBandwidth}`), 
    variant.isIFrameOnly && attrs.push(`URI="${variant.uri}"`), variant.codecs && attrs.push(`CODECS="${variant.codecs}"`), 
    variant.resolution && attrs.push(`RESOLUTION=${variant.resolution.width}x${variant.resolution.height}`), 
    variant.frameRate && attrs.push(`FRAME-RATE=${buildDecimalFloatingNumber(variant.frameRate, 3)}`), 
    variant.hdcpLevel && attrs.push(`HDCP-LEVEL=${variant.hdcpLevel}`), variant.audio.length > 0) {
        attrs.push(`AUDIO="${variant.audio[0].groupId}"`);
        for (const rendition of variant.audio) lines.push(buildRendition(rendition));
    }
    if (variant.video.length > 0) {
        attrs.push(`VIDEO="${variant.video[0].groupId}"`);
        for (const rendition of variant.video) lines.push(buildRendition(rendition));
    }
    if (variant.subtitles.length > 0) {
        attrs.push(`SUBTITLES="${variant.subtitles[0].groupId}"`);
        for (const rendition of variant.subtitles) lines.push(buildRendition(rendition));
    }
    if (utils.getOptions().allowClosedCaptionsNone && 0 === variant.closedCaptions.length) attrs.push("CLOSED-CAPTIONS=NONE"); else if (variant.closedCaptions.length > 0) {
        attrs.push(`CLOSED-CAPTIONS="${variant.closedCaptions[0].groupId}"`);
        for (const rendition of variant.closedCaptions) lines.push(buildRendition(rendition));
    }
    if (variant.score && attrs.push(`SCORE=${variant.score}`), variant.allowedCpc) {
        const list = [];
        for (const {format, cpcList} of variant.allowedCpc) list.push(`${format}:${cpcList.join("/")}`);
        attrs.push(`ALLOWED-CPC="${list.join(",")}"`);
    }
    variant.videoRange && attrs.push(`VIDEO-RANGE=${variant.videoRange}`), variant.stableVariantId && attrs.push(`STABLE-VARIANT-ID="${variant.stableVariantId}"`), 
    lines.push(`${name}:${attrs.join(",")}`), variant.isIFrameOnly || lines.push(`${variant.uri}`);
}

function buildRendition(rendition) {
    const attrs = [ `TYPE=${rendition.type}`, `GROUP-ID="${rendition.groupId}"`, `NAME="${rendition.name}"` ];
    return void 0 !== rendition.isDefault && attrs.push("DEFAULT=" + (rendition.isDefault ? "YES" : "NO")), 
    void 0 !== rendition.autoselect && attrs.push("AUTOSELECT=" + (rendition.autoselect ? "YES" : "NO")), 
    void 0 !== rendition.forced && attrs.push("FORCED=" + (rendition.forced ? "YES" : "NO")), 
    rendition.language && attrs.push(`LANGUAGE="${rendition.language}"`), rendition.assocLanguage && attrs.push(`ASSOC-LANGUAGE="${rendition.assocLanguage}"`), 
    rendition.instreamId && attrs.push(`INSTREAM-ID="${rendition.instreamId}"`), rendition.characteristics && attrs.push(`CHARACTERISTICS="${rendition.characteristics}"`), 
    rendition.channels && attrs.push(`CHANNELS="${rendition.channels}"`), rendition.uri && attrs.push(`URI="${rendition.uri}"`), 
    `#EXT-X-MEDIA:${attrs.join(",")}`;
}

function buildSegment(lines, segment, lastKey, lastMap, version = 1) {
    let hint = !1, markerType = "";
    if (segment.discontinuity && lines.push("#EXT-X-DISCONTINUITY"), segment.key) {
        const line = buildKey(segment.key);
        line !== lastKey && (lines.push(line), lastKey = line);
    }
    if (segment.map) {
        const line = function(map) {
            const attrs = [ `URI="${map.uri}"` ];
            map.byterange && attrs.push(`BYTERANGE="${buildByteRange(map.byterange)}"`);
            return `#EXT-X-MAP:${attrs.join(",")}`;
        }(segment.map);
        line !== lastMap && (lines.push(line), lastMap = line);
    }
    if (segment.programDateTime && lines.push(`#EXT-X-PROGRAM-DATE-TIME:${utils.formatDate(segment.programDateTime)}`), 
    segment.dateRange && lines.push(function(dateRange) {
        const attrs = [ `ID="${dateRange.id}"` ];
        dateRange.start && attrs.push(`START-DATE="${utils.formatDate(dateRange.start)}"`);
        dateRange.end && attrs.push(`END-DATE="${dateRange.end}"`);
        dateRange.duration && attrs.push(`DURATION=${dateRange.duration}`);
        dateRange.plannedDuration && attrs.push(`PLANNED-DURATION=${dateRange.plannedDuration}`);
        dateRange.classId && attrs.push(`CLASS="${dateRange.classId}"`);
        dateRange.endOnNext && attrs.push("END-ON-NEXT=YES");
        for (const key of Object.keys(dateRange.attributes)) key.startsWith("X-") ? "number" == typeof dateRange.attributes[key] ? attrs.push(`${key}=${dateRange.attributes[key]}`) : attrs.push(`${key}="${dateRange.attributes[key]}"`) : key.startsWith("SCTE35-") && attrs.push(`${key}=${utils.byteSequenceToHex(dateRange.attributes[key])}`);
        return `#EXT-X-DATERANGE:${attrs.join(",")}`;
    }(segment.dateRange)), segment.markers.length > 0 && (markerType = function(lines, markers) {
        let type = "";
        for (const marker of markers) if ("OUT" === marker.type) type = "OUT", lines.push(`#EXT-X-CUE-OUT:DURATION=${marker.duration}`); else if ("IN" === marker.type) type = "IN", 
        lines.push("#EXT-X-CUE-IN"); else if ("RAW" === marker.type) {
            const value = marker.value ? `:${marker.value}` : "";
            lines.push(`#${marker.tagName}${value}`);
        }
        return type;
    }(lines, segment.markers)), segment.parts.length > 0 && (hint = function(lines, parts) {
        let hint = !1;
        for (const part of parts) if (part.hint) {
            const params = [];
            if (params.push("TYPE=PART", `URI="${part.uri}"`), part.byterange) {
                const {offset, length} = part.byterange;
                params.push(`BYTERANGE-START=${offset}`), length && params.push(`BYTERANGE-LENGTH=${length}`);
            }
            lines.push(`#EXT-X-PRELOAD-HINT:${params.join(",")}`), hint = !0;
        } else {
            const params = [];
            params.push(`DURATION=${part.duration}`, `URI="${part.uri}"`), part.byterange && params.push(`BYTERANGE=${buildByteRange(part.byterange)}`), 
            part.independent && params.push("INDEPENDENT=YES"), part.gap && params.push("GAP=YES"), 
            lines.push(`#EXT-X-PART:${params.join(",")}`);
        }
        return hint;
    }(lines, segment.parts)), hint) return [ lastKey, lastMap ];
    const duration = version < 3 ? Math.round(segment.duration) : buildDecimalFloatingNumber(segment.duration, function(num) {
        const str = num.toString(10), index = str.indexOf(".");
        return -1 === index ? 0 : str.length - index - 1;
    }(segment.duration));
    return lines.push(`#EXTINF:${duration},${unescape(encodeURIComponent(segment.title || ""))}`), 
    segment.byterange && lines.push(`#EXT-X-BYTERANGE:${buildByteRange(segment.byterange)}`), 
    Array.prototype.push.call(lines, `${segment.uri}`), [ lastKey, lastMap, markerType ];
}

function buildByteRange({offset, length}) {
    return `${length}@${offset}`;
}

var stringify_1 = function(playlist) {
    utils.PARAMCHECK(playlist), utils.ASSERT("Not a playlist", "playlist" === playlist.type);
    const lines = new LineArray(playlist.uri);
    return lines.push("#EXTM3U"), playlist.version && lines.push(`#EXT-X-VERSION:${playlist.version}`), 
    playlist.independentSegments && lines.push("#EXT-X-INDEPENDENT-SEGMENTS"), playlist.start && lines.push(`#EXT-X-START:TIME-OFFSET=${buildDecimalFloatingNumber(playlist.start.offset)}${playlist.start.precise ? ",PRECISE=YES" : ""}`), 
    playlist.isMasterPlaylist ? function(lines, playlist) {
        for (const sessionData of playlist.sessionDataList) lines.push(buildSessionData(sessionData));
        for (const sessionKey of playlist.sessionKeyList) lines.push(buildKey(sessionKey, !0));
        for (const variant of playlist.variants) buildVariant(lines, variant);
    }(lines, playlist) : function(lines, playlist) {
        let lastKey = "", lastMap = "", unclosedCueIn = !1;
        if (playlist.targetDuration && lines.push(`#EXT-X-TARGETDURATION:${playlist.targetDuration}`), 
        playlist.lowLatencyCompatibility) {
            const {canBlockReload, canSkipUntil, holdBack, partHoldBack} = playlist.lowLatencyCompatibility, params = [];
            params.push("CAN-BLOCK-RELOAD=" + (canBlockReload ? "YES" : "NO")), void 0 !== canSkipUntil && params.push(`CAN-SKIP-UNTIL=${canSkipUntil}`), 
            void 0 !== holdBack && params.push(`HOLD-BACK=${holdBack}`), void 0 !== partHoldBack && params.push(`PART-HOLD-BACK=${partHoldBack}`), 
            lines.push(`#EXT-X-SERVER-CONTROL:${params.join(",")}`);
        }
        playlist.partTargetDuration && lines.push(`#EXT-X-PART-INF:PART-TARGET=${playlist.partTargetDuration}`), 
        playlist.mediaSequenceBase && lines.push(`#EXT-X-MEDIA-SEQUENCE:${playlist.mediaSequenceBase}`), 
        playlist.discontinuitySequenceBase && lines.push(`#EXT-X-DISCONTINUITY-SEQUENCE:${playlist.discontinuitySequenceBase}`), 
        playlist.playlistType && lines.push(`#EXT-X-PLAYLIST-TYPE:${playlist.playlistType}`), 
        playlist.isIFrame && lines.push("#EXT-X-I-FRAMES-ONLY"), playlist.skip > 0 && lines.push(`#EXT-X-SKIP:SKIPPED-SEGMENTS=${playlist.skip}`);
        for (const segment of playlist.segments) {
            let markerType = "";
            [lastKey, lastMap, markerType] = buildSegment(lines, segment, lastKey, lastMap, playlist.version), 
            "OUT" === markerType ? unclosedCueIn = !0 : "IN" === markerType && unclosedCueIn && (unclosedCueIn = !1);
        }
        "VOD" === playlist.playlistType && unclosedCueIn && lines.push("#EXT-X-CUE-IN"), 
        playlist.prefetchSegments.length > 2 && utils.INVALIDPLAYLIST("The server must deliver no more than two prefetch segments");
        for (const segment of playlist.prefetchSegments) segment.discontinuity && lines.push("#EXT-X-PREFETCH-DISCONTINUITY"), 
        lines.push(`#EXT-X-PREFETCH:${segment.uri}`);
        playlist.endlist && lines.push("#EXT-X-ENDLIST");
        for (const report of playlist.renditionReports) {
            const params = [];
            params.push(`URI="${report.uri}"`, `LAST-MSN=${report.lastMSN}`), void 0 !== report.lastPart && params.push(`LAST-PART=${report.lastPart}`), 
            lines.push(`#EXT-X-RENDITION-REPORT:${params.join(",")}`);
        }
    }(lines, playlist), lines.join("\n");
};

/*! Copyright Kuu Miyazaki. SPDX-License-Identifier: MIT */ const {getOptions, setOptions} = utils$3;

var ManifestType, ClippingMethod, hlsParser = {
    parse: parse_1,
    stringify: stringify_1,
    types: types$1,
    getOptions,
    setOptions
};

function ParseBitrateRange(bitrate, tolerance) {
    let lowerBound = 0, upperBound = 0;
    const [lowerBoundStr, upperBoundStr] = bitrate.split("-");
    return void 0 === upperBoundStr ? (lowerBound = Number(lowerBoundStr) - tolerance, 
    upperBound = Number(lowerBoundStr) + tolerance) : (lowerBound = Number(lowerBoundStr), 
    upperBound = Number(upperBoundStr), 0 == upperBound && (upperBound = Number.MAX_VALUE)), 
    lowerBound >= upperBound && (lowerBound = -1, upperBound = -1), [ lowerBound, upperBound ];
}

function parseResolution(maxSupportedResolution) {
    const pair = maxSupportedResolution.split("x");
    if (2 !== pair.length) throw new Error("Invalid resolution type, expected string in <width>x<height> format.");
    const w = Number(pair[0]), h = Number(pair[1]);
    if (Number.isNaN(w) || Number.isNaN(h)) throw new Error("Invalid resolution type, expected string in <width>x<height> format.");
    return {
        width: w,
        height: h
    };
}

!function(ManifestType) {
    ManifestType.MASTER_MANIFEST = "Master Manifest", ManifestType.MEDIA_MANIFEST = "Media Manifest";
}(ManifestType || (ManifestType = {})), function(ClippingMethod) {
    ClippingMethod.PRECISE = "PRECISE", ClippingMethod.SEGMENT_BOUNDARIES = "SEGMENT_BOUNDARIES";
}(ClippingMethod || (ClippingMethod = {})), hlsParser.setOptions({
    strictMode: !0
});

class LiveManifestTransformer {
    constructor(input) {
        this.sortedInput = [], this.replaceSegs = [], this.currentPolicyIndex = 0, this.currentPolicyLength = input.length, 
        this.sortedInput = this.sort(input), this.currentPolicy = this.sortedInput[this.currentPolicyIndex], 
        this.pgmStartDate = new Date, this.pgmEndDate = new Date;
    }
    transform(chunk) {
        let startSeg = -1, endSeg = -1, replaceSegmentStartTime = -1;
        const originalPlaylist = hlsParser.parse(chunk);
        if (this.setCurrentPolicy(originalPlaylist.segments[0].programDateTime), this.currentPolicy) {
            for (let i = 0; i < originalPlaylist.segments.length; i++) {
                const segment = originalPlaylist.segments[i];
                segment.programDateTime ? (this.pgmStartDate = new Date(segment.programDateTime), 
                this.pgmEndDate.setTime(this.pgmStartDate.getTime() + Math.floor(1e3 * segment.duration))) : (this.pgmStartDate.setTime(this.pgmEndDate.getTime()), 
                this.pgmEndDate.setTime(this.pgmStartDate.getTime() + Math.floor(1e3 * segment.duration))), 
                this.currentPolicy && this.pgmStartDate >= this.currentPolicy.endDate && (-1 != startSeg && (this.replaceSegs.push([ startSeg, endSeg, this.currentPolicyIndex, replaceSegmentStartTime ]), 
                startSeg = -1, endSeg = -1), this.currentPolicyIndex < this.currentPolicyLength - 1 ? (this.currentPolicyIndex++, 
                this.currentPolicy = this.sortedInput[this.currentPolicyIndex]) : this.currentPolicy = void 0), 
                this.currentPolicy && this.currentPolicy.startDate <= this.pgmStartDate && this.pgmStartDate < this.currentPolicy.endDate && (-1 == startSeg ? (startSeg = i, 
                endSeg = i, replaceSegmentStartTime = this.pgmStartDate.getTime()) : endSeg = i);
            }
            -1 !== startSeg && this.replaceSegs.push([ startSeg, endSeg, this.currentPolicyIndex, replaceSegmentStartTime ]), 
            this.replaceSegs.length > 0 && this.replaceBlackoutSegments(originalPlaylist);
        }
        return hlsParser.stringify(originalPlaylist);
    }
    replaceBlackoutSegments(originalPlaylist) {
        let replacedSegments = [], start = 0;
        for (let i = 0; i < this.replaceSegs.length; i++) {
            const currentReplaceSegs = this.replaceSegs[i], applicablePolicy = this.sortedInput[currentReplaceSegs[2]], beforeSegments = originalPlaylist.segments.slice(start, currentReplaceSegs[0]);
            beforeSegments.length > 0 && (i > 0 && (beforeSegments[0].discontinuity = !0), replacedSegments = replacedSegments.concat(beforeSegments));
            const blackoutSegments = this.getBlackoutSegments(applicablePolicy.content, currentReplaceSegs[3], currentReplaceSegs[1] - currentReplaceSegs[0] + 1);
            blackoutSegments[0].programDateTime = new Date(currentReplaceSegs[3]), blackoutSegments[0].discontinuity = !0, 
            replacedSegments = replacedSegments.concat(blackoutSegments), start = currentReplaceSegs[1] + 1;
        }
        const endSegments = originalPlaylist.segments.slice(start, originalPlaylist.segments.length);
        endSegments.length > 0 && (endSegments[0].discontinuity = !0, replacedSegments = replacedSegments.concat(endSegments)), 
        originalPlaylist.segments = replacedSegments;
    }
    getBlackoutSegments(blackoutSegments, fromTime, count) {
        const fromDate = new Date(fromTime), startIndex = blackoutSegments.segments.findIndex((seg => {
            const endTime = new Date;
            return endTime.setTime(seg.programDateTime.getTime() + Math.floor(1e3 * seg.duration)), 
            seg.programDateTime <= fromDate && fromDate < endTime;
        })), filteredSegments = [ ...blackoutSegments.segments.slice(startIndex, startIndex + count) ];
        return filteredSegments.map((seg => seg.programDateTime = void 0)), filteredSegments;
    }
    setCurrentPolicy(pgmDateTime) {
        if (!pgmDateTime) throw new Error("Failed due to missing program date time tag for the first segment in media playlist file!");
        for (;this.currentPolicy && pgmDateTime > this.currentPolicy.endDate; ) this.currentPolicyIndex++, 
        this.currentPolicyIndex < this.sortedInput.length ? this.currentPolicy = this.sortedInput[this.currentPolicyIndex] : this.currentPolicy = void 0;
    }
    sort(input) {
        return input.sort(((objA, objB) => objA.endDate.getTime() - objB.endDate.getTime()));
    }
    static async marshalPolicy(input) {
        return Promise.all(input.map((async policy => {
            try {
                const p = await this.fetchMediaPlaylist(policy.content);
                policy.content = hlsParser.parse(p), "string" == typeof policy.startDate && (policy.startDate = new Date(policy.startDate)), 
                "string" == typeof policy.endDate && (policy.endDate = new Date(policy.endDate));
                const sD = new Date(policy.startDate);
                return policy.content.segments.map((seg => {
                    seg.programDateTime = new Date(sD), sD.setTime(sD.getTime() + Math.floor(1e3 * seg.duration));
                })), policy;
            } catch (error) {
                throw new Error(`Failed to parse blackslate media playlist ${policy.content}, reason: ${error.message}`);
            }
        })));
    }
    static async fetchMediaPlaylist(data) {
        if (0 === data.indexOf("http")) {
            const bsm = await httpRequest(data);
            return await bsm.text();
        }
        return Promise.resolve(data);
    }
}

class HLS {
    static parseManifest(text) {
        if ("string" != typeof text) throw new Error("Invalid input type, expected input of type string.");
        if (0 === text.trim().length) throw new Error("Received empty input value, expected non-empty string as input.");
        return hlsParser.parse(text);
    }
    static stringifyManifest(playlistObj) {
        if (!playlistObj) throw new Error("Received empty playlist object, expected master or media playlist object.");
        return hlsParser.stringify(playlistObj);
    }
    static getManifestType(playlistObj) {
        if (!playlistObj) throw new Error("Received empty playlist object, expected master or media playlist object.");
        if (void 0 === playlistObj.isMasterPlaylist || null == playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master or media playlist object.");
        return playlistObj.isMasterPlaylist ? ManifestType.MASTER_MANIFEST : ManifestType.MEDIA_MANIFEST;
    }
    static preserveVariantsByBitrate(playlistObj, bitrates, tolerance = 1e5) {
        if (!playlistObj || !playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master playlist object.");
        if (!bitrates || !Array.isArray(bitrates)) throw new Error("Invalid bitrates type, expected array of strings.");
        if (0 == bitrates.length) throw new Error("Received empty bitrates array, expected array of strings.");
        if (!bitrates.every((elem => "string" == typeof elem && elem.length > 0))) throw new Error("Received invalid bitrates array, expected array of strings.");
        if ("number" != typeof tolerance) throw new Error("Invalid tolerance type, expected non-negative number.");
        if (tolerance < 0) throw new Error("Invalid tolerance value, expected non-negative number.");
        let isVariantRemoved = !1;
        const numOfBitrates = bitrates.length, variantsToPreserve = new Set;
        for (let i = 0; i < numOfBitrates; i++) {
            const [lowerBound, upperBound] = ParseBitrateRange(bitrates[i], tolerance);
            if (-1 == lowerBound) continue;
            let j = 0;
            const variantsLen = playlistObj.variants.length;
            for (;j < variantsLen; ) playlistObj.variants[j].bandwidth && playlistObj.variants[j].bandwidth >= lowerBound && playlistObj.variants[j].bandwidth <= upperBound && variantsToPreserve.add(playlistObj.variants[j]), 
            j++;
        }
        return variantsToPreserve.size > 0 && (playlistObj.variants = Array.from(variantsToPreserve), 
        isVariantRemoved = !0), isVariantRemoved;
    }
    static preserveVariantsByResolution(playlistObj, maxSupportedResolution) {
        if (!playlistObj || !playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master playlist object.");
        if ("string" != typeof maxSupportedResolution) throw new Error("Invalid resolution type, expected string in <width>x<height> format.");
        if (0 === maxSupportedResolution.length) throw new Error("Received empty resolution, expected string in <width>x<height> format.");
        const maxSupportedResolutionObject = parseResolution(maxSupportedResolution);
        let isVariantRemoved = !1, i = 0, numOfVariantsInManifest = playlistObj.variants.length;
        for (;i < numOfVariantsInManifest; ) {
            const resolution = playlistObj.variants[i].resolution;
            resolution && (resolution.width > maxSupportedResolutionObject.width || resolution.height > maxSupportedResolutionObject.height) ? (playlistObj.variants.splice(i, 1), 
            isVariantRemoved = !0, numOfVariantsInManifest--) : i++;
        }
        return isVariantRemoved;
    }
    static moveVariantToIndex(playlistObj, resolution, position = 0) {
        if (!playlistObj || !playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master playlist object.");
        if ("string" != typeof resolution) throw new Error("Invalid resolution type, expected string in <width>x<height> format.");
        if (0 === resolution.length) throw new Error("Received empty resolution, expected string in <width>x<height> format.");
        if (position < 0) throw new Error("Invalid position value, expected non-negative value.");
        const resolutionObject = parseResolution(resolution);
        let i = 0;
        const numOfVariantsInManifest = playlistObj.variants.length;
        for (;i < numOfVariantsInManifest && position < numOfVariantsInManifest; ) {
            const resolution = playlistObj.variants[i].resolution;
            resolution && resolution.width === resolutionObject.width && resolution.height === resolutionObject.height && (i != position && playlistObj.variants.splice(position, 0, playlistObj.variants.splice(i, 1)[0]), 
            position++), i++;
        }
        return position;
    }
    static updateResolutionOrder(playlistObj, resolutions) {
        if (!playlistObj || !playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master playlist object.");
        if (!resolutions || !Array.isArray(resolutions)) throw new Error("Invalid resolutions type, expected array of strings in <width>x<height> format.");
        if (0 == resolutions.length) throw new Error("Received empty resolutions, expected array of strings in <width>x<height> format.");
        if (!resolutions.every((elem => "string" == typeof elem && elem.length > 0))) throw new Error("Invalid resolutions type, expected array of strings in <width>x<height> format.");
        let isResolutionOrderUpdated = !1, newIndex = 0;
        if (resolutions.length > playlistObj.variants.length) return isResolutionOrderUpdated;
        for (let i = 0; i < resolutions.length; i++) {
            const nextIndex = this.moveVariantToIndex(playlistObj, resolutions[i], newIndex);
            nextIndex != newIndex && (isResolutionOrderUpdated = !0, newIndex = nextIndex);
        }
        return isResolutionOrderUpdated;
    }
    static preserveAudioRenditionsByLanguage(playlistObj, languages) {
        if (!playlistObj || !playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master playlist object.");
        if (!languages || !Array.isArray(languages)) throw new Error("Invalid languages type, expected array of non-empty string.");
        if (0 == languages.length) throw new Error("Received empty languages, expected array of non-empty string.");
        if (!languages.every((elem => "string" == typeof elem && elem.length > 0))) throw new Error("Invalid languages type, expected array of non-empty strings.");
        let isAudioRenditionRemoved = !1;
        for (let j = 0; j < playlistObj.variants.length; j++) {
            let k = 0, numOfAudioRenditions = playlistObj.variants[j].audio.length;
            for (;k < numOfAudioRenditions; ) languages.indexOf(playlistObj.variants[j].audio[k].language) < 0 ? (playlistObj.variants[j].audio.splice(k, 1), 
            isAudioRenditionRemoved = !0, numOfAudioRenditions--) : k++;
        }
        return isAudioRenditionRemoved;
    }
    static preserveSubtitleRenditionsByLanguage(playlistObj, languages) {
        if (!playlistObj || !playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid master playlist object.");
        if (!languages || !Array.isArray(languages)) throw new Error("Invalid languages type, expected array of non-empty string.");
        if (0 == languages.length) throw new Error("Received empty languages, expected array of non-empty string.");
        if (!languages.every((elem => "string" == typeof elem && elem.length > 0))) throw new Error("Invalid languages type, expected array of non-empty strings.");
        let isSubtitleRenditionRemoved = !1;
        for (let j = 0; j < playlistObj.variants.length; j++) {
            let k = 0, numOfSubtitleRenditions = playlistObj.variants[j].subtitles.length;
            for (;k < numOfSubtitleRenditions; ) languages.indexOf(playlistObj.variants[j].subtitles[k].language) < 0 ? (playlistObj.variants[j].subtitles.splice(k, 1), 
            isSubtitleRenditionRemoved = !0, numOfSubtitleRenditions--) : k++;
        }
        return isSubtitleRenditionRemoved;
    }
    static insertAuxiliaryContent(playlistObj, bumpers) {
        if (!playlistObj || void 0 === playlistObj.isMasterPlaylist || playlistObj.isMasterPlaylist) throw new Error("Received invalid playlist object, expected valid media playlist object.");
        if (!bumpers || !Array.isArray(bumpers)) throw new Error("Invalid bumpers type, expected array of type Bumper.");
        if (0 == bumpers.length) throw new Error("Received empty bumpers, expected array of type Bumper.");
        if (!bumpers.every((elem => "object" == typeof elem && void 0 !== elem.afterSeconds))) throw new Error("Invalid bumpers type, expected array of type Bumper.");
        const bumpersListSize = bumpers.length;
        bumpers.sort(((a, b) => a.afterSeconds - b.afterSeconds));
        const auxContentPosInPrimPlaylistArr = [];
        let k = 0, elapsedSeconds = 0, primPlaylistCurrSegment = 0, auxContentPosInPrimPlaylist = 0;
        for (let i = 0; i < bumpersListSize; ++i) {
            const bumper = bumpers[i];
            if (0 == bumper.afterSeconds) auxContentPosInPrimPlaylist = 0, auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist, 
            playlistObj.segments[0].discontinuity = !0; else if (bumper.afterSeconds > 0 && bumper.afterSeconds < Number.MAX_VALUE) {
                let segment;
                for (let j = primPlaylistCurrSegment; j < playlistObj.segments.length && (segment = playlistObj.segments[j], 
                !(elapsedSeconds >= bumper.afterSeconds)); ++j) elapsedSeconds += segment.duration, 
                auxContentPosInPrimPlaylist++, primPlaylistCurrSegment++;
                segment && primPlaylistCurrSegment !== playlistObj.segments.length && (segment.discontinuity = !0), 
                auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;
            } else bumper.afterSeconds == Number.MAX_VALUE && (auxContentPosInPrimPlaylist = playlistObj.segments.length, 
            auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist);
        }
        for (const key in bumpers) {
            bumpers[key].auxiliaryPlaylist.segments[0].discontinuity = !0;
        }
        let auxCntSegListLen = 0;
        for (let i = 0; i < bumpersListSize; i++) auxContentPosInPrimPlaylistArr[i] += auxCntSegListLen, 
        playlistObj.segments.splice(auxContentPosInPrimPlaylistArr[i], 0, ...bumpers[i].auxiliaryPlaylist.segments), 
        auxCntSegListLen += bumpers[i].auxiliaryPlaylist.segments.length;
    }
}

var types$2 = hlsParser.types;

export { HLS, LiveManifestTransformer, ManifestType, types$2 as types };
