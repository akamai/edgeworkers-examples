/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

/*
 * Export kMaxLength after typed array support is determined.
 */
kMaxLength();

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) ;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

let options = {};

function THROW(err) {
  if (!options.strictMode) {
    if (!options.silent) {
      console.error(err.message);
    }
    return;
  }
  throw err;
}

function ASSERT(msg, ...options) {
  for (const [index, param] of options.entries()) {
    if (!param) {
      THROW(new Error(`${msg} : Failed at [${index}]`));
    }
  }
}

function CONDITIONALASSERT(...options) {
  for (const [index, [cond, param]] of options.entries()) {
    if (!cond) {
      continue;
    }
    if (!param) {
      THROW(new Error(`Conditional Assert : Failed at [${index}]`));
    }
  }
}

function PARAMCHECK(...options) {
  for (const [index, param] of options.entries()) {
    if (param === undefined) {
      THROW(new Error(`Param Check : Failed at [${index}]`));
    }
  }
}

function CONDITIONALPARAMCHECK(...options) {
  for (const [index, [cond, param]] of options.entries()) {
    if (!cond) {
      continue;
    }
    if (param === undefined) {
      THROW(new Error(`Conditional Param Check : Failed at [${index}]`));
    }
  }
}

function INVALIDPLAYLIST(msg) {
  THROW(new Error(`Invalid Playlist : ${msg}`));
}

function toNumber$1(str, radix = 10) {
  if (typeof str === 'number') {
    return str;
  }
  const num = radix === 10 ? Number.parseFloat(str, radix) : Number.parseInt(str, radix);
  if (Number.isNaN(num)) {
    return 0;
  }
  return num;
}

function hexToByteSequence(str) {
  if (str.startsWith('0x') || str.startsWith('0X')) {
    str = str.slice(2);
  }
  const numArray = [];
  for (let i = 0; i < str.length; i += 2) {
    numArray.push(toNumber$1(str.slice(i, i + 2), 16));
  }
  return Buffer.from(numArray);
}

function byteSequenceToHex(sequence, start = 0, end = sequence.length) {
  if (end <= start) {
    THROW(new Error(`end must be larger than start : start=${start}, end=${end}`));
  }
  const array = [];
  for (let i = start; i < end; i++) {
    array.push(`0${(sequence[i] & 0xFF).toString(16).toUpperCase()}`.slice(-2));
  }
  return `0x${array.join('')}`;
}

function tryCatch(body, errorHandler) {
  try {
    return body();
  } catch (err) {
    return errorHandler(err);
  }
}

function splitAt(str, delimiter, index = 0) {
  let lastDelimiterPos = -1;
  for (let i = 0, j = 0; i < str.length; i++) {
    if (str[i] === delimiter) {
      if (j++ === index) {
        return [str.slice(0, i), str.slice(i + 1)];
      }
      lastDelimiterPos = i;
    }
  }
  if (lastDelimiterPos !== -1) {
    return [str.slice(0, lastDelimiterPos), str.slice(lastDelimiterPos + 1)];
  }
  return [str];
}

function trim(str, char = ' ') {
  if (!str) {
    return str;
  }
  str = str.trim();
  if (char === ' ') {
    return str;
  }
  if (str.startsWith(char)) {
    str = str.slice(1);
  }
  if (str.endsWith(char)) {
    str = str.slice(0, -1);
  }
  return str;
}

function splitByCommaWithPreservingQuotes(str) {
  const list = [];
  let doParse = true;
  let start = 0;
  const prevQuotes = [];
  for (let i = 0; i < str.length; i++) {
    const curr = str[i];
    if (doParse && curr === ',') {
      list.push(str.slice(start, i).trim());
      start = i + 1;
      continue;
    }
    if (curr === '"' || curr === '\'') {
      if (doParse) {
        prevQuotes.push(curr);
        doParse = false;
      } else if (curr === prevQuotes[prevQuotes.length - 1]) {
        prevQuotes.pop();
        doParse = true;
      } else {
        prevQuotes.push(curr);
      }
    }
  }
  list.push(str.slice(start).trim());
  return list;
}

function camelify(str) {
  const array = [];
  let nextUpper = false;
  for (const ch of str) {
    if (ch === '-' || ch === '_') {
      nextUpper = true;
      continue;
    }
    if (nextUpper) {
      array.push(ch.toUpperCase());
      nextUpper = false;
      continue;
    }
    array.push(ch.toLowerCase());
  }
  return array.join('');
}

