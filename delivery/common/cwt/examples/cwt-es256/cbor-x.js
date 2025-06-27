let decoder, src, srcEnd;

try {
    decoder = new TextDecoder;
} catch (error) {}

let position$1 = 0;

const RECORD_DEFINITIONS_ID = 57342, RECORD_INLINE_ID = 57343, BUNDLED_STRINGS_ID = 57337, STOP_CODE = {};

let currentStructures, srcString, bundledStrings$1, referenceMap, packedValues, dataView, restoreMapsAsObject, currentDecoder = {}, srcStringStart = 0, srcStringEnd = 0, currentExtensions = [], currentExtensionRanges = [], defaultOptions = {
    useRecords: !1,
    mapsAsObjects: !0
}, sequentialMode = !1, inlineObjectReadThreshold = 2;

try {
    new Function("");
} catch (error) {
    inlineObjectReadThreshold = 1 / 0;
}

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
        if (token >= BUNDLED_STRINGS_ID) {
            let structure = currentStructures[8191 & token];
            if (structure) return structure.read || (structure.read = createStructureReader(structure)), 
            structure.read();
            if (token < 65536) {
                if (token == RECORD_INLINE_ID) {
                    let length = readJustLength(), id = read(), structure = read();
                    recordDefinition(id, structure);
                    let object = {};
                    if (currentDecoder.keyMap) for (let i = 2; i < length; i++) {
                        object[safeKey(currentDecoder.decodeKey(structure[i - 2]))] = read();
                    } else for (let i = 2; i < length; i++) {
                        object[safeKey(structure[i - 2])] = read();
                    }
                    return object;
                }
                if (token == RECORD_DEFINITIONS_ID) {
                    let length = readJustLength(), id = read();
                    for (let i = 2; i < length; i++) recordDefinition(id++, read());
                    return read();
                }
                if (token == BUNDLED_STRINGS_ID) return function() {
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
        if (this.slowReads++ >= inlineObjectReadThreshold) {
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
    if ("string" == typeof key) return "__proto__" === key ? "__proto_" : key;
    if ("object" != typeof key) return key.toString();
    throw new Error("Invalid property name type " + typeof key);
}

let readFixedString = readStringJS, isNativeAccelerationEnabled = !1;

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

const recordDefinition = (id, structure) => {
    let existingStructure = currentStructures[id -= 57344];
    existingStructure && existingStructure.isShared && ((currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure), 
    currentStructures[id] = structure, structure.read = createStructureReader(structure);
};

currentExtensions[105] = data => {
    let length = data.length, structure = data[1];
    recordDefinition(data[0], structure);
    let object = {};
    for (let i = 2; i < length; i++) {
        object[safeKey(structure[i - 2])] = data[i];
    }
    return object;
}, currentExtensions[14] = value => bundledStrings$1 ? bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 += value) : new Tag(value, 14), 
currentExtensions[15] = value => bundledStrings$1 ? bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value) : new Tag(value, 15);

let glbl = {
    Error,
    RegExp
};

currentExtensions[27] = data => (glbl[data[0]] || Error)(data[1], data[2]);

const packedTable = read => {
    if (132 != src[position$1++]) {
        let error = new Error("Packed values structure must be followed by a 4 element array");
        throw src.length < position$1 && (error.incomplete = !0), error;
    }
    let newPackedValues = read();
    if (!newPackedValues || !newPackedValues.length) {
        let error = new Error("Packed values structure must be followed by a 4 element array");
        throw error.incomplete = !0, error;
    }
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
    let error = new Error("No support for non-integer packed references yet");
    throw void 0 === data && (error.incomplete = !0), error;
}, currentExtensions[28] = read => {
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
    let bytesPerElement, dvMethod = "get" + TypedArray.name.slice(0, -5);
    "function" == typeof TypedArray ? bytesPerElement = TypedArray.BYTES_PER_ELEMENT : TypedArray = null;
    for (let littleEndian = 0; littleEndian < 2; littleEndian++) {
        if (!littleEndian && 1 == bytesPerElement) continue;
        let sizeShift = 2 == bytesPerElement ? 1 : 4 == bytesPerElement ? 2 : 3;
        currentExtensions[littleEndian ? tag : tag - 4] = 1 == bytesPerElement || littleEndian == isLittleEndianMachine$1 ? buffer => {
            if (!TypedArray) throw new Error("Could not find typed array for code " + tag);
            return currentDecoder.copyBuffers || 1 !== bytesPerElement && (2 !== bytesPerElement || 1 & buffer.byteOffset) && (4 !== bytesPerElement || 3 & buffer.byteOffset) && (8 !== bytesPerElement || 7 & buffer.byteOffset) ? new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer) : new TypedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength);
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

const decode = defaultDecoder.decode, decodeMultiple = defaultDecoder.decodeMultiple, FLOAT32_OPTIONS = {
    NEVER: 0,
    ALWAYS: 1,
    DECIMAL_ROUND: 3,
    DECIMAL_FIT: 4
};

function roundFloat32(float32Number) {
    f32Array[0] = float32Number;
    let multiplier = mult10[(127 & u8Array[3]) << 1 | u8Array[2] >> 7];
    return (multiplier * float32Number + (float32Number > 0 ? .5 : -.5) >> 0) / multiplier;
}

let textEncoder, extensions, extensionClasses;

try {
    textEncoder = new TextEncoder;
} catch (error) {}

const Buffer$1 = "object" == typeof globalThis && globalThis.Buffer, hasNodeBuffer = void 0 !== Buffer$1, ByteArrayAllocate = hasNodeBuffer ? Buffer$1.allocUnsafeSlow : Uint8Array, ByteArray = hasNodeBuffer ? Buffer$1 : Uint8Array, MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;

let throwOnIterable, target, targetView, safeEnd, position = 0, bundledStrings = null;

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
            throwOnIterable = encodeOptions & THROW_ON_ITERABLE;
            try {
                if (throwOnIterable) return;
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
            } else if ("number" === type) if (this.alwaysUseFloat || value >>> 0 !== value) if (this.alwaysUseFloat || value >> 0 !== value) {
                let useFloat32;
                if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
                    let xShifted;
                    if (target[position++] = 250, targetView.setFloat32(position, value), useFloat32 < 4 || (xShifted = value * mult10[(127 & target[position]) << 1 | target[position + 1] >> 7]) >> 0 === xShifted) return void (position += 4);
                    position--;
                }
                target[position++] = 251, targetView.setFloat64(position, value), position += 8;
            } else value >= -24 ? target[position++] = 31 - value : value >= -256 ? (target[position++] = 56, 
            target[position++] = ~value) : value >= -65536 ? (target[position++] = 57, targetView.setUint16(position, ~value), 
            position += 2) : (target[position++] = 58, targetView.setUint32(position, ~value), 
            position += 4); else value < 24 ? target[position++] = value : value < 256 ? (target[position++] = 24, 
            target[position++] = value) : value < 65536 ? (target[position++] = 25, target[position++] = value >> 8, 
            target[position++] = 255 & value) : (target[position++] = 26, targetView.setUint32(position, value), 
            position += 4); else if ("object" === type) if (value) {
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
                        if (throwOnIterable) {
                            let error = new Error("Iterable should be serialized as iterator");
                            throw error.iteratorNotHandled = !0, error;
                        }
                        target[position++] = 159;
                        for (let entry of value) encode(entry);
                        return void (target[position++] = 255);
                    }
                    if (value[Symbol.asyncIterator] || isBlob(value)) {
                        let error = new Error("Iterable/blob should be serialized as iterator");
                        throw error.iteratorNotHandled = !0, error;
                    }
                    if (this.useToJSON && value.toJSON) {
                        const json = value.toJSON();
                        if (json !== value) return encode(json);
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
            position += 4), encoder.keyMap) for (let i = 0; i < length; i++) encode(encoder.encodeKey(keys[i])), 
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
                    if (transition[RECORD_SYMBOL] = recordId, targetView.setUint32(position, 3655335680), 
                    position += 3, newTransitions && (transitionsCount += serializationsSinceTransitionRebuild * newTransitions), 
                    recordIdsToRemove.length >= 256 - maxSharedStructures && (recordIdsToRemove.shift()[RECORD_SYMBOL] = void 0), 
                    recordIdsToRemove.push(transition), writeArrayHeader(length + 2), encode(57344 + recordId), 
                    encode(keys), null === safePrototype) return;
                    for (let key in object) (safePrototype || object.hasOwnProperty(key)) && encode(object[key]);
                    return;
                }
                target[position++] = 217, target[position++] = recordId >> 8 | 224, target[position++] = 255 & recordId, 
                transition = structures.transitions;
                for (let i = 0; i < length; i++) (void 0 === transition[RECORD_SYMBOL] || 1048576 & transition[RECORD_SYMBOL]) && (transition[RECORD_SYMBOL] = recordId), 
                transition = transition[keys[i]];
                transition[RECORD_SYMBOL] = 1048576 | recordId, hasSharedUpdate = !0;
            }
            if (length < 24 ? target[position++] = 128 | length : writeArrayHeader(length), 
            null !== safePrototype) for (let key in object) (safePrototype || object.hasOwnProperty(key)) && encode(object[key]);
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
        let chunkThreshold = 100, continuedChunkThreshold = 1e3;
        function* encodeObjectAsIterable(object, iterateProperties, finalIterable) {
            let constructor = object.constructor;
            if (constructor === Object) {
                let useRecords = !1 !== encoder.useRecords;
                useRecords ? writeObject(object, null) : writeEntityLength(Object.keys(object).length, 160);
                for (let key in object) {
                    let value = object[key];
                    useRecords || encode(key), value && "object" == typeof value ? iterateProperties[key] ? yield* encodeObjectAsIterable(value, iterateProperties[key]) : yield* tryEncode(value, iterateProperties, key) : encode(value);
                }
            } else if (constructor === Array) {
                let length = object.length;
                writeArrayHeader(length);
                for (let i = 0; i < length; i++) {
                    let value = object[i];
                    value && ("object" == typeof value || position - start > chunkThreshold) ? iterateProperties.element ? yield* encodeObjectAsIterable(value, iterateProperties.element) : yield* tryEncode(value, iterateProperties, "element") : encode(value);
                }
            } else if (object[Symbol.iterator]) {
                target[position++] = 159;
                for (let value of object) value && ("object" == typeof value || position - start > chunkThreshold) ? iterateProperties.element ? yield* encodeObjectAsIterable(value, iterateProperties.element) : yield* tryEncode(value, iterateProperties, "element") : encode(value);
                target[position++] = 255;
            } else isBlob(object) ? (writeEntityLength(object.size, 64), yield target.subarray(start, position), 
            yield object, restartEncoding()) : object[Symbol.asyncIterator] ? (target[position++] = 159, 
            yield target.subarray(start, position), yield object, restartEncoding(), target[position++] = 255) : encode(object);
            finalIterable && position > start ? yield target.subarray(start, position) : position - start > chunkThreshold && (yield target.subarray(start, position), 
            restartEncoding());
        }
        function* tryEncode(value, iterateProperties, key) {
            let restart = position - start;
            try {
                encode(value), position - start > chunkThreshold && (yield target.subarray(start, position), 
                restartEncoding());
            } catch (error) {
                if (!error.iteratorNotHandled) throw error;
                iterateProperties[key] = {}, position = start + restart, yield* encodeObjectAsIterable.call(this, value, iterateProperties[key]);
            }
        }
        function restartEncoding() {
            chunkThreshold = continuedChunkThreshold, encoder.encode(null, THROW_ON_ITERABLE);
        }
        function startEncoding(value, options, encodeIterable) {
            return chunkThreshold = options && options.chunkThreshold ? continuedChunkThreshold = options.chunkThreshold : 100, 
            value && "object" == typeof value ? (encoder.encode(null, THROW_ON_ITERABLE), encodeIterable(value, encoder.iterateProperties || (encoder.iterateProperties = {}), !0)) : [ encoder.encode(value) ];
        }
        async function* encodeObjectAsAsyncIterable(value, iterateProperties) {
            for (let encodedValue of encodeObjectAsIterable(value, iterateProperties, !0)) {
                let constructor = encodedValue.constructor;
                if (constructor === ByteArray || constructor === Uint8Array) yield encodedValue; else if (isBlob(encodedValue)) {
                    let next, reader = encodedValue.stream().getReader();
                    for (;!(next = await reader.read()).done; ) yield next.value;
                } else if (encodedValue[Symbol.asyncIterator]) for await (let asyncValue of encodedValue) restartEncoding(), 
                asyncValue ? yield* encodeObjectAsAsyncIterable(asyncValue, iterateProperties.async || (iterateProperties.async = {})) : yield encoder.encode(asyncValue); else yield encodedValue;
            }
        }
        this.encodeAsIterable = function(value, options) {
            return startEncoding(value, options, encodeObjectAsIterable);
        }, this.encodeAsAsyncIterable = function(value, options) {
            return startEncoding(value, options, encodeObjectAsAsyncIterable);
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

function writeEntityLength(length, majorValue) {
    length < 24 ? target[position++] = majorValue | length : length < 256 ? (target[position++] = 24 | majorValue, 
    target[position++] = length) : length < 65536 ? (target[position++] = 25 | majorValue, 
    target[position++] = length >> 8, target[position++] = 255 & length) : (target[position++] = 26 | majorValue, 
    targetView.setUint32(position, length), position += 4);
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

const BlobConstructor = "undefined" == typeof Blob ? function() {} : Blob;

function isBlob(object) {
    if (object instanceof BlobConstructor) return !0;
    let tag = object[Symbol.toStringTag];
    return "Blob" === tag || "File" === tag;
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
            encode(hasNodeBuffer ? Buffer$1.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
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

function addExtension(extension) {
    if (extension.Class) {
        if (!extension.encode) throw new Error("Extension has no encode function");
        extensionClasses.unshift(extension.Class), extensions.unshift(extension);
    }
    !function(extension) {
        currentExtensions[extension.tag] = extension.decode;
    }(extension);
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
} ];

let defaultEncoder = new Encoder({
    useRecords: !1
});

const encode = defaultEncoder.encode, encodeAsIterable = defaultEncoder.encodeAsIterable, encodeAsAsyncIterable = defaultEncoder.encodeAsAsyncIterable, {NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT} = FLOAT32_OPTIONS, REUSE_BUFFER_MODE = 512, RESET_BUFFER_MODE = 1024, THROW_ON_ITERABLE = 2048;

function encodeIter(objectIterator, options = {}) {
    if (objectIterator && "object" == typeof objectIterator) {
        if ("function" == typeof objectIterator[Symbol.iterator]) return function*(objectIterator, options) {
            const encoder = new Encoder(options);
            for (const value of objectIterator) yield encoder.encode(value);
        }(objectIterator, options);
        if ("function" == typeof objectIterator.then || "function" == typeof objectIterator[Symbol.asyncIterator]) return async function*(objectIterator, options) {
            const encoder = new Encoder(options);
            for await (const value of objectIterator) yield encoder.encode(value);
        }(objectIterator, options);
        throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a Promise");
    }
    throw new Error("first argument must be an Iterable, Async Iterable, or a Promise for an Async Iterable");
}

function decodeIter(bufferIterator, options = {}) {
    if (!bufferIterator || "object" != typeof bufferIterator) throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a promise");
    const decoder = new Decoder(options);
    let incomplete;
    const parser = chunk => {
        let yields;
        incomplete && (chunk = Buffer.concat([ incomplete, chunk ]), incomplete = void 0);
        try {
            yields = decoder.decodeMultiple(chunk);
        } catch (err) {
            if (!err.incomplete) throw err;
            incomplete = chunk.slice(err.lastPosition), yields = err.values;
        }
        return yields;
    };
    return "function" == typeof bufferIterator[Symbol.iterator] ? function*() {
        for (const value of bufferIterator) yield* parser(value);
    }() : "function" == typeof bufferIterator[Symbol.asyncIterator] ? async function*() {
        for await (const value of bufferIterator) yield* parser(value);
    }() : void 0;
}

export { ALWAYS, DECIMAL_FIT, DECIMAL_ROUND, Decoder, Encoder, FLOAT32_OPTIONS, NEVER, REUSE_BUFFER_MODE, Tag, addExtension, clearSource, decode, decodeIter, decodeMultiple, encode, encodeAsAsyncIterable, encodeAsIterable, encodeIter, isNativeAccelerationEnabled, roundFloat32 };