function formatDate(date) {
  const YYYY = date.getUTCFullYear();
  const MM = ('0' + (date.getUTCMonth() + 1)).slice(-2);
  const DD = ('0' + date.getUTCDate()).slice(-2);
  const hh = ('0' + date.getUTCHours()).slice(-2);
  const mm = ('0' + date.getUTCMinutes()).slice(-2);
  const ss = ('0' + date.getUTCSeconds()).slice(-2);
  const msc = ('00' + date.getUTCMilliseconds()).slice(-3);
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${msc}Z`;
}

function hasOwnProp(obj, propName) {
  return Object.hasOwnProperty.call(obj, propName);
}

function setOptions$1(newOptions = {}) {
  options = Object.assign(options, newOptions);
}

function getOptions$1() {
  return Object.assign({}, options);
}

var utils$3 = {
  THROW,
  ASSERT,
  CONDITIONALASSERT,
  PARAMCHECK,
  CONDITIONALPARAMCHECK,
  INVALIDPLAYLIST,
  toNumber: toNumber$1,
  hexToByteSequence,
  byteSequenceToHex,
  tryCatch,
  splitAt,
  trim,
  splitByCommaWithPreservingQuotes,
  camelify,
  formatDate,
  hasOwnProp,
  setOptions: setOptions$1,
  getOptions: getOptions$1
};

const utils$2 = utils$3;

class Rendition$1 {
  constructor({
    type, // required
    uri, // required if type='SUBTITLES'
    groupId, // required
    language,
    assocLanguage,
    name, // required
    isDefault,
    autoselect,
    forced,
    instreamId, // required if type=CLOSED-CAPTIONS
    characteristics,
    channels
  }) {
    utils$2.PARAMCHECK(type, groupId, name);
    utils$2.CONDITIONALASSERT([type === 'SUBTITLES', uri], [type === 'CLOSED-CAPTIONS', instreamId], [type === 'CLOSED-CAPTIONS', !uri], [forced, type === 'SUBTITLES']);
    this.type = type;
    this.uri = uri;
    this.groupId = groupId;
    this.language = language;
    this.assocLanguage = assocLanguage;
    this.name = name;
    this.isDefault = isDefault;
    this.autoselect = autoselect;
    this.forced = forced;
    this.instreamId = instreamId;
    this.characteristics = characteristics;
    this.channels = channels;
  }
}

class Variant$1 {
  constructor({
    uri, // required
    isIFrameOnly = false,
    bandwidth, // required
    averageBandwidth,
    score,
    codecs, // required?
    resolution,
    frameRate,
    hdcpLevel,
    allowedCpc,
    videoRange,
    stableVariantId,
    audio = [],
    video = [],
    subtitles = [],
    closedCaptions = [],
    currentRenditions = {audio: 0, video: 0, subtitles: 0, closedCaptions: 0}
  }) {
    // utils.PARAMCHECK(uri, bandwidth, codecs);
    utils$2.PARAMCHECK(uri, bandwidth); // the spec states that CODECS is required but not true in the real world
    this.uri = uri;
    this.isIFrameOnly = isIFrameOnly;
    this.bandwidth = bandwidth;
    this.averageBandwidth = averageBandwidth;
    this.score = score;
    this.codecs = codecs;
    this.resolution = resolution;
    this.frameRate = frameRate;
    this.hdcpLevel = hdcpLevel;
    this.allowedCpc = allowedCpc;
    this.videoRange = videoRange;
    this.stableVariantId = stableVariantId;
    this.audio = audio;
    this.video = video;
    this.subtitles = subtitles;
    this.closedCaptions = closedCaptions;
    this.currentRenditions = currentRenditions;
  }
}

class SessionData$1 {
  constructor({
    id, // required
    value,
    uri,
    language
  }) {
    utils$2.PARAMCHECK(id, value || uri);
    utils$2.ASSERT('SessionData cannot have both value and uri, shoud be either.', !(value && uri));
    this.id = id;
    this.value = value;
    this.uri = uri;
    this.language = language;
  }
}

class Key$1 {
  constructor({
    method, // required
    uri, // required unless method=NONE
    iv,
    format,
    formatVersion
  }) {
    utils$2.PARAMCHECK(method);
    utils$2.CONDITIONALPARAMCHECK([method !== 'NONE', uri]);
    utils$2.CONDITIONALASSERT([method === 'NONE', !(uri || iv || format || formatVersion)]);
    this.method = method;
    this.uri = uri;
    this.iv = iv;
    this.format = format;
    this.formatVersion = formatVersion;
  }
}

class MediaInitializationSection$1 {
  constructor({
    hint = false,
    uri, // required
    mimeType,
    byterange
  }) {
    utils$2.PARAMCHECK(uri);
    this.hint = hint;
    this.uri = uri;
    this.mimeType = mimeType;
    this.byterange = byterange;
  }
}

class DateRange$1 {
  constructor({
    id, // required
    classId, // required if endOnNext is true
    start,
    end,
    duration,
    plannedDuration,
    endOnNext,
    attributes = {}
  }) {
    utils$2.PARAMCHECK(id);
    utils$2.CONDITIONALPARAMCHECK([endOnNext === true, classId]);
    utils$2.CONDITIONALASSERT([end, start], [end, start <= end], [duration, duration >= 0], [plannedDuration, plannedDuration >= 0]);
    this.id = id;
    this.classId = classId;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.plannedDuration = plannedDuration;
    this.endOnNext = endOnNext;
    this.attributes = attributes;
  }
}

class SpliceInfo$1 {
  constructor({
    type, // required
    duration, // required if the type is 'OUT'
    tagName, // required if the type is 'RAW'
    value
  }) {
    utils$2.PARAMCHECK(type);
    utils$2.CONDITIONALPARAMCHECK([type === 'OUT', duration]);
    utils$2.CONDITIONALPARAMCHECK([type === 'RAW', tagName]);
    this.type = type;
    this.duration = duration;
    this.tagName = tagName;
    this.value = value;
  }
}

class Data {
  constructor(type) {
    utils$2.PARAMCHECK(type);
    this.type = type;
  }
}

class Playlist extends Data {
  constructor({
    isMasterPlaylist, // required
    uri,
    version,
    independentSegments = false,
    start,
    source
  }) {
    super('playlist');
    utils$2.PARAMCHECK(isMasterPlaylist);
    this.isMasterPlaylist = isMasterPlaylist;
    this.uri = uri;
    this.version = version;
    this.independentSegments = independentSegments;
    this.start = start;
    this.source = source;
  }
}

class MasterPlaylist$1 extends Playlist {
  constructor(params = {}) {
    params.isMasterPlaylist = true;
    super(params);
    const {
      variants = [],
      currentVariant,
      sessionDataList = [],
      sessionKeyList = []
    } = params;
    this.variants = variants;
    this.currentVariant = currentVariant;
    this.sessionDataList = sessionDataList;
    this.sessionKeyList = sessionKeyList;
  }
}

class MediaPlaylist$1 extends Playlist {
  constructor(params = {}) {
    params.isMasterPlaylist = false;
    super(params);
    const {
      targetDuration,
      mediaSequenceBase = 0,
      discontinuitySequenceBase = 0,
      endlist = false,
      playlistType,
      isIFrame,
      segments = [],
      prefetchSegments = [],
      lowLatencyCompatibility,
      partTargetDuration,
      renditionReports = [],
      skip = 0,
      hash
    } = params;
    this.targetDuration = targetDuration;
    this.mediaSequenceBase = mediaSequenceBase;
    this.discontinuitySequenceBase = discontinuitySequenceBase;
    this.endlist = endlist;
    this.playlistType = playlistType;
    this.isIFrame = isIFrame;
    this.segments = segments;
    this.prefetchSegments = prefetchSegments;
    this.lowLatencyCompatibility = lowLatencyCompatibility;
    this.partTargetDuration = partTargetDuration;
    this.renditionReports = renditionReports;
    this.skip = skip;
    this.hash = hash;
  }
}

class Segment$1 extends Data {
  constructor({
    uri,
    mimeType,
    data,
    duration,
    title,
    byterange,
    discontinuity,
    mediaSequenceNumber = 0,
    discontinuitySequence = 0,
    key,
    map,
    programDateTime,
    dateRange,
    markers = [],
    parts = []
  }) {
    super('segment');
    // utils.PARAMCHECK(uri, mediaSequenceNumber, discontinuitySequence);
    this.uri = uri;
    this.mimeType = mimeType;
    this.data = data;
    this.duration = duration;
    this.title = title;
    this.byterange = byterange;
    this.discontinuity = discontinuity;
    this.mediaSequenceNumber = mediaSequenceNumber;
    this.discontinuitySequence = discontinuitySequence;
    this.key = key;
    this.map = map;
    this.programDateTime = programDateTime;
    this.dateRange = dateRange;
    this.markers = markers;
    this.parts = parts;
  }
}

class PartialSegment$1 extends Data {
  constructor({
    hint = false,
    uri, // required
    duration,
    independent,
    byterange,
    gap
  }) {
    super('part');
    utils$2.PARAMCHECK(uri);
    this.hint = hint;
    this.uri = uri;
    this.duration = duration;
    this.independent = independent;
    this.duration = duration;
    this.byterange = byterange;
    this.gap = gap;
  }
}

class PrefetchSegment$1 extends Data {
  constructor({
    uri, // required
    discontinuity,
    mediaSequenceNumber = 0,
    discontinuitySequence = 0,
    key
  }) {
    super('prefetch');
    utils$2.PARAMCHECK(uri);
    this.uri = uri;
    this.discontinuity = discontinuity;
    this.mediaSequenceNumber = mediaSequenceNumber;
    this.discontinuitySequence = discontinuitySequence;
    this.key = key;
  }
}

class RenditionReport$1 {
  constructor({
    uri, // required
    lastMSN,
    lastPart
  }) {
    utils$2.PARAMCHECK(uri);
    this.uri = uri;
    this.lastMSN = lastMSN;
    this.lastPart = lastPart;
  }
}

var types$1 = {
  Rendition: Rendition$1,
  Variant: Variant$1,
  SessionData: SessionData$1,
  Key: Key$1,
  MediaInitializationSection: MediaInitializationSection$1,
  DateRange: DateRange$1,
  SpliceInfo: SpliceInfo$1,
  Playlist,
  MasterPlaylist: MasterPlaylist$1,
  MediaPlaylist: MediaPlaylist$1,
  Segment: Segment$1,
  PartialSegment: PartialSegment$1,
  PrefetchSegment: PrefetchSegment$1,
  RenditionReport: RenditionReport$1
};

const utils$1 = utils$3;
const {
  Rendition,
  Variant,
  SessionData,
  Key,
  MediaInitializationSection,
  DateRange,
  SpliceInfo,
  MasterPlaylist,
  MediaPlaylist,
  Segment,
  PartialSegment,
  PrefetchSegment,
  RenditionReport
} = types$1;

function unquote(str) {
  return utils$1.trim(str, '"');
}

function getTagCategory(tagName) {
  switch (tagName) {
    case 'EXTM3U':
    case 'EXT-X-VERSION':
      return 'Basic';
    case 'EXTINF':
    case 'EXT-X-BYTERANGE':
    case 'EXT-X-DISCONTINUITY':
    case 'EXT-X-PREFETCH-DISCONTINUITY':
    case 'EXT-X-KEY':
    case 'EXT-X-MAP':
    case 'EXT-X-PROGRAM-DATE-TIME':
    case 'EXT-X-DATERANGE':
    case 'EXT-X-CUE-OUT':
    case 'EXT-X-CUE-IN':
    case 'EXT-X-CUE-OUT-CONT':
    case 'EXT-X-CUE':
    case 'EXT-OATCLS-SCTE35':
    case 'EXT-X-ASSET':
    case 'EXT-X-SCTE35':
    case 'EXT-X-PART':
    case 'EXT-X-PRELOAD-HINT':
      return 'Segment';
    case 'EXT-X-TARGETDURATION':
    case 'EXT-X-MEDIA-SEQUENCE':
    case 'EXT-X-DISCONTINUITY-SEQUENCE':
    case 'EXT-X-ENDLIST':
    case 'EXT-X-PLAYLIST-TYPE':
    case 'EXT-X-I-FRAMES-ONLY':
    case 'EXT-X-SERVER-CONTROL':
    case 'EXT-X-PART-INF':
    case 'EXT-X-PREFETCH':
    case 'EXT-X-RENDITION-REPORT':
    case 'EXT-X-SKIP':
      return 'MediaPlaylist';
    case 'EXT-X-MEDIA':
    case 'EXT-X-STREAM-INF':
    case 'EXT-X-I-FRAME-STREAM-INF':
    case 'EXT-X-SESSION-DATA':
    case 'EXT-X-SESSION-KEY':
      return 'MasterPlaylist';
    case 'EXT-X-INDEPENDENT-SEGMENTS':
    case 'EXT-X-START':
      return 'MediaorMasterPlaylist';
    default:
      return 'Unknown';
  }
}

function parseEXTINF(param) {
  const pair = utils$1.splitAt(param, ',');
  return {duration: utils$1.toNumber(pair[0]), title: decodeURIComponent(escape(pair[1]))};
}

function parseBYTERANGE(param) {
  const pair = utils$1.splitAt(param, '@');
  return {length: utils$1.toNumber(pair[0]), offset: pair[1] ? utils$1.toNumber(pair[1]) : -1};
}

function parseResolution$1(str) {
  const pair = utils$1.splitAt(str, 'x');
  return {width: utils$1.toNumber(pair[0]), height: utils$1.toNumber(pair[1])};
}

function parseAllowedCpc(str) {
  const message = 'ALLOWED-CPC: Each entry must consit of KEYFORMAT and Content Protection Configuration';
  const list = str.split(',');
  if (list.length === 0) {
    utils$1.INVALIDPLAYLIST(message);
  }
  const allowedCpcList = [];
  for (const item of list) {
    const [format, cpcText] = utils$1.splitAt(item, ':');
    if (!format || !cpcText) {
      utils$1.INVALIDPLAYLIST(message);
      continue;
    }
    allowedCpcList.push({format, cpcList: cpcText.split('/')});
  }
  return allowedCpcList;
}

function parseIV(str) {
  const iv = utils$1.hexToByteSequence(str);
  if (iv.length !== 16) {
    utils$1.INVALIDPLAYLIST('IV must be a 128-bit unsigned integer');
  }
  return iv;
}

function parseUserAttribute(str) {
  if (str.startsWith('"')) {
    return unquote(str);
  }
  if (str.startsWith('0x') || str.startsWith('0X')) {
    return utils$1.hexToByteSequence(str);
  }
  return utils$1.toNumber(str);
}

function setCompatibleVersionOfKey(params, attributes) {
  if (attributes['IV'] && params.compatibleVersion < 2) {
    params.compatibleVersion = 2;
  }
  if ((attributes['KEYFORMAT'] || attributes['KEYFORMATVERSIONS']) && params.compatibleVersion < 5) {
    params.compatibleVersion = 5;
  }
}

function parseAttributeList(param) {
  const attributes = {};
  for (const item of utils$1.splitByCommaWithPreservingQuotes(param)) {
    const [key, value] = utils$1.splitAt(item, '=');
    const val = unquote(value);
    switch (key) {
      case 'URI':
        attributes[key] = val;
        break;
      case 'START-DATE':
      case 'END-DATE':
        attributes[key] = new Date(val);
        break;
      case 'IV':
        attributes[key] = parseIV(val);
        break;
      case 'BYTERANGE':
        attributes[key] = parseBYTERANGE(val);
        break;
      case 'RESOLUTION':
        attributes[key] = parseResolution$1(val);
        break;
      case 'ALLOWED-CPC':
        attributes[key] = parseAllowedCpc(val);
        break;
      case 'END-ON-NEXT':
      case 'DEFAULT':
      case 'AUTOSELECT':
      case 'FORCED':
      case 'PRECISE':
      case 'CAN-BLOCK-RELOAD':
      case 'INDEPENDENT':
      case 'GAP':
        attributes[key] = val === 'YES';
        break;
      case 'DURATION':
      case 'PLANNED-DURATION':
      case 'BANDWIDTH':
      case 'AVERAGE-BANDWIDTH':
      case 'FRAME-RATE':
      case 'TIME-OFFSET':
      case 'CAN-SKIP-UNTIL':
      case 'HOLD-BACK':
      case 'PART-HOLD-BACK':
      case 'PART-TARGET':
      case 'BYTERANGE-START':
      case 'BYTERANGE-LENGTH':
      case 'LAST-MSN':
      case 'LAST-PART':
      case 'SKIPPED-SEGMENTS':
      case 'SCORE':
        attributes[key] = utils$1.toNumber(val);
        break;
      default:
        if (key.startsWith('SCTE35-')) {
          attributes[key] = utils$1.hexToByteSequence(val);
        } else if (key.startsWith('X-')) {
          attributes[key] = parseUserAttribute(value);
        } else {
          if (key === 'VIDEO-RANGE' && val !== 'SDR' && val !== 'HLG' && val !== 'PQ') {
            utils$1.INVALIDPLAYLIST(`VIDEO-RANGE: unknown value "${val}"`);
          }
          attributes[key] = val;
        }
    }
  }
  return attributes;
}

function parseTagParam(name, param) {
  switch (name) {
    case 'EXTM3U':
    case 'EXT-X-DISCONTINUITY':
    case 'EXT-X-ENDLIST':
    case 'EXT-X-I-FRAMES-ONLY':
    case 'EXT-X-INDEPENDENT-SEGMENTS':
    case 'EXT-X-CUE-IN':
      return [null, null];
    case 'EXT-X-VERSION':
    case 'EXT-X-TARGETDURATION':
    case 'EXT-X-MEDIA-SEQUENCE':
    case 'EXT-X-DISCONTINUITY-SEQUENCE':
      return [utils$1.toNumber(param), null];
    case 'EXT-X-CUE-OUT':
      // For backwards compatibility: attributes list is optional,
      // if only a number is found, use it as the duration
      if (!Number.isNaN(Number(param))) {
        return [utils$1.toNumber(param), null];
      }
      // If attributes are found, parse them out (i.e. DURATION)
      return [null, parseAttributeList(param)];
    case 'EXT-X-KEY':
    case 'EXT-X-MAP':
    case 'EXT-X-DATERANGE':
    case 'EXT-X-MEDIA':
    case 'EXT-X-STREAM-INF':
    case 'EXT-X-I-FRAME-STREAM-INF':
    case 'EXT-X-SESSION-DATA':
    case 'EXT-X-SESSION-KEY':
    case 'EXT-X-START':
    case 'EXT-X-SERVER-CONTROL':
    case 'EXT-X-PART-INF':
    case 'EXT-X-PART':
    case 'EXT-X-PRELOAD-HINT':
    case 'EXT-X-RENDITION-REPORT':
    case 'EXT-X-SKIP':
      return [null, parseAttributeList(param)];
    case 'EXTINF':
      return [parseEXTINF(param), null];
    case 'EXT-X-BYTERANGE':
      return [parseBYTERANGE(param), null];
    case 'EXT-X-PROGRAM-DATE-TIME':
      return [new Date(param), null];
    case 'EXT-X-PLAYLIST-TYPE':
      return [param, null]; // <EVENT|VOD>
    default:
      return [param, null]; // Unknown tag
  }
}

function MIXEDTAGS() {
  utils$1.INVALIDPLAYLIST(`The file contains both media and master playlist tags.`);
}

function splitTag(line) {
  const index = line.indexOf(':');
  if (index === -1) {
    return [line.slice(1).trim(), null];
  }
  return [line.slice(1, index).trim(), line.slice(index + 1).trim()];
}

function parseRendition({attributes}) {
  const rendition = new Rendition({
    type: attributes['TYPE'],
    uri: attributes['URI'],
    groupId: attributes['GROUP-ID'],
    language: attributes['LANGUAGE'],
    assocLanguage: attributes['ASSOC-LANGUAGE'],
    name: attributes['NAME'],
    isDefault: attributes['DEFAULT'],
    autoselect: attributes['AUTOSELECT'],
    forced: attributes['FORCED'],
    instreamId: attributes['INSTREAM-ID'],
    characteristics: attributes['CHARACTERISTICS'],
    channels: attributes['CHANNELS']
  });
  return rendition;
}

function checkRedundantRendition(renditions, rendition) {
  let defaultFound = false;
  for (const item of renditions) {
    if (item.name === rendition.name) {
      return 'All EXT-X-MEDIA tags in the same Group MUST have different NAME attributes.';
    }
    if (item.isDefault) {
      defaultFound = true;
    }
  }
  if (defaultFound && rendition.isDefault) {
    return 'EXT-X-MEDIA A Group MUST NOT have more than one member with a DEFAULT attribute of YES.';
  }
  return '';
}

function addRendition(variant, line, type) {
  const rendition = parseRendition(line);
  const renditions = variant[utils$1.camelify(type)];
  const errorMessage = checkRedundantRendition(renditions, rendition);
  if (errorMessage) {
    utils$1.INVALIDPLAYLIST(errorMessage);
  }
  renditions.push(rendition);
  if (rendition.isDefault) {
    variant.currentRenditions[utils$1.camelify(type)] = renditions.length - 1;
  }
}

function matchTypes(attrs, variant, params) {
  for (const type of ['AUDIO', 'VIDEO', 'SUBTITLES', 'CLOSED-CAPTIONS']) {
    if (type === 'CLOSED-CAPTIONS' && attrs[type] === 'NONE') {
      params.isClosedCaptionsNone = true;
      variant.closedCaptions = [];
    } else if (attrs[type] && !variant[utils$1.camelify(type)].some(item => item.groupId === attrs[type])) {
      utils$1.INVALIDPLAYLIST(`${type} attribute MUST match the value of the GROUP-ID attribute of an EXT-X-MEDIA tag whose TYPE attribute is ${type}.`);
    }
  }
}

function parseVariant(lines, variantAttrs, uri, iFrameOnly, params) {
  const variant = new Variant({
    uri,
    bandwidth: variantAttrs['BANDWIDTH'],
    averageBandwidth: variantAttrs['AVERAGE-BANDWIDTH'],
    score: variantAttrs['SCORE'],
    codecs: variantAttrs['CODECS'],
    resolution: variantAttrs['RESOLUTION'],
    frameRate: variantAttrs['FRAME-RATE'],
    hdcpLevel: variantAttrs['HDCP-LEVEL'],
    allowedCpc: variantAttrs['ALLOWED-CPC'],
    videoRange: variantAttrs['VIDEO-RANGE'],
    stableVariantId: variantAttrs['STABLE-VARIANT-ID']
  });
  for (const line of lines) {
    if (line.name === 'EXT-X-MEDIA') {
      const renditionAttrs = line.attributes;
      const renditionType = renditionAttrs['TYPE'];
      if (!renditionType || !renditionAttrs['GROUP-ID']) {
        utils$1.INVALIDPLAYLIST('EXT-X-MEDIA TYPE attribute is REQUIRED.');
      }
      if (variantAttrs[renditionType] === renditionAttrs['GROUP-ID']) {
        addRendition(variant, line, renditionType);
        if (renditionType === 'CLOSED-CAPTIONS') {
          for (const {instreamId} of variant.closedCaptions) {
            if (instreamId && instreamId.startsWith('SERVICE') && params.compatibleVersion < 7) {
              params.compatibleVersion = 7;
              break;
            }
          }
        }
      }
    }
  }
  matchTypes(variantAttrs, variant, params);
  variant.isIFrameOnly = iFrameOnly;
  return variant;
}

function sameKey(key1, key2) {
  if (key1.method !== key2.method) {
    return false;
  }
  if (key1.uri !== key2.uri) {
    return false;
  }
  if (key1.iv) {
    if (!key2.iv) {
      return false;
    }
    if (key1.iv.length !== key2.iv.length) {
      return false;
    }
    for (let i = 0; i < key1.iv.length; i++) {
      if (key1.iv[i] !== key2.iv[i]) {
        return false;
      }
    }
  } else if (key2.iv) {
    return false;
  }
  if (key1.format !== key2.format) {
    return false;
  }
  if (key1.formatVersion !== key2.formatVersion) {
    return false;
  }
  return true;
}

function parseMasterPlaylist(lines, params) {
  const playlist = new MasterPlaylist();
  let variantIsScored = false;
  for (const [index, {name, value, attributes}] of lines.entries()) {
    if (name === 'EXT-X-VERSION') {
      playlist.version = value;
    } else if (name === 'EXT-X-STREAM-INF') {
      const uri = lines[index + 1];
      if (typeof uri !== 'string' || uri.startsWith('#EXT')) {
        utils$1.INVALIDPLAYLIST('EXT-X-STREAM-INF must be followed by a URI line');
      }
      const variant = parseVariant(lines, attributes, uri, false, params);
      if (variant) {
        if (typeof variant.score === 'number') {
          variantIsScored = true;
          if (variant.score < 0) {
            utils$1.INVALIDPLAYLIST('SCORE attribute on EXT-X-STREAM-INF must be positive decimal-floating-point number.');
          }
        }
        playlist.variants.push(variant);
      }
    } else if (name === 'EXT-X-I-FRAME-STREAM-INF') {
      const variant = parseVariant(lines, attributes, attributes.URI, true, params);
      if (variant) {
        playlist.variants.push(variant);
      }
    } else if (name === 'EXT-X-SESSION-DATA') {
      const sessionData = new SessionData({
        id: attributes['DATA-ID'],
        value: attributes['VALUE'],
        uri: attributes['URI'],
        language: attributes['LANGUAGE']
      });
      if (playlist.sessionDataList.some(item => item.id === sessionData.id && item.language === sessionData.language)) {
        utils$1.INVALIDPLAYLIST('A Playlist MUST NOT contain more than one EXT-X-SESSION-DATA tag with the same DATA-ID attribute and the same LANGUAGE attribute.');
      }
      playlist.sessionDataList.push(sessionData);
    } else if (name === 'EXT-X-SESSION-KEY') {
      if (attributes['METHOD'] === 'NONE') {
        utils$1.INVALIDPLAYLIST('EXT-X-SESSION-KEY: The value of the METHOD attribute MUST NOT be NONE');
      }
      const sessionKey = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
      if (playlist.sessionKeyList.some(item => sameKey(item, sessionKey))) {
        utils$1.INVALIDPLAYLIST('A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS attribute values.');
      }
      setCompatibleVersionOfKey(params, attributes);
      playlist.sessionKeyList.push(sessionKey);
    } else if (name === 'EXT-X-INDEPENDENT-SEGMENTS') {
      if (playlist.independentSegments) {
        utils$1.INVALIDPLAYLIST('EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once in a Playlist');
      }
      playlist.independentSegments = true;
    } else if (name === 'EXT-X-START') {
      if (playlist.start) {
        utils$1.INVALIDPLAYLIST('EXT-X-START tag MUST NOT appear more than once in a Playlist');
      }
      if (typeof attributes['TIME-OFFSET'] !== 'number') {
        utils$1.INVALIDPLAYLIST('EXT-X-START: TIME-OFFSET attribute is REQUIRED');
      }
      playlist.start = {offset: attributes['TIME-OFFSET'], precise: attributes['PRECISE'] || false};
    }
  }
  if (variantIsScored) {
    for (const variant of playlist.variants) {
      if (typeof variant.score !== 'number') {
        utils$1.INVALIDPLAYLIST('If any Variant Stream contains the SCORE attribute, then all Variant Streams in the Master Playlist SHOULD have a SCORE attribute');
      }
    }
  }
  if (params.isClosedCaptionsNone) {
    for (const variant of playlist.variants) {
      if (variant.closedCaptions.length > 0) {
        utils$1.INVALIDPLAYLIST('If there is a variant with CLOSED-CAPTIONS attribute of NONE, all EXT-X-STREAM-INF tags MUST have this attribute with a value of NONE');
      }
    }
  }
  return playlist;
}

function parseSegment(lines, uri, start, end, mediaSequenceNumber, discontinuitySequence, params) {
  const segment = new Segment({uri, mediaSequenceNumber, discontinuitySequence});
  let mapHint = false;
  let partHint = false;
  for (let i = start; i <= end; i++) {
    const {name, value, attributes} = lines[i];
    if (name === 'EXTINF') {
      if (!Number.isInteger(value.duration) && params.compatibleVersion < 3) {
        params.compatibleVersion = 3;
      }
      if (Math.round(value.duration) > params.targetDuration) {
        utils$1.INVALIDPLAYLIST('EXTINF duration, when rounded to the nearest integer, MUST be less than or equal to the target duration');
      }
      segment.duration = value.duration;
      segment.title = value.title;
    } else if (name === 'EXT-X-BYTERANGE') {
      if (params.compatibleVersion < 4) {
        params.compatibleVersion = 4;
      }
      segment.byterange = value;
    } else if (name === 'EXT-X-DISCONTINUITY') {
      if (segment.parts.length > 0) {
        utils$1.INVALIDPLAYLIST('EXT-X-DISCONTINUITY must appear before the first EXT-X-PART tag of the Parent Segment.');
      }
      segment.discontinuity = true;
    } else if (name === 'EXT-X-KEY') {
      if (segment.parts.length > 0) {
        utils$1.INVALIDPLAYLIST('EXT-X-KEY must appear before the first EXT-X-PART tag of the Parent Segment.');
      }
      setCompatibleVersionOfKey(params, attributes);
      segment.key = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
    } else if (name === 'EXT-X-MAP') {
      if (segment.parts.length > 0) {
        utils$1.INVALIDPLAYLIST('EXT-X-MAP must appear before the first EXT-X-PART tag of the Parent Segment.');
      }
      if (params.compatibleVersion < 5) {
        params.compatibleVersion = 5;
      }
      params.hasMap = true;
      segment.map = new MediaInitializationSection({
        uri: attributes['URI'],
        byterange: attributes['BYTERANGE']
      });
    } else if (name === 'EXT-X-PROGRAM-DATE-TIME') {
      segment.programDateTime = value;
    } else if (name === 'EXT-X-DATERANGE') {
      const attrs = {};
      for (const key of Object.keys(attributes)) {
        if (key.startsWith('SCTE35-') || key.startsWith('X-')) {
          attrs[key] = attributes[key];
        }
      }
      segment.dateRange = new DateRange({
        id: attributes['ID'],
        classId: attributes['CLASS'],
        start: attributes['START-DATE'],
        end: attributes['END-DATE'],
        duration: attributes['DURATION'],
        plannedDuration: attributes['PLANNED-DURATION'],
        endOnNext: attributes['END-ON-NEXT'],
        attributes: attrs
      });
    } else if (name === 'EXT-X-CUE-OUT') {
      segment.markers.push(new SpliceInfo({
        type: 'OUT',
        duration: (attributes && attributes.DURATION) || value
      }));
    } else if (name === 'EXT-X-CUE-IN') {
      segment.markers.push(new SpliceInfo({
        type: 'IN'
      }));
    } else if (
      name === 'EXT-X-CUE-OUT-CONT' ||
      name === 'EXT-X-CUE' ||
      name === 'EXT-OATCLS-SCTE35' ||
      name === 'EXT-X-ASSET' ||
      name === 'EXT-X-SCTE35'
    ) {
      segment.markers.push(new SpliceInfo({
        type: 'RAW',
        tagName: name,
        value
      }));
    } else if (name === 'EXT-X-PRELOAD-HINT' && !attributes['TYPE']) {
      utils$1.INVALIDPLAYLIST('EXT-X-PRELOAD-HINT: TYPE attribute is mandatory');
    } else if (name === 'EXT-X-PRELOAD-HINT' && attributes['TYPE'] === 'PART' && partHint) {
      utils$1.INVALIDPLAYLIST('Servers should not add more than one EXT-X-PRELOAD-HINT tag with the same TYPE attribute to a Playlist.');
    } else if ((name === 'EXT-X-PART' || name === 'EXT-X-PRELOAD-HINT') && !attributes['URI']) {
      utils$1.INVALIDPLAYLIST('EXT-X-PART / EXT-X-PRELOAD-HINT: URI attribute is mandatory');
    } else if (name === 'EXT-X-PRELOAD-HINT' && attributes['TYPE'] === 'MAP') {
      if (mapHint) {
        utils$1.INVALIDPLAYLIST('Servers should not add more than one EXT-X-PRELOAD-HINT tag with the same TYPE attribute to a Playlist.');
      }
      mapHint = true;
      params.hasMap = true;
      segment.map = new MediaInitializationSection({
        hint: true,
        uri: attributes['URI'],
        byterange: {length: attributes['BYTERANGE-LENGTH'], offset: attributes['BYTERANGE-START'] || 0}
      });
    } else if (name === 'EXT-X-PART' || (name === 'EXT-X-PRELOAD-HINT' && attributes['TYPE'] === 'PART')) {
      if (name === 'EXT-X-PART' && !attributes['DURATION']) {
        utils$1.INVALIDPLAYLIST('EXT-X-PART: DURATION attribute is mandatory');
      }
      if (name === 'EXT-X-PRELOAD-HINT') {
        partHint = true;
      }
      const partialSegment = new PartialSegment({
        hint: (name === 'EXT-X-PRELOAD-HINT'),
        uri: attributes['URI'],
        byterange: (name === 'EXT-X-PART' ? attributes['BYTERANGE'] : {length: attributes['BYTERANGE-LENGTH'], offset: attributes['BYTERANGE-START'] || 0}),
        duration: attributes['DURATION'],
        independent: attributes['INDEPENDENT'],
        gap: attributes['GAP']
      });
      segment.parts.push(partialSegment);
    }
  }
  return segment;
}

function parsePrefetchSegment(lines, uri, start, end, mediaSequenceNumber, discontinuitySequence, params) {
  const segment = new PrefetchSegment({uri, mediaSequenceNumber, discontinuitySequence});
  for (let i = start; i <= end; i++) {
    const {name, attributes} = lines[i];
    if (name === 'EXTINF') {
      utils$1.INVALIDPLAYLIST('A prefetch segment must not be advertised with an EXTINF tag.');
    } else if (name === 'EXT-X-DISCONTINUITY') {
      utils$1.INVALIDPLAYLIST('A prefetch segment must not be advertised with an EXT-X-DISCONTINUITY tag.');
    } else if (name === 'EXT-X-PREFETCH-DISCONTINUITY') {
      segment.discontinuity = true;
    } else if (name === 'EXT-X-KEY') {
      setCompatibleVersionOfKey(params, attributes);
      segment.key = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
    } else if (name === 'EXT-X-MAP') {
      utils$1.INVALIDPLAYLIST('Prefetch segments must not be advertised with an EXT-X-MAP tag.');
    }
  }
  return segment;
}

function parseMediaPlaylist(lines, params) {
  const playlist = new MediaPlaylist();
  let segmentStart = -1;
  let mediaSequence = 0;
  let discontinuityFound = false;
  let prefetchFound = false;
  let discontinuitySequence = 0;
  let currentKey = null;
  let currentMap = null;
  let containsParts = false;
  for (const [index, line] of lines.entries()) {
    const {name, value, attributes, category} = line;
    if (category === 'Segment') {
      if (segmentStart === -1) {
        segmentStart = index;
      }
      if (name === 'EXT-X-DISCONTINUITY') {
        discontinuityFound = true;
      }
      continue;
    }
    if (name === 'EXT-X-VERSION') {
      if (playlist.version === undefined) {
        playlist.version = value;
      } else {
        utils$1.INVALIDPLAYLIST('A Playlist file MUST NOT contain more than one EXT-X-VERSION tag.');
      }
    } else if (name === 'EXT-X-TARGETDURATION') {
      playlist.targetDuration = params.targetDuration = value;
    } else if (name === 'EXT-X-MEDIA-SEQUENCE') {
      if (playlist.segments.length > 0) {
        utils$1.INVALIDPLAYLIST('The EXT-X-MEDIA-SEQUENCE tag MUST appear before the first Media Segment in the Playlist.');
      }
      playlist.mediaSequenceBase = mediaSequence = value;
    } else if (name === 'EXT-X-DISCONTINUITY-SEQUENCE') {
      if (playlist.segments.length > 0) {
        utils$1.INVALIDPLAYLIST('The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first Media Segment in the Playlist.');
      }
      if (discontinuityFound) {
        utils$1.INVALIDPLAYLIST('The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-X-DISCONTINUITY tag.');
      }
      playlist.discontinuitySequenceBase = discontinuitySequence = value;
    } else if (name === 'EXT-X-ENDLIST') {
      playlist.endlist = true;
    } else if (name === 'EXT-X-PLAYLIST-TYPE') {
      playlist.playlistType = value;
    } else if (name === 'EXT-X-I-FRAMES-ONLY') {
      if (params.compatibleVersion < 4) {
        params.compatibleVersion = 4;
      }
      playlist.isIFrame = true;
    } else if (name === 'EXT-X-INDEPENDENT-SEGMENTS') {
      if (playlist.independentSegments) {
        utils$1.INVALIDPLAYLIST('EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once in a Playlist');
      }
      playlist.independentSegments = true;
    } else if (name === 'EXT-X-START') {
      if (playlist.start) {
        utils$1.INVALIDPLAYLIST('EXT-X-START tag MUST NOT appear more than once in a Playlist');
      }
      if (typeof attributes['TIME-OFFSET'] !== 'number') {
        utils$1.INVALIDPLAYLIST('EXT-X-START: TIME-OFFSET attribute is REQUIRED');
      }
      playlist.start = {offset: attributes['TIME-OFFSET'], precise: attributes['PRECISE'] || false};
    } else if (name === 'EXT-X-SERVER-CONTROL') {
      if (!attributes['CAN-BLOCK-RELOAD']) {
        utils$1.INVALIDPLAYLIST('EXT-X-SERVER-CONTROL: CAN-BLOCK-RELOAD=YES is mandatory for Low-Latency HLS');
      }
      playlist.lowLatencyCompatibility = {
        canBlockReload: attributes['CAN-BLOCK-RELOAD'],
        canSkipUntil: attributes['CAN-SKIP-UNTIL'],
        holdBack: attributes['HOLD-BACK'],
        partHoldBack: attributes['PART-HOLD-BACK']
      };
    } else if (name === 'EXT-X-PART-INF') {
      if (!attributes['PART-TARGET']) {
        utils$1.INVALIDPLAYLIST('EXT-X-PART-INF: PART-TARGET attribute is mandatory');
      }
      playlist.partTargetDuration = attributes['PART-TARGET'];
    } else if (name === 'EXT-X-RENDITION-REPORT') {
      if (!attributes['URI']) {
        utils$1.INVALIDPLAYLIST('EXT-X-RENDITION-REPORT: URI attribute is mandatory');
      }
      if (attributes['URI'].search(/^[a-z]+:/) === 0) {
        utils$1.INVALIDPLAYLIST('EXT-X-RENDITION-REPORT: URI must be relative to the playlist uri');
      }
      playlist.renditionReports.push(new RenditionReport({
        uri: attributes['URI'],
        lastMSN: attributes['LAST-MSN'],
        lastPart: attributes['LAST-PART']
      }));
    } else if (name === 'EXT-X-SKIP') {
      if (!attributes['SKIPPED-SEGMENTS']) {
        utils$1.INVALIDPLAYLIST('EXT-X-SKIP: SKIPPED-SEGMENTS attribute is mandatory');
      }
      if (params.compatibleVersion < 9) {
        params.compatibleVersion = 9;
      }
      playlist.skip = attributes['SKIPPED-SEGMENTS'];
      mediaSequence += playlist.skip;
    } else if (name === 'EXT-X-PREFETCH') {
      const segment = parsePrefetchSegment(lines, value, segmentStart === -1 ? index : segmentStart, index - 1, mediaSequence++, discontinuitySequence, params);
      if (segment) {
        if (segment.discontinuity) {
          segment.discontinuitySequence++;
          discontinuitySequence = segment.discontinuitySequence;
        }
        if (segment.key) {
          currentKey = segment.key;
        } else {
          segment.key = currentKey;
        }
        playlist.prefetchSegments.push(segment);
      }
      prefetchFound = true;
      segmentStart = -1;
    } else if (typeof line === 'string') {
      // uri
      if (segmentStart === -1) {
        utils$1.INVALIDPLAYLIST('A URI line is not preceded by any segment tags');
      }
      if (!playlist.targetDuration) {
        utils$1.INVALIDPLAYLIST('The EXT-X-TARGETDURATION tag is REQUIRED');
      }
      if (prefetchFound) {
        utils$1.INVALIDPLAYLIST('These segments must appear after all complete segments.');
      }
      const segment = parseSegment(lines, line, segmentStart, index - 1, mediaSequence++, discontinuitySequence, params);
      if (segment) {
        [discontinuitySequence, currentKey, currentMap] = addSegment(playlist, segment, discontinuitySequence, currentKey, currentMap);
        if (!containsParts && segment.parts.length > 0) {
          containsParts = true;
        }
      }
      segmentStart = -1;
    }
  }
  if (segmentStart !== -1) {
    const segment = parseSegment(lines, '', segmentStart, lines.length - 1, mediaSequence++, discontinuitySequence, params);
    if (segment) {
      const {parts} = segment;
      if (parts.length > 0 && !playlist.endlist && !parts[parts.length - 1].hint) {
        utils$1.INVALIDPLAYLIST('If the Playlist contains EXT-X-PART tags and does not contain an EXT-X-ENDLIST tag, the Playlist must contain an EXT-X-PRELOAD-HINT tag with a TYPE=PART attribute');
      }
      addSegment(playlist, segment, currentKey, currentMap);
      if (!containsParts && segment.parts.length > 0) {
        containsParts = true;
      }
    }
  }
  checkDateRange(playlist.segments);
  if (playlist.lowLatencyCompatibility) {
    checkLowLatencyCompatibility(playlist, containsParts);
  }
  return playlist;
}

function addSegment(playlist, segment, discontinuitySequence, currentKey, currentMap) {
  const {discontinuity, key, map, byterange, uri} = segment;
  if (discontinuity) {
    segment.discontinuitySequence = discontinuitySequence + 1;
  }
  if (!key) {
    segment.key = currentKey;
  }
  if (!map) {
    segment.map = currentMap;
  }
  if (byterange && byterange.offset === -1) {
    const {segments} = playlist;
    if (segments.length > 0) {
      const prevSegment = segments[segments.length - 1];
      if (prevSegment.byterange && prevSegment.uri === uri) {
        byterange.offset = prevSegment.byterange.offset + prevSegment.byterange.length;
      } else {
        utils$1.INVALIDPLAYLIST('If offset of EXT-X-BYTERANGE is not present, a previous Media Segment MUST be a sub-range of the same media resource');
      }
    } else {
      utils$1.INVALIDPLAYLIST('If offset of EXT-X-BYTERANGE is not present, a previous Media Segment MUST appear in the Playlist file');
    }
  }
  playlist.segments.push(segment);
  return [segment.discontinuitySequence, segment.key, segment.map];
}

function checkDateRange(segments) {
  const earliestDates = new Map();
  const rangeList = new Map();
  let hasDateRange = false;
  let hasProgramDateTime = false;
  for (let i = segments.length - 1; i >= 0; i--) {
    const {programDateTime, dateRange} = segments[i];
    if (programDateTime) {
      hasProgramDateTime = true;
    }
    if (dateRange && dateRange.start) {
      hasDateRange = true;
      if (dateRange.endOnNext && (dateRange.end || dateRange.duration)) {
        utils$1.INVALIDPLAYLIST('An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST NOT contain DURATION or END-DATE attributes.');
      }
      const start = dateRange.start.getTime();
      const duration = dateRange.duration || 0;
      if (dateRange.end && dateRange.duration) {
        if ((start + duration * 1000) !== dateRange.end.getTime()) {
          utils$1.INVALIDPLAYLIST('END-DATE MUST be equal to the value of the START-DATE attribute plus the value of the DURATION');
        }
      }
      if (dateRange.endOnNext) {
        dateRange.end = earliestDates.get(dateRange.classId);
      }
      earliestDates.set(dateRange.classId, dateRange.start);
      const end = dateRange.end ? dateRange.end.getTime() : dateRange.start.getTime() + (dateRange.duration || 0) * 1000;
      const range = rangeList.get(dateRange.classId);
      if (range) {
        for (const entry of range) {
          if ((entry.start <= start && entry.end > start) || (entry.start >= start && entry.start < end)) {
            utils$1.INVALIDPLAYLIST('DATERANGE tags with the same CLASS should not overlap');
          }
        }
        range.push({start, end});
      } else {
        rangeList.set(dateRange.classId, [{start, end}]);
      }
    }
  }
  if (hasDateRange && !hasProgramDateTime) {
    utils$1.INVALIDPLAYLIST('If a Playlist contains an EXT-X-DATERANGE tag, it MUST also contain at least one EXT-X-PROGRAM-DATE-TIME tag.');
  }
}

function checkLowLatencyCompatibility({lowLatencyCompatibility, targetDuration, partTargetDuration, segments, renditionReports}, containsParts) {
  const {canSkipUntil, holdBack, partHoldBack} = lowLatencyCompatibility;
  if (canSkipUntil < targetDuration * 6) {
    utils$1.INVALIDPLAYLIST('The Skip Boundary must be at least six times the EXT-X-TARGETDURATION.');
  }
  // Its value is a floating-point number of seconds and .
  if (holdBack < targetDuration * 3) {
    utils$1.INVALIDPLAYLIST('HOLD-BACK must be at least three times the EXT-X-TARGETDURATION.');
  }
  if (containsParts) {
    if (partTargetDuration === undefined) {
      utils$1.INVALIDPLAYLIST('EXT-X-PART-INF is required if a Playlist contains one or more EXT-X-PART tags');
    }
    if (partHoldBack === undefined) {
      utils$1.INVALIDPLAYLIST('EXT-X-PART: PART-HOLD-BACK attribute is mandatory');
    }
    if (partHoldBack < partTargetDuration) {
      utils$1.INVALIDPLAYLIST('PART-HOLD-BACK must be at least PART-TARGET');
    }
    for (const [segmentIndex, {parts}] of segments.entries()) {
      if (parts.length > 0 && segmentIndex < segments.length - 3) {
        utils$1.INVALIDPLAYLIST('Remove EXT-X-PART tags from the Playlist after they are greater than three target durations from the end of the Playlist.');
      }
      for (const [partIndex, {duration}] of parts.entries()) {
        if (duration === undefined) {
          continue;
        }
        if (duration > partTargetDuration) {
          utils$1.INVALIDPLAYLIST('PART-TARGET is the maximum duration of any Partial Segment');
        }
        if (partIndex < parts.length - 1 && duration < partTargetDuration * 0.85) {
          utils$1.INVALIDPLAYLIST('All Partial Segments except the last part of a segment must have a duration of at least 85% of PART-TARGET');
        }
      }
    }
  }
  for (const report of renditionReports) {
    const lastSegment = segments[segments.length - 1];
    if (!report.lastMSN) {
      report.lastMSN = lastSegment.mediaSequenceNumber;
    }
    if (!report.lastPart && lastSegment.parts.length > 0) {
      report.lastPart = lastSegment.parts.length - 1;
    }
  }
}

function CHECKTAGCATEGORY(category, params) {
  if (category === 'Segment' || category === 'MediaPlaylist') {
    if (params.isMasterPlaylist === undefined) {
      params.isMasterPlaylist = false;
      return;
    }
    if (params.isMasterPlaylist) {
      MIXEDTAGS();
    }
    return;
  }
  if (category === 'MasterPlaylist') {
    if (params.isMasterPlaylist === undefined) {
      params.isMasterPlaylist = true;
      return;
    }
    if (params.isMasterPlaylist === false) {
      MIXEDTAGS();
    }
  }
  // category === 'Basic' or 'MediaorMasterPlaylist' or 'Unknown'
}

function parseTag(line, params) {
  const [name, param] = splitTag(line);
  const category = getTagCategory(name);
  CHECKTAGCATEGORY(category, params);
  if (category === 'Unknown') {
    return null;
  }
  if (category === 'MediaPlaylist' && name !== 'EXT-X-RENDITION-REPORT' && name !== 'EXT-X-PREFETCH') {
    if (params.hash[name]) {
      utils$1.INVALIDPLAYLIST('There MUST NOT be more than one Media Playlist tag of each type in any Media Playlist');
    }
    params.hash[name] = true;
  }
  const [value, attributes] = parseTagParam(name, param);
  return {name, category, value, attributes};
}

function lexicalParse(text, params) {
  const lines = [];
  for (const l of text.split('\n')) {
    // V8 has garbage collection issues when cleaning up substrings split from strings greater
    // than 13 characters so before we continue we need to safely copy over each line so that it
    // doesn't hold any reference to the containing string.
    const line = Buffer.from(l.trim()).toString();
    if (!line) {
      // empty line
      continue;
    }
    if (line.startsWith('#')) {
      if (line.startsWith('#EXT')) {
        // tag
        const tag = parseTag(line, params);
        if (tag) {
          lines.push(tag);
        }
      }
      // comment
      continue;
    }
    // uri
    lines.push(line);
  }
  if (lines.length === 0 || lines[0].name !== 'EXTM3U') {
    utils$1.INVALIDPLAYLIST('The EXTM3U tag MUST be the first line.');
  }
  return lines;
}

function semanticParse(lines, params) {
  let playlist;
  if (params.isMasterPlaylist) {
    playlist = parseMasterPlaylist(lines, params);
  } else {
    playlist = parseMediaPlaylist(lines, params);
    if (!playlist.isIFrame && params.hasMap && params.compatibleVersion < 6) {
      params.compatibleVersion = 6;
    }
  }
  if (params.compatibleVersion > 1) {
    if (!playlist.version || playlist.version < params.compatibleVersion) {
      utils$1.INVALIDPLAYLIST(`EXT-X-VERSION needs to be ${params.compatibleVersion} or higher.`);
    }
  }
  return playlist;
}

function parse$1(text) {
  const params = {
    version: undefined,
    isMasterPlaylist: undefined,
    hasMap: false,
    targetDuration: 0,
    compatibleVersion: 1,
    isClosedCaptionsNone: false,
    hash: {}
  };

  const lines = lexicalParse(text, params);
  const playlist = semanticParse(lines, params);
  playlist.source = text;
  return playlist;
}

var parse_1 = parse$1;

const utils = utils$3;

const ALLOW_REDUNDANCY = [
  '#EXTINF',
  '#EXT-X-BYTERANGE',
  '#EXT-X-DISCONTINUITY',
  '#EXT-X-STREAM-INF',
  '#EXT-X-CUE-OUT',
  '#EXT-X-CUE-IN',
  '#EXT-X-KEY',
  '#EXT-X-MAP'
];

const SKIP_IF_REDUNDANT = [
  '#EXT-X-MEDIA'
];

class LineArray extends Array {
  constructor(baseUri) {
    super();
    this.baseUri = baseUri;
  }

  // @override
  push(...elems) {
    // redundancy check
    for (const elem of elems) {
      if (!elem.startsWith('#')) {
        super.push(elem);
        continue;
      }
      if (ALLOW_REDUNDANCY.some(item => elem.startsWith(item))) {
        super.push(elem);
        continue;
      }
      if (this.includes(elem)) {
        if (SKIP_IF_REDUNDANT.some(item => elem.startsWith(item))) {
          continue;
        }
        utils.INVALIDPLAYLIST(`Redundant item (${elem})`);
      }
      super.push(elem);
    }
  }
}

function buildDecimalFloatingNumber(num, fixed) {
  let roundFactor = 1000;
  if (fixed) {
    roundFactor = 10 ** fixed;
  }
  const rounded = Math.round(num * roundFactor) / roundFactor;
  return fixed ? rounded.toFixed(fixed) : rounded;
}

function getNumberOfDecimalPlaces(num) {
  const str = num.toString(10);
  const index = str.indexOf('.');
  if (index === -1) {
    return 0;
  }
  return str.length - index - 1;
}

function buildMasterPlaylist(lines, playlist) {
  for (const sessionData of playlist.sessionDataList) {
    lines.push(buildSessionData(sessionData));
  }
  for (const sessionKey of playlist.sessionKeyList) {
    lines.push(buildKey(sessionKey, true));
  }
  for (const variant of playlist.variants) {
    buildVariant(lines, variant);
  }
}

function buildSessionData(sessionData) {
  const attrs = [`DATA-ID="${sessionData.id}"`];
  if (sessionData.language) {
    attrs.push(`LANGUAGE="${sessionData.language}"`);
  }
  if (sessionData.value) {
    attrs.push(`VALUE="${sessionData.value}"`);
  } else if (sessionData.uri) {
    attrs.push(`URI="${sessionData.uri}"`);
  }
  return `#EXT-X-SESSION-DATA:${attrs.join(',')}`;
}

function buildKey(key, isSessionKey) {
  const name = isSessionKey ? '#EXT-X-SESSION-KEY' : '#EXT-X-KEY';
  const attrs = [`METHOD=${key.method}`];
  if (key.uri) {
    attrs.push(`URI="${key.uri}"`);
  }
  if (key.iv) {
    if (key.iv.length !== 16) {
      utils.INVALIDPLAYLIST('IV must be a 128-bit unsigned integer');
    }
    attrs.push(`IV=${utils.byteSequenceToHex(key.iv)}`);
  }
  if (key.format) {
    attrs.push(`KEYFORMAT="${key.format}"`);
  }
  if (key.formatVersion) {
    attrs.push(`KEYFORMATVERSIONS="${key.formatVersion}"`);
  }
  return `${name}:${attrs.join(',')}`;
}

function buildVariant(lines, variant) {
  const name = variant.isIFrameOnly ? '#EXT-X-I-FRAME-STREAM-INF' : '#EXT-X-STREAM-INF';
  const attrs = [`BANDWIDTH=${variant.bandwidth}`];
  if (variant.averageBandwidth) {
    attrs.push(`AVERAGE-BANDWIDTH=${variant.averageBandwidth}`);
  }
  if (variant.isIFrameOnly) {
    attrs.push(`URI="${variant.uri}"`);
  }
  if (variant.codecs) {
    attrs.push(`CODECS="${variant.codecs}"`);
  }
  if (variant.resolution) {
    attrs.push(`RESOLUTION=${variant.resolution.width}x${variant.resolution.height}`);
  }
  if (variant.frameRate) {
    attrs.push(`FRAME-RATE=${buildDecimalFloatingNumber(variant.frameRate, 3)}`);
  }
  if (variant.hdcpLevel) {
    attrs.push(`HDCP-LEVEL=${variant.hdcpLevel}`);
  }
  if (variant.audio.length > 0) {
    attrs.push(`AUDIO="${variant.audio[0].groupId}"`);
    for (const rendition of variant.audio) {
      lines.push(buildRendition(rendition));
    }
  }
  if (variant.video.length > 0) {
    attrs.push(`VIDEO="${variant.video[0].groupId}"`);
    for (const rendition of variant.video) {
      lines.push(buildRendition(rendition));
    }
  }
  if (variant.subtitles.length > 0) {
    attrs.push(`SUBTITLES="${variant.subtitles[0].groupId}"`);
    for (const rendition of variant.subtitles) {
      lines.push(buildRendition(rendition));
    }
  }
  if (utils.getOptions().allowClosedCaptionsNone && variant.closedCaptions.length === 0) {
    attrs.push(`CLOSED-CAPTIONS=NONE`);
  } else if (variant.closedCaptions.length > 0) {
    attrs.push(`CLOSED-CAPTIONS="${variant.closedCaptions[0].groupId}"`);
    for (const rendition of variant.closedCaptions) {
      lines.push((buildRendition(rendition)));
    }
  }
  if (variant.score) {
    attrs.push(`SCORE=${variant.score}`);
  }
  if (variant.allowedCpc) {
    const list = [];
    for (const {format, cpcList} of variant.allowedCpc) {
      list.push(`${format}:${cpcList.join('/')}`);
    }
    attrs.push(`ALLOWED-CPC="${list.join(',')}"`);
  }
  if (variant.videoRange) {
    attrs.push(`VIDEO-RANGE=${variant.videoRange}`);
  }
  if (variant.stableVariantId) {
    attrs.push(`STABLE-VARIANT-ID="${variant.stableVariantId}"`);
  }
  lines.push(`${name}:${attrs.join(',')}`);
  if (!variant.isIFrameOnly) {
    lines.push(`${variant.uri}`);
  }
}

function buildRendition(rendition) {
  const attrs = [
    `TYPE=${rendition.type}`,
    `GROUP-ID="${rendition.groupId}"`,
    `NAME="${rendition.name}"`
  ];
  if (rendition.isDefault !== undefined) {
    attrs.push(`DEFAULT=${rendition.isDefault ? 'YES' : 'NO'}`);
  }
  if (rendition.autoselect !== undefined) {
    attrs.push(`AUTOSELECT=${rendition.autoselect ? 'YES' : 'NO'}`);
  }
  if (rendition.forced !== undefined) {
    attrs.push(`FORCED=${rendition.forced ? 'YES' : 'NO'}`);
  }
  if (rendition.language) {
    attrs.push(`LANGUAGE="${rendition.language}"`);
  }
  if (rendition.assocLanguage) {
    attrs.push(`ASSOC-LANGUAGE="${rendition.assocLanguage}"`);
  }
  if (rendition.instreamId) {
    attrs.push(`INSTREAM-ID="${rendition.instreamId}"`);
  }
  if (rendition.characteristics) {
    attrs.push(`CHARACTERISTICS="${rendition.characteristics}"`);
  }
  if (rendition.channels) {
    attrs.push(`CHANNELS="${rendition.channels}"`);
  }
  if (rendition.uri) {
    attrs.push(`URI="${rendition.uri}"`);
  }
  return `#EXT-X-MEDIA:${attrs.join(',')}`;
}

function buildMediaPlaylist(lines, playlist) {
  let lastKey = '';
  let lastMap = '';
  let unclosedCueIn = false;

  if (playlist.targetDuration) {
    lines.push(`#EXT-X-TARGETDURATION:${playlist.targetDuration}`);
  }
  if (playlist.lowLatencyCompatibility) {
    const {canBlockReload, canSkipUntil, holdBack, partHoldBack} = playlist.lowLatencyCompatibility;
    const params = [];
    params.push(`CAN-BLOCK-RELOAD=${canBlockReload ? 'YES' : 'NO'}`);
    if (canSkipUntil !== undefined) {
      params.push(`CAN-SKIP-UNTIL=${canSkipUntil}`);
    }
    if (holdBack !== undefined) {
      params.push(`HOLD-BACK=${holdBack}`);
    }
    if (partHoldBack !== undefined) {
      params.push(`PART-HOLD-BACK=${partHoldBack}`);
    }
    lines.push(`#EXT-X-SERVER-CONTROL:${params.join(',')}`);
  }
  if (playlist.partTargetDuration) {
    lines.push(`#EXT-X-PART-INF:PART-TARGET=${playlist.partTargetDuration}`);
  }
  if (playlist.mediaSequenceBase) {
    lines.push(`#EXT-X-MEDIA-SEQUENCE:${playlist.mediaSequenceBase}`);
  }
  if (playlist.discontinuitySequenceBase) {
    lines.push(`#EXT-X-DISCONTINUITY-SEQUENCE:${playlist.discontinuitySequenceBase}`);
  }
  if (playlist.playlistType) {
    lines.push(`#EXT-X-PLAYLIST-TYPE:${playlist.playlistType}`);
  }
  if (playlist.isIFrame) {
    lines.push(`#EXT-X-I-FRAMES-ONLY`);
  }
  if (playlist.skip > 0) {
    lines.push(`#EXT-X-SKIP:SKIPPED-SEGMENTS=${playlist.skip}`);
  }
  for (const segment of playlist.segments) {
    let markerType = '';
    [lastKey, lastMap, markerType] = buildSegment(lines, segment, lastKey, lastMap, playlist.version);
    if (markerType === 'OUT') {
      unclosedCueIn = true;
    } else if (markerType === 'IN' && unclosedCueIn) {
      unclosedCueIn = false;
    }
  }
  if (playlist.playlistType === 'VOD' && unclosedCueIn) {
    lines.push('#EXT-X-CUE-IN');
  }
  if (playlist.prefetchSegments.length > 2) {
    utils.INVALIDPLAYLIST('The server must deliver no more than two prefetch segments');
  }
  for (const segment of playlist.prefetchSegments) {
    if (segment.discontinuity) {
      lines.push(`#EXT-X-PREFETCH-DISCONTINUITY`);
    }
    lines.push(`#EXT-X-PREFETCH:${segment.uri}`);
  }
  if (playlist.endlist) {
    lines.push(`#EXT-X-ENDLIST`);
  }
  for (const report of playlist.renditionReports) {
    const params = [];
    params.push(`URI="${report.uri}"`, `LAST-MSN=${report.lastMSN}`);
    if (report.lastPart !== undefined) {
      params.push(`LAST-PART=${report.lastPart}`);
    }
    lines.push(`#EXT-X-RENDITION-REPORT:${params.join(',')}`);
  }
}

function buildSegment(lines, segment, lastKey, lastMap, version = 1) {
  let hint = false;
  let markerType = '';

  if (segment.discontinuity) {
    lines.push(`#EXT-X-DISCONTINUITY`);
  }
  if (segment.key) {
    const line = buildKey(segment.key);
    if (line !== lastKey) {
      lines.push(line);
      lastKey = line;
    }
  }
  if (segment.map) {
    const line = buildMap(segment.map);
    if (line !== lastMap) {
      lines.push(line);
      lastMap = line;
    }
  }
  if (segment.programDateTime) {
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${utils.formatDate(segment.programDateTime)}`);
  }
  if (segment.dateRange) {
    lines.push(buildDateRange(segment.dateRange));
  }
  if (segment.markers.length > 0) {
    markerType = buildMarkers(lines, segment.markers);
  }
  if (segment.parts.length > 0) {
    hint = buildParts(lines, segment.parts);
  }
  if (hint) {
    return [lastKey, lastMap];
  }
  const duration = version < 3 ? Math.round(segment.duration) : buildDecimalFloatingNumber(segment.duration, getNumberOfDecimalPlaces(segment.duration));
  lines.push(`#EXTINF:${duration},${unescape(encodeURIComponent(segment.title || ''))}`);
  if (segment.byterange) {
    lines.push(`#EXT-X-BYTERANGE:${buildByteRange(segment.byterange)}`);
  }
  Array.prototype.push.call(lines, `${segment.uri}`); // URIs could be redundant when EXT-X-BYTERANGE is used
  return [lastKey, lastMap, markerType];
}

function buildMap(map) {
  const attrs = [`URI="${map.uri}"`];
  if (map.byterange) {
    attrs.push(`BYTERANGE="${buildByteRange(map.byterange)}"`);
  }
  return `#EXT-X-MAP:${attrs.join(',')}`;
}

function buildByteRange({offset, length}) {
  return `${length}@${offset}`;
}

function buildDateRange(dateRange) {
  const attrs = [
    `ID="${dateRange.id}"`
  ];
  if (dateRange.start) {
    attrs.push(`START-DATE="${utils.formatDate(dateRange.start)}"`);
  }
  if (dateRange.end) {
    attrs.push(`END-DATE="${dateRange.end}"`);
  }
  if (dateRange.duration) {
    attrs.push(`DURATION=${dateRange.duration}`);
  }
  if (dateRange.plannedDuration) {
    attrs.push(`PLANNED-DURATION=${dateRange.plannedDuration}`);
  }
  if (dateRange.classId) {
    attrs.push(`CLASS="${dateRange.classId}"`);
  }
  if (dateRange.endOnNext) {
    attrs.push(`END-ON-NEXT=YES`);
  }
  for (const key of Object.keys(dateRange.attributes)) {
    if (key.startsWith('X-')) {
      if (typeof dateRange.attributes[key] === 'number') {
        attrs.push(`${key}=${dateRange.attributes[key]}`);
      } else {
        attrs.push(`${key}="${dateRange.attributes[key]}"`);
      }
    } else if (key.startsWith('SCTE35-')) {
      attrs.push(`${key}=${utils.byteSequenceToHex(dateRange.attributes[key])}`);
    }
  }
  return `#EXT-X-DATERANGE:${attrs.join(',')}`;
}

function buildMarkers(lines, markers) {
  let type = '';
  for (const marker of markers) {
    if (marker.type === 'OUT') {
      type = 'OUT';
      lines.push(`#EXT-X-CUE-OUT:DURATION=${marker.duration}`);
    } else if (marker.type === 'IN') {
      type = 'IN';
      lines.push('#EXT-X-CUE-IN');
    } else if (marker.type === 'RAW') {
      const value = marker.value ? `:${marker.value}` : '';
      lines.push(`#${marker.tagName}${value}`);
    }
  }
  return type;
}

function buildParts(lines, parts) {
  let hint = false;
  for (const part of parts) {
    if (part.hint) {
      const params = [];
      params.push('TYPE=PART', `URI="${part.uri}"`);
      if (part.byterange) {
        const {offset, length} = part.byterange;
        params.push(`BYTERANGE-START=${offset}`);
        if (length) {
          params.push(`BYTERANGE-LENGTH=${length}`);
        }
      }
      lines.push(`#EXT-X-PRELOAD-HINT:${params.join(',')}`);
      hint = true;
    } else {
      const params = [];
      params.push(`DURATION=${part.duration}`, `URI="${part.uri}"`);
      if (part.byterange) {
        params.push(`BYTERANGE=${buildByteRange(part.byterange)}`);
      }
      if (part.independent) {
        params.push('INDEPENDENT=YES');
      }
      if (part.gap) {
        params.push('GAP=YES');
      }
      lines.push(`#EXT-X-PART:${params.join(',')}`);
    }
  }
  return hint;
}

function stringify$1(playlist) {
  utils.PARAMCHECK(playlist);
  utils.ASSERT('Not a playlist', playlist.type === 'playlist');
  const lines = new LineArray(playlist.uri);
  lines.push('#EXTM3U');
  if (playlist.version) {
    lines.push(`#EXT-X-VERSION:${playlist.version}`);
  }
  if (playlist.independentSegments) {
    lines.push('#EXT-X-INDEPENDENT-SEGMENTS');
  }
  if (playlist.start) {
    lines.push(`#EXT-X-START:TIME-OFFSET=${buildDecimalFloatingNumber(playlist.start.offset)}${playlist.start.precise ? ',PRECISE=YES' : ''}`);
  }
  if (playlist.isMasterPlaylist) {
    buildMasterPlaylist(lines, playlist);
  } else {
    buildMediaPlaylist(lines, playlist);
  }
  // console.log('<<<');
  // console.log(lines.join('\n'));
  // console.log('>>>');
  return lines.join('\n');
}

var stringify_1 = stringify$1;

/*! Copyright Kuu Miyazaki. SPDX-License-Identifier: MIT */

const {getOptions, setOptions} = utils$3;
const parse = parse_1;
const stringify = stringify_1;
const types = types$1;

var hlsParser = {
  parse,
  stringify,
  types,
  getOptions,
  setOptions
};

function ParseBitrateRange(bitrate, tolerance) {
    var lowerBound = 0;
    var upperBound = 0;
    var _a = bitrate.split('-'), lowerBoundStr = _a[0], upperBoundStr = _a[1];
    // CASE: Range has not been provided as input,
    // as upperBoundStr is undefined
    if (upperBoundStr === undefined) {
        lowerBound = Number(lowerBoundStr) - tolerance;
        upperBound = Number(lowerBoundStr) + tolerance;
        // CASE: Range has been provided as input
    }
    else {
        lowerBound = Number(lowerBoundStr);
        upperBound = Number(upperBoundStr);
        // CASE: Range has been provided as input, with
        // no upperBound. Thus set upperBound as MAX
        if (upperBound == 0)
            upperBound = Number.MAX_VALUE;
    }
    if (lowerBound >= upperBound) {
        lowerBound = -1;
        upperBound = -1;
    }
    return [lowerBound, upperBound];
}
function toNumber(str, radix) {
    if (radix === void 0) { radix = 10; }
    if (typeof str === 'number') {
        return str;
    }
    var num = radix === 10 ? Number.parseFloat(str) : Number.parseInt(str);
    if (Number.isNaN(num)) {
        return 0;
    }
    return num;
}
function parseResolution(maxSupportedResolution) {
    var pair = maxSupportedResolution.split('x');
    return { width: toNumber(pair[0]), height: toNumber(pair[1]) };
}

// Initialize hls-parser in strictMode to
// disable silent logging of internal errors
hlsParser.setOptions({ strictMode: true });
/**
 * @enum Defines types of manifest
 */
var ManifestType;
(function (ManifestType) {
    ManifestType["MASTER_MANIFEST"] = "Master Manifest";
    ManifestType["MEDIA_MANIFEST"] = "Media Manifest";
})(ManifestType || (ManifestType = {}));
/**
 * This class exposes APIs to cater Manifest Personalization using edgeworkers.
 */
var hls = /** @class */ (function () {
    function hls() {
    }
    /**
     * This API parses plain text playlist & creates structured JS object.
     *
     * @param text
     *
     * @returns It returns the structured JS object created from plain text playlist.
     */
    hls.parseManifest = function (text) {
        if (typeof text !== 'string') {
            throw new Error('HLSParser: parseManifest api failed - Invalid input type, expected input type string.');
        }
        if (text === '') {
            throw new Error('HLSParser: parseManifest api failed - Empty input value, expected non-empty string as input.');
        }
        try {
            return hlsParser.parse(text);
        }
        catch (error) {
            throw new Error("HLSParser: hls-parser parse api failed - ".concat(error.message));
        }
    };
    /**
     * This API converts structured JS object to plain text playlist.
     *
     * @param playlistObj
     *
     * @returns It returns the plain text playlist recreated from structured JS object.
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    hls.populateManifest = function (playlistObj) {
        if (!playlistObj) {
            throw new Error('HLSParser: populateManifest api failed - Empty playlist object, expected playlist object created using parseManifest api.');
        }
        try {
            return hlsParser.stringify(playlistObj);
        }
        catch (error) {
            throw new Error("HLSParser: hls-parser stringify api failed - ".concat(error.message));
        }
    };
    /**
     * This API returns type of manifest that was passed to created
     * structured JS object.
     *
     * @param playlistObj
     *
     * @returns Returns string MASTER_MANIFEST / MEDIA_MANIFEST.
     */
    hls.getManifestType = function (playlistObj) {
        if (!playlistObj) {
            throw new Error('HLSParser: getManifestType api failed - Empty playlist object, expected playlist object created using parseManifest api.');
        }
        try {
            if (playlistObj.isMasterPlaylist)
                return ManifestType.MASTER_MANIFEST;
            else
                return ManifestType.MEDIA_MANIFEST;
        }
        catch (error) {
            throw new Error("HLSParser: getManifestType api failed - Playlist type initialization not found in playlistObj - ".concat(error.message));
        }
    };
    /**
     * This API preserves variants with given bitrate in the manifest & removes any other
     * variants. It accepts single bitrate as a string or a single range of bitrates
     * separated by '-' as a string.
     *
     * @param playlistObj
     * @param bitrates
     * @param tolerance
     *
     * @returns It returns boolean value where true infers that a variant matching given
     * bitrate is removed & false infers that no variant is removed from the passed JS object.
     */
    hls.removeVariantsByBitrate = function (playlistObj, bitrates, tolerance) {
        if (tolerance === void 0) { tolerance = 100000; }
        if (!playlistObj) {
            throw new Error('HLSParser: removeVariantsByBitrate api failed - Empty playlist object, expected playlist object created using parseManifest api.');
        }
        if (!bitrates || !Array.isArray(bitrates) || bitrates.length == 0) {
            throw new Error('HLSParser: removeVariantsByBitrate api failed - Empty bitrates array, expected bitrates array of strings.');
        }
        if (tolerance < 0) {
            throw new Error('HLSParser: removeVariantsByBitrate api failed - Invalid tolerance value, expected non-negative tolerance value.');
        }
        var isVariantRemoved = false;
        try {
            var numOfBitrates = bitrates.length;
            var bitratesToPreserve = new Set();
            // finding bitrates to preserve in the manifest
            for (var i = 0; i < numOfBitrates; i++) {
                if (bitrates[i].length <= 0)
                    continue;
                var _a = ParseBitrateRange(bitrates[i], tolerance), lowerBound = _a[0], upperBound = _a[1];
                if (lowerBound == -1)
                    return isVariantRemoved;
                var j = 0;
                var numOfVariantsInManifest = playlistObj.variants.length;
                while (j < numOfVariantsInManifest) {
                    if (playlistObj.variants[j].bandwidth &&
                        playlistObj.variants[j].bandwidth >= lowerBound &&
                        playlistObj.variants[j].bandwidth <= upperBound) {
                        bitratesToPreserve.add(playlistObj.variants[j].bandwidth);
                    }
                    j++;
                }
            }
            // removing bitrates not in the list of bitrates to be preserved
            if (bitratesToPreserve.size > 0) {
                var j = 0;
                var numOfVariantsInManifest = playlistObj.variants.length;
                while (j < numOfVariantsInManifest) {
                    if (playlistObj.variants[j].bandwidth &&
                        !bitratesToPreserve.has(playlistObj.variants[j].bandwidth)) {
                        playlistObj.variants.splice(j, 1);
                        isVariantRemoved = true;
                        numOfVariantsInManifest--;
                    }
                    else {
                        j++;
                    }
                }
            }
        }
        catch (error) {
            throw new Error("HLSParser: removeVariantsByBitrate api failed - ".concat(error.message));
        }
        return isVariantRemoved;
    };
    /**
     * This API removes all resolutions higher than the given maximum supported resolution.
     * It accepts single resolution as string in the format <width>x<height>.
     *
     * @param playlistObj
     * @param maxSupportedResolution
     *
     * @returns It returns boolean value where true infers that a variant with resolution
     * higher than given resolution is removed & false infers that no variant is removed
     * from the passed JS object.
     */
    hls.removeVariantsByResolution = function (playlistObj, maxSupportedResolution) {
        if (!playlistObj) {
            throw new Error('HLSParser: removeVariantsByResolution api failed - Empty playlist object, expected playlist object created using parseManifest api.');
        }
        if (typeof maxSupportedResolution !== 'string') {
            throw new Error('HLSParser: removeVariantsByResolution api failed - Invalid maximum supported resolution type, expected type string.');
        }
        if (maxSupportedResolution === '') {
            throw new Error('HLSParser: removeVariantsByResolution api failed - Empty maximum supported resolution value, expected non-empty string.');
        }
        var isVariantRemoved = false;
        try {
            var maxSupportedResolutionObject = parseResolution(maxSupportedResolution);
            var i = 0;
            var numOfVariantsInManifest = playlistObj.variants.length;
            while (i < numOfVariantsInManifest) {
                if (playlistObj.variants[i].resolution &&
                    (playlistObj.variants[i].resolution.width >
                        maxSupportedResolutionObject.width ||
                        playlistObj.variants[i].resolution.height >
                            maxSupportedResolutionObject.height)) {
                    playlistObj.variants.splice(i, 1);
                    isVariantRemoved = true;
                    numOfVariantsInManifest--;
                }
                else {
                    i++;
                }
            }
        }
        catch (error) {
            throw new Error("HLSParser: removeVariantsByResolution api failed - ".concat(error.message));
        }
        return isVariantRemoved;
    };
    /**
     * This API moves metadata of a variant with given resolution to the newIndex.
     * newIndex is an optional parameter, if not passed the variant is moved to 0th
     * index. If there are multiple occurences of given resolution, this function
     * brings all of them in sequence starting from newIndex. Rest of the variants
     * metadata will slide downwards in the manifest.
     *
     * @param playlistObj
     * @param resolution
     * @param newIndex
     *
     * @returns It returns a number which infers the next index the variant will be moved to.
     */
    hls.moveVariantToIndex = function (playlistObj, resolution, newIndex) {
        if (newIndex === void 0) { newIndex = 0; }
        if (!playlistObj) {
            throw new Error('HLSParser: moveVariantToIndex api failed - Empty playlist object, expected playlist object created using parseManifest api.');
        }
        if (typeof resolution !== 'string') {
            throw new Error('HLSParser: moveVariantToIndex api failed - Invalid resolution type, expected type string.');
        }
        if (resolution === '') {
            throw new Error('HLSParser: moveVariantToIndex api failed - Empty resolution value, expected non-empty string.');
        }
        if (newIndex < 0) {
            throw new Error('HLSParser: moveVariantToIndex api failed - Invalid new index value, expected non-negative new index value.');
        }
        try {
            // review this if return value required
            if (!playlistObj || !resolution || newIndex < 0)
                return -1;
            var i = 0;
            var numOfVariantsInManifest = playlistObj.variants.length;
            var resolutionObject = parseResolution(resolution);
            while (i < numOfVariantsInManifest &&
                newIndex < numOfVariantsInManifest) {
                if (playlistObj.variants[i].resolution &&
                    playlistObj.variants[i].resolution.width === resolutionObject.width &&
                    playlistObj.variants[i].resolution.height === resolutionObject.height) {
                    // if current index of given is equal to newIndex, we don't move the resolution object
                    if (i != newIndex) {
                        playlistObj.variants.splice(newIndex, 0, playlistObj.variants.splice(i, 1)[0]);
                    }
                    newIndex++;
                }
                i++;
            }
        }
        catch (error) {
            throw new Error("HLSParser: moveVariantToIndex api failed - ".concat(error.message));
        }
        return newIndex;
    };
    /**
     * This API moves metadata of all variants with given resolutions
     * to the top. It will keep the order of these variants same as provided in the array of
     * resolutions. Providing multiple entries of same resolution can cause undesired results.
     *
     * @param playlistObj
     * @param resolutions
     * @param newIndex
     *
     * @returns It returns a boolean where true infers that atleast one of the resolution order
     * is updated as per given list of resolutions.
     */
    hls.updateResolutionOrder = function (playlistObj, resolutions) {
        if (!playlistObj) {
            throw new Error('HLSParser: updateResolutionOrder api failed - Empty playlistObj object, expected playlistObj object created using parseManifest api.');
        }
        if (!resolutions ||
            !Array.isArray(resolutions) ||
            resolutions.length == 0) {
            throw new Error('HLSParser: updateResolutionOrder api failed - Empty list of resolutions, expected non-empty list of resolutions.');
        }
        var isResolutionOrderUpdated = false;
        try {
            if (!playlistObj || !resolutions || resolutions.length == 0)
                return isResolutionOrderUpdated;
            var newIndex = 0;
            var numOfResToBeUpdated = resolutions.length;
            var numOfVariantsInManifest = playlistObj.variants.length;
            if (numOfResToBeUpdated > numOfVariantsInManifest)
                return isResolutionOrderUpdated;
            for (var i = 0; i < numOfResToBeUpdated; i++) {
                var nextIndex = this.moveVariantToIndex(playlistObj, resolutions[i], newIndex);
                if (nextIndex != newIndex) {
                    isResolutionOrderUpdated = true;
                    newIndex = nextIndex;
                }
            }
        }
        catch (error) {
            throw new Error("HLSParser: updateResolutionOrder api failed - ".concat(error.message));
        }
        return isResolutionOrderUpdated;
    };
    /**
     * This API preserves audio renditions with given language in the JS object & removes
     * any other audio renditions. It accepts an array of strings with single / multiple
     * langugages to be preserved.
     *
     * @param playlistObj
     * @param languagesToPreserve
     *
     * @returns It returns a boolean where true infers that atleast one audio rendition with
     * language not matching the list of languages was removed.
     */
    hls.removeAudioRenditionsByLanguage = function (playlistObj, languagesToPreserve) {
        if (!playlistObj) {
            throw new Error('HLSParser: removeAudioRenditionsByLanguage api failed - Empty playlistObj object, expected playlistObj object created using parseManifest api.');
        }
        if (!languagesToPreserve ||
            !Array.isArray(languagesToPreserve) ||
            languagesToPreserve.length == 0) {
            throw new Error('HLSParser: removeAudioRenditionsByLanguage api failed - Empty list of languages to preserve, expected non-empty list of languages to preserve.');
        }
        var isAudioRenditionRemoved = false;
        try {
            if (!playlistObj ||
                !languagesToPreserve ||
                languagesToPreserve.length == 0)
                return isAudioRenditionRemoved;
            var numOfVariantsInManifest = playlistObj.variants.length;
            for (var j = 0; j < numOfVariantsInManifest; j++) {
                var k = 0;
                var numOfAudioRenditions = playlistObj.variants[j].audio.length;
                while (k < numOfAudioRenditions) {
                    if (languagesToPreserve.indexOf(playlistObj.variants[j].audio[k].language) < 0) {
                        playlistObj.variants[j].audio.splice(k, 1);
                        isAudioRenditionRemoved = true;
                        numOfAudioRenditions--;
                    }
                    else {
                        k++;
                    }
                }
            }
        }
        catch (error) {
            throw new Error("HLSParser: removeAudioRenditionsByLanguage api failed - ".concat(error.message));
        }
        return isAudioRenditionRemoved;
    };
    /**
     * This API preserves subtitle renditions with given language in the JS object &
     * removes any other subtitle renditions. It accepts an array of strings with single / multiple
     * langugages to be preserved.
     *
     * @param playlistObj
     * @param languagesToPreserve
     *
     * @returns It returns a boolean where true infers that atleast one subtitle rendition with language
     * not matching the list of languages was removed.
     */
    hls.removeSubtitleRenditionsByLanguage = function (playlistObj, languagesToPreserve) {
        if (!playlistObj) {
            throw new Error('HLSParser: removeSubtitleRenditionsByLanguage api failed - Empty playlistObj object, expected playlistObj object created using parseManifest api.');
        }
        if (!languagesToPreserve ||
            !Array.isArray(languagesToPreserve) ||
            languagesToPreserve.length == 0) {
            throw new Error('HLSParser: removeSubtitleRenditionsByLanguage api failed - Empty list of languages to preserve, expected non-empty list of languages to preserve.');
        }
        var isSubtitleRenditionRemoved = false;
        try {
            var numOfVariantsInManifest = playlistObj.variants.length;
            for (var j = 0; j < numOfVariantsInManifest; j++) {
                var k = 0;
                var numOfSubtitleRenditions = playlistObj.variants[j].subtitles.length;
                while (k < numOfSubtitleRenditions) {
                    if (languagesToPreserve.indexOf(playlistObj.variants[j].subtitles[k].language) < 0) {
                        playlistObj.variants[j].subtitles.splice(k, 1);
                        isSubtitleRenditionRemoved = true;
                        numOfSubtitleRenditions--;
                    }
                    else {
                        k++;
                    }
                }
            }
        }
        catch (error) {
            throw new Error("HLSParser: removeSubtitleRenditionsByLanguage api failed - ".concat(error.message));
        }
        return isSubtitleRenditionRemoved;
    };
    /**
     * This api inserts the auxiliary content to the main asset's playlist. This
     * auxiliary content must be present as individual segments on the origin &
     * must have have its own playlist. This auxiliary content can be inserted as
     * pre/mid/post roll i.e this auxiliary content can be added before/middle/after
     * the primary content segments.
     *
     * @param primaryPlaylistObj
     * @param bumpersList
     *
     * @returns void
     */
    hls.insertAuxiliaryContent = function (primaryPlaylistObj, bumpersList) {
        var _a;
        if (!primaryPlaylistObj) {
            throw new Error('HLSParser: insertAuxiliaryContent api failed - Empty primaryPlaylistObj object, expected primaryPlaylistObj object created using parseManifest api.');
        }
        if (!bumpersList ||
            !Array.isArray(bumpersList) ||
            bumpersList.length == 0) {
            throw new Error('HLSParser: insertAuxiliaryContent api failed - Empty bumpers list, expected non-empty list of bumpers.');
        }
        try {
            var bumpersListSize = bumpersList.length;
            var k = 0;
            var auxContentPosInPrimPlaylistArr = [];
            var elapsedSeconds = void 0;
            var primPlaylistCurrSegment = void 0;
            var auxContentPosInPrimPlaylist = void 0;
            // sort the bumpersList by afterSeconds in ascending order
            bumpersList.sort(function (a, b) { return a.afterSeconds - b.afterSeconds; });
            /**
             * Iterating list of bumpers to find absolute position of each
             * bumper in primary playlist
             */
            elapsedSeconds = 0;
            primPlaylistCurrSegment = 0;
            auxContentPosInPrimPlaylist = 0;
            for (var i = 0; i < bumpersList.length; ++i) {
                var bumper = bumpersList[i];
                // CASE: bumper is pre-roll
                if (bumper.afterSeconds == 0) {
                    // reinitializing it to 0 to support multiple instances of
                    // pre-roll content
                    auxContentPosInPrimPlaylist = 0;
                    auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;
                    primaryPlaylistObj.segments[0].discontinuity = true;
                    // CASE: bumper is mid-roll
                }
                else if (bumper.afterSeconds > 0 &&
                    bumper.afterSeconds < Number.MAX_VALUE) {
                    var segment = void 0;
                    for (var j = primPlaylistCurrSegment; j < primaryPlaylistObj.segments.length; ++j) {
                        segment = primaryPlaylistObj.segments[j];
                        if (elapsedSeconds >= bumper.afterSeconds) {
                            break;
                        }
                        elapsedSeconds += segment.duration;
                        auxContentPosInPrimPlaylist++;
                        primPlaylistCurrSegment++;
                    }
                    // this handles the case when afterSeconds value of corresponding
                    // bumper is greater than the complete primary playlist playback
                    if (primPlaylistCurrSegment !== primaryPlaylistObj.segments.length)
                        segment.discontinuity = true;
                    auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;
                    // CASE: bumper is post-roll i.e bumper.afterSeconds == 0
                }
                else if (bumper.afterSeconds == Number.MAX_VALUE) {
                    auxContentPosInPrimPlaylist = primaryPlaylistObj.segments.length;
                    auxContentPosInPrimPlaylistArr[k++] = auxContentPosInPrimPlaylist;
                }
            }
            /**
             * Initializing discontinuity attribute of first segment of each
             * bumper as true. This ensures that beginning of aux content has
             * EXT-X-DISCONTINUITY inserted
             */
            for (var key in bumpersList) {
                var bumper = bumpersList[key];
                bumper.auxContentRespBodyObj.segments[0].discontinuity = true;
            }
            /**
             * Inserting each bumper at absolute position calculated above
             */
            var auxCntSegListLen = 0;
            for (var i = 0; i < bumpersListSize; i++) {
                auxContentPosInPrimPlaylistArr[i] += auxCntSegListLen;
                (_a = primaryPlaylistObj.segments).splice.apply(_a, __spreadArray([auxContentPosInPrimPlaylistArr[i],
                    0], bumpersList[i].auxContentRespBodyObj.segments, false));
                auxCntSegListLen +=
                    bumpersList[i].auxContentRespBodyObj.segments.length;
            }
        }
        catch (error) {
            throw new Error("HLSParser: insertAuxiliaryContent api failed - ".concat(error.message));
        }
    };
    return hls;
}());

export { ManifestType, hls };
