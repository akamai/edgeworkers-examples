/** @preserve @version 1.0.2 */
import { Decoder } from "./cbor-x.js";

import { logger } from "log";

import { crypto } from "crypto";

import { base16, TextEncoder } from "encoding";

const HeaderLabelMap = {
    alg: 1,
    crit: 2,
    kid: 4,
    IV: 5
}, AlgoLabelMap = {
    ES256: -7,
    HS256: 5,
    PS256: -37
}, ClaimsLabelMap = {
    iss: 1,
    sub: 2,
    aud: 3,
    exp: 4,
    nbf: 5,
    iat: 6,
    cti: 7,
    catreplay: 308,
    catv: 310,
    crit: 45,
    catnip: 311,
    catu: 312,
    catm: 313,
    catalpn: 314,
    cath: 315,
    catgeoiso3166: 316,
    catgeocoord: 317,
    cattpk: 319,
    catifdata: 320,
    cnf: 8,
    catdpopw: 275,
    enc: 44,
    or: 41,
    nor: 42,
    and: 43,
    catif: 322,
    catr: 323,
    catdpopjti: "catdpopjti",
    geohash: 282,
    catgeoalt: 318,
    catpor: 309
}, CatURILabelMap = {
    scheme: 0,
    host: 1,
    port: 2,
    path: 3,
    query: 4,
    parent_path: 5,
    filename: 6,
    stem: 7,
    extension: 8
}, MatchTypeLabelMap = {
    exact: 0,
    prefix: 1,
    suffix: 2,
    contains: 3,
    regex: 4,
    sha256: -1,
    sha512: -2
}, CatRLabelMap = {
    renewal_type: 0,
    exp_extension: 1,
    renewal_deadline: 2,
    cookie_name: 3,
    header_name: 4,
    parent_path: 5,
    cookie_params: 6,
    header_params: 7,
    redirect_status: 8
}, CatRRenewableTypes = {
    automatic_renewable: 0,
    cookie_renewable: 1,
    header_renewable: 2,
    redirect_renewable: 3
}, AlgoStringMap = {
    "-7": "ES256",
    5: "HS256",
    "-37": "PS256",
    3: "A256GCM"
}, SupportedClaims = [ ClaimsLabelMap.iss, ClaimsLabelMap.sub, ClaimsLabelMap.aud, ClaimsLabelMap.iat, ClaimsLabelMap.exp, ClaimsLabelMap.cti, ClaimsLabelMap.nbf, ClaimsLabelMap.catv, ClaimsLabelMap.crit, ClaimsLabelMap.catu, ClaimsLabelMap.catm, ClaimsLabelMap.catalpn, ClaimsLabelMap.cath, ClaimsLabelMap.catgeoiso3166, ClaimsLabelMap.catgeocoord, ClaimsLabelMap.geohash, ClaimsLabelMap.catif, ClaimsLabelMap.catr, ClaimsLabelMap.and, ClaimsLabelMap.nor, ClaimsLabelMap.or, ClaimsLabelMap.enc, ClaimsLabelMap.catnip ], base32 = "0123456789bcdefghjkmnpqrstuvwxyz";

class Geohash {
    static cta_encode(lat, lon, precision) {
        if (lat = Number(lat), lon = Number(lon), precision = Number(precision), isNaN(lat) || isNaN(lon) || isNaN(precision) || precision < 1 || precision > 12) throw new Error("Invalid parameters");
        const latLen = Math.floor(2.5 * precision), lonLen = Math.ceil(2.5 * precision), latQstep = Number(180 / 2 ** latLen), lonQstep = Number(360 / 2 ** lonLen), latCode = Math.floor((lat + 90) / latQstep), lonCode = Math.floor((lon + 180) / lonQstep), inter = Geohash.interleave(Geohash.dec2bin(latCode), Geohash.dec2bin(lonCode), latLen == lonLen), decArray = [];
        let hash = "";
        for (let i = inter.length; i > 0; i -= 5) {
            const dec = parseInt(inter.substring(i - 5, i), 2);
            decArray.length < precision && decArray.unshift(dec);
        }
        for (const dec of decArray) hash += base32.substring(dec, dec + 1);
        return hash;
    }
    static interleave(a, b, equal) {
        let result = "";
        a.length > b.length ? b = "0000".substring(0, a.length - b.length) + b : a = "0000".substring(0, b.length - a.length) + a;
        for (let i = a.length - 1; i > -1; i--) result = (equal ? b.substring(i, i + 1) + a.substring(i, i + 1) : a.substring(i, i + 1) + b.substring(i, i + 1)) + result;
        return result;
    }
    static cta_decode(geohash) {
        const decArray = [];
        [ ...geohash ].forEach((c => {
            for (let i = 0; i < base32.length; i++) base32[i] === c && decArray.push(i);
        }));
        let int = 0;
        for (let i = 0; i < decArray.length; i++) int += decArray[i] * Math.pow(32, decArray.length - i - 1);
        const bin = int.toString(2);
        let primary = "", secondary = "", p = !0;
        for (let i = bin.length - 1; i > -1; i--) p ? primary = bin[i] + primary : secondary = bin[i] + secondary, 
        p = !p;
        const latlen = Math.floor(2.5 * geohash.length), lonlen = Math.ceil(2.5 * geohash.length), areEqual = latlen == lonlen, lonCode = areEqual ? secondary : primary, latDecimal = parseInt(areEqual ? primary : secondary, 2), lonDecimal = parseInt(lonCode, 2), latRange = Number(180 / Math.pow(2, latlen)), lonRange = Number(360 / Math.pow(2, lonlen)), lat = latRange * latDecimal - 90, lon = lonRange * lonDecimal - 180, latMin = lat, lonMin = lon, latMax = lat + latRange / 2, lonMax = lon + lonRange / 2, lat1 = lat.toFixed(Math.floor(2 - Math.log(latMax - latMin) / Math.LN10)), lon1 = lon.toFixed(Math.floor(2 - Math.log(lonMax - lonMin) / Math.LN10));
        return {
            lat: Number(lat1),
            lon: Number(lon1)
        };
    }
    static adjacent(geohash, direction) {
        if (geohash = geohash.toLowerCase(), direction = direction.toLowerCase(), 0 == geohash.length) throw new Error("Invalid geohash");
        if (-1 == "nsew".indexOf(direction)) throw new Error("Invalid direction");
        const lastCh = geohash.slice(-1);
        let parent = geohash.slice(0, -1);
        const type = geohash.length % 2;
        return -1 != {
            n: [ "prxz", "bcfguvyz" ],
            s: [ "028b", "0145hjnp" ],
            e: [ "bcfguvyz", "prxz" ],
            w: [ "0145hjnp", "028b" ]
        }[direction][type].indexOf(lastCh) && "" != parent && (parent = Geohash.adjacent(parent, direction)), 
        parent + base32.charAt({
            n: [ "p0r21436x8zb9dcf5h7kjnmqesgutwvy", "bc01fg45238967deuvhjyznpkmstqrwx" ],
            s: [ "14365h7k9dcfesgujnmqp0r2twvyx8zb", "238967debc01fg45kmstqrwxuvhjyznp" ],
            e: [ "bc01fg45238967deuvhjyznpkmstqrwx", "p0r21436x8zb9dcf5h7kjnmqesgutwvy" ],
            w: [ "238967debc01fg45kmstqrwxuvhjyznp", "14365h7k9dcfesgujnmqp0r2twvyx8zb" ]
        }[direction][type].indexOf(lastCh));
    }
    static dec2bin(dec) {
        return (dec >>> 0).toString(2);
    }
}

var module, commonjsGlobal = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}, ipaddr$1 = {
    exports: {}
};

module = ipaddr$1, function() {
    var expandIPv6, ipaddr, ipv4Part, ipv4Regexes, ipv6Part, ipv6Regexes, matchCIDR;
    ipaddr = {}, null !== module && module.exports ? module.exports = ipaddr : this.ipaddr = ipaddr, 
    matchCIDR = function(first, second, partSize, cidrBits) {
        var part, shift;
        if (first.length !== second.length) throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
        for (part = 0; cidrBits > 0; ) {
            if ((shift = partSize - cidrBits) < 0 && (shift = 0), first[part] >> shift != second[part] >> shift) return !1;
            cidrBits -= partSize, part += 1;
        }
        return !0;
    }, ipaddr.subnetMatch = function(address, rangeList, defaultName) {
        var k, len, rangeName, rangeSubnets, subnet;
        for (rangeName in null == defaultName && (defaultName = "unicast"), rangeList) for (!(rangeSubnets = rangeList[rangeName])[0] || rangeSubnets[0] instanceof Array || (rangeSubnets = [ rangeSubnets ]), 
        k = 0, len = rangeSubnets.length; k < len; k++) if (subnet = rangeSubnets[k], address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) return rangeName;
        return defaultName;
    }, ipaddr.IPv4 = function() {
        function IPv4(octets) {
            var k, len, octet;
            if (4 !== octets.length) throw new Error("ipaddr: ipv4 octet count should be 4");
            for (k = 0, len = octets.length; k < len; k++) if (!(0 <= (octet = octets[k]) && octet <= 255)) throw new Error("ipaddr: ipv4 octet should fit in 8 bits");
            this.octets = octets;
        }
        return IPv4.prototype.kind = function() {
            return "ipv4";
        }, IPv4.prototype.toString = function() {
            return this.octets.join(".");
        }, IPv4.prototype.toNormalizedString = function() {
            return this.toString();
        }, IPv4.prototype.toByteArray = function() {
            return this.octets.slice(0);
        }, IPv4.prototype.match = function(other, cidrRange) {
            var ref;
            if (void 0 === cidrRange && (other = (ref = other)[0], cidrRange = ref[1]), "ipv4" !== other.kind()) throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
            return matchCIDR(this.octets, other.octets, 8, cidrRange);
        }, IPv4.prototype.SpecialRanges = {
            unspecified: [ [ new IPv4([ 0, 0, 0, 0 ]), 8 ] ],
            broadcast: [ [ new IPv4([ 255, 255, 255, 255 ]), 32 ] ],
            multicast: [ [ new IPv4([ 224, 0, 0, 0 ]), 4 ] ],
            linkLocal: [ [ new IPv4([ 169, 254, 0, 0 ]), 16 ] ],
            loopback: [ [ new IPv4([ 127, 0, 0, 0 ]), 8 ] ],
            carrierGradeNat: [ [ new IPv4([ 100, 64, 0, 0 ]), 10 ] ],
            private: [ [ new IPv4([ 10, 0, 0, 0 ]), 8 ], [ new IPv4([ 172, 16, 0, 0 ]), 12 ], [ new IPv4([ 192, 168, 0, 0 ]), 16 ] ],
            reserved: [ [ new IPv4([ 192, 0, 0, 0 ]), 24 ], [ new IPv4([ 192, 0, 2, 0 ]), 24 ], [ new IPv4([ 192, 88, 99, 0 ]), 24 ], [ new IPv4([ 198, 51, 100, 0 ]), 24 ], [ new IPv4([ 203, 0, 113, 0 ]), 24 ], [ new IPv4([ 240, 0, 0, 0 ]), 4 ] ]
        }, IPv4.prototype.range = function() {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        }, IPv4.prototype.toIPv4MappedAddress = function() {
            return ipaddr.IPv6.parse("::ffff:" + this.toString());
        }, IPv4.prototype.prefixLengthFromSubnetMask = function() {
            var cidr, i, k, octet, stop, zeros, zerotable;
            for (zerotable = {
                0: 8,
                128: 7,
                192: 6,
                224: 5,
                240: 4,
                248: 3,
                252: 2,
                254: 1,
                255: 0
            }, cidr = 0, stop = !1, i = k = 3; k >= 0; i = k += -1) {
                if (!((octet = this.octets[i]) in zerotable)) return null;
                if (zeros = zerotable[octet], stop && 0 !== zeros) return null;
                8 !== zeros && (stop = !0), cidr += zeros;
            }
            return 32 - cidr;
        }, IPv4;
    }(), ipv4Part = "(0?\\d+|0x[a-f0-9]+)", ipv4Regexes = {
        fourOctet: new RegExp("^" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "$", "i"),
        longValue: new RegExp("^" + ipv4Part + "$", "i")
    }, ipaddr.IPv4.parser = function(string) {
        var match, parseIntAuto, part, shift, value;
        if (parseIntAuto = function(string) {
            return "0" === string[0] && "x" !== string[1] ? parseInt(string, 8) : parseInt(string);
        }, match = string.match(ipv4Regexes.fourOctet)) return function() {
            var k, len, ref, results;
            for (results = [], k = 0, len = (ref = match.slice(1, 6)).length; k < len; k++) part = ref[k], 
            results.push(parseIntAuto(part));
            return results;
        }();
        if (match = string.match(ipv4Regexes.longValue)) {
            if ((value = parseIntAuto(match[1])) > 4294967295 || value < 0) throw new Error("ipaddr: address outside defined range");
            return function() {
                var k, results;
                for (results = [], shift = k = 0; k <= 24; shift = k += 8) results.push(value >> shift & 255);
                return results;
            }().reverse();
        }
        return null;
    }, ipaddr.IPv6 = function() {
        function IPv6(parts, zoneId) {
            var i, k, l, len, part, ref;
            if (16 === parts.length) for (this.parts = [], i = k = 0; k <= 14; i = k += 2) this.parts.push(parts[i] << 8 | parts[i + 1]); else {
                if (8 !== parts.length) throw new Error("ipaddr: ipv6 part count should be 8 or 16");
                this.parts = parts;
            }
            for (l = 0, len = (ref = this.parts).length; l < len; l++) if (!(0 <= (part = ref[l]) && part <= 65535)) throw new Error("ipaddr: ipv6 part should fit in 16 bits");
            zoneId && (this.zoneId = zoneId);
        }
        return IPv6.prototype.kind = function() {
            return "ipv6";
        }, IPv6.prototype.toString = function() {
            return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, "::");
        }, IPv6.prototype.toRFC5952String = function() {
            var bestMatchIndex, bestMatchLength, match, regex, string;
            for (regex = /((^|:)(0(:|$)){2,})/g, string = this.toNormalizedString(), bestMatchIndex = 0, 
            bestMatchLength = -1; match = regex.exec(string); ) match[0].length > bestMatchLength && (bestMatchIndex = match.index, 
            bestMatchLength = match[0].length);
            return bestMatchLength < 0 ? string : string.substring(0, bestMatchIndex) + "::" + string.substring(bestMatchIndex + bestMatchLength);
        }, IPv6.prototype.toByteArray = function() {
            var bytes, k, len, part, ref;
            for (bytes = [], k = 0, len = (ref = this.parts).length; k < len; k++) part = ref[k], 
            bytes.push(part >> 8), bytes.push(255 & part);
            return bytes;
        }, IPv6.prototype.toNormalizedString = function() {
            var addr, part, suffix;
            return addr = function() {
                var k, len, ref, results;
                for (results = [], k = 0, len = (ref = this.parts).length; k < len; k++) part = ref[k], 
                results.push(part.toString(16));
                return results;
            }.call(this).join(":"), suffix = "", this.zoneId && (suffix = "%" + this.zoneId), 
            addr + suffix;
        }, IPv6.prototype.toFixedLengthString = function() {
            var addr, part, suffix;
            return addr = function() {
                var k, len, ref, results;
                for (results = [], k = 0, len = (ref = this.parts).length; k < len; k++) part = ref[k], 
                results.push(part.toString(16).padStart(4, "0"));
                return results;
            }.call(this).join(":"), suffix = "", this.zoneId && (suffix = "%" + this.zoneId), 
            addr + suffix;
        }, IPv6.prototype.match = function(other, cidrRange) {
            var ref;
            if (void 0 === cidrRange && (other = (ref = other)[0], cidrRange = ref[1]), "ipv6" !== other.kind()) throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
            return matchCIDR(this.parts, other.parts, 16, cidrRange);
        }, IPv6.prototype.SpecialRanges = {
            unspecified: [ new IPv6([ 0, 0, 0, 0, 0, 0, 0, 0 ]), 128 ],
            linkLocal: [ new IPv6([ 65152, 0, 0, 0, 0, 0, 0, 0 ]), 10 ],
            multicast: [ new IPv6([ 65280, 0, 0, 0, 0, 0, 0, 0 ]), 8 ],
            loopback: [ new IPv6([ 0, 0, 0, 0, 0, 0, 0, 1 ]), 128 ],
            uniqueLocal: [ new IPv6([ 64512, 0, 0, 0, 0, 0, 0, 0 ]), 7 ],
            ipv4Mapped: [ new IPv6([ 0, 0, 0, 0, 0, 65535, 0, 0 ]), 96 ],
            rfc6145: [ new IPv6([ 0, 0, 0, 0, 65535, 0, 0, 0 ]), 96 ],
            rfc6052: [ new IPv6([ 100, 65435, 0, 0, 0, 0, 0, 0 ]), 96 ],
            "6to4": [ new IPv6([ 8194, 0, 0, 0, 0, 0, 0, 0 ]), 16 ],
            teredo: [ new IPv6([ 8193, 0, 0, 0, 0, 0, 0, 0 ]), 32 ],
            reserved: [ [ new IPv6([ 8193, 3512, 0, 0, 0, 0, 0, 0 ]), 32 ] ]
        }, IPv6.prototype.range = function() {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        }, IPv6.prototype.isIPv4MappedAddress = function() {
            return "ipv4Mapped" === this.range();
        }, IPv6.prototype.toIPv4Address = function() {
            var high, low, ref;
            if (!this.isIPv4MappedAddress()) throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
            return high = (ref = this.parts.slice(-2))[0], low = ref[1], new ipaddr.IPv4([ high >> 8, 255 & high, low >> 8, 255 & low ]);
        }, IPv6.prototype.prefixLengthFromSubnetMask = function() {
            var cidr, i, k, part, stop, zeros, zerotable;
            for (zerotable = {
                0: 16,
                32768: 15,
                49152: 14,
                57344: 13,
                61440: 12,
                63488: 11,
                64512: 10,
                65024: 9,
                65280: 8,
                65408: 7,
                65472: 6,
                65504: 5,
                65520: 4,
                65528: 3,
                65532: 2,
                65534: 1,
                65535: 0
            }, cidr = 0, stop = !1, i = k = 7; k >= 0; i = k += -1) {
                if (!((part = this.parts[i]) in zerotable)) return null;
                if (zeros = zerotable[part], stop && 0 !== zeros) return null;
                16 !== zeros && (stop = !0), cidr += zeros;
            }
            return 128 - cidr;
        }, IPv6;
    }(), ipv6Part = "(?:[0-9a-f]+::?)+", ipv6Regexes = {
        zoneIndex: new RegExp("%[0-9a-z]{1,}", "i"),
        native: new RegExp("^(::)?(" + ipv6Part + ")?([0-9a-f]+)?(::)?(%[0-9a-z]{1,})?$", "i"),
        transitional: new RegExp("^((?:" + ipv6Part + ")|(?:::)(?:" + ipv6Part + ")?)" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "(%[0-9a-z]{1,})?$", "i")
    }, expandIPv6 = function(string, parts) {
        var colonCount, lastColon, part, replacement, replacementCount, zoneId;
        if (string.indexOf("::") !== string.lastIndexOf("::")) return null;
        for ((zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0]) && (zoneId = zoneId.substring(1), 
        string = string.replace(/%.+$/, "")), colonCount = 0, lastColon = -1; (lastColon = string.indexOf(":", lastColon + 1)) >= 0; ) colonCount++;
        if ("::" === string.substr(0, 2) && colonCount--, "::" === string.substr(-2, 2) && colonCount--, 
        colonCount > parts) return null;
        for (replacementCount = parts - colonCount, replacement = ":"; replacementCount--; ) replacement += "0:";
        return ":" === (string = string.replace("::", replacement))[0] && (string = string.slice(1)), 
        ":" === string[string.length - 1] && (string = string.slice(0, -1)), {
            parts: parts = function() {
                var k, len, ref, results;
                for (results = [], k = 0, len = (ref = string.split(":")).length; k < len; k++) part = ref[k], 
                results.push(parseInt(part, 16));
                return results;
            }(),
            zoneId
        };
    }, ipaddr.IPv6.parser = function(string) {
        var addr, k, len, match, octet, octets, zoneId;
        if (ipv6Regexes.native.test(string)) return expandIPv6(string, 8);
        if ((match = string.match(ipv6Regexes.transitional)) && (zoneId = match[6] || "", 
        (addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6)).parts)) {
            for (k = 0, len = (octets = [ parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5]) ]).length; k < len; k++) if (!(0 <= (octet = octets[k]) && octet <= 255)) return null;
            return addr.parts.push(octets[0] << 8 | octets[1]), addr.parts.push(octets[2] << 8 | octets[3]), 
            {
                parts: addr.parts,
                zoneId: addr.zoneId
            };
        }
        return null;
    }, ipaddr.IPv4.isIPv4 = ipaddr.IPv6.isIPv6 = function(string) {
        return null !== this.parser(string);
    }, ipaddr.IPv4.isValid = function(string) {
        try {
            return new this(this.parser(string)), !0;
        } catch (error1) {
            return !1;
        }
    }, ipaddr.IPv4.isValidFourPartDecimal = function(string) {
        return !(!ipaddr.IPv4.isValid(string) || !string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/));
    }, ipaddr.IPv6.isValid = function(string) {
        var addr;
        if ("string" == typeof string && -1 === string.indexOf(":")) return !1;
        try {
            return new this((addr = this.parser(string)).parts, addr.zoneId), !0;
        } catch (error1) {
            return !1;
        }
    }, ipaddr.IPv4.parse = function(string) {
        var parts;
        if (null === (parts = this.parser(string))) throw new Error("ipaddr: string is not formatted like ip address");
        return new this(parts);
    }, ipaddr.IPv6.parse = function(string) {
        var addr;
        if (null === (addr = this.parser(string)).parts) throw new Error("ipaddr: string is not formatted like ip address");
        return new this(addr.parts, addr.zoneId);
    }, ipaddr.IPv4.parseCIDR = function(string) {
        var maskLength, match, parsed;
        if ((match = string.match(/^(.+)\/(\d+)$/)) && (maskLength = parseInt(match[2])) >= 0 && maskLength <= 32) return parsed = [ this.parse(match[1]), maskLength ], 
        Object.defineProperty(parsed, "toString", {
            value: function() {
                return this.join("/");
            }
        }), parsed;
        throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range");
    }, ipaddr.IPv4.subnetMaskFromPrefixLength = function(prefix) {
        var filledOctetCount, j, octets;
        if ((prefix = parseInt(prefix)) < 0 || prefix > 32) throw new Error("ipaddr: invalid IPv4 prefix length");
        for (octets = [ 0, 0, 0, 0 ], j = 0, filledOctetCount = Math.floor(prefix / 8); j < filledOctetCount; ) octets[j] = 255, 
        j++;
        return filledOctetCount < 4 && (octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8), 
        new this(octets);
    }, ipaddr.IPv4.broadcastAddressFromCIDR = function(string) {
        var cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
        try {
            for (ipInterfaceOctets = (cidr = this.parseCIDR(string))[0].toByteArray(), subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray(), 
            octets = [], i = 0; i < 4; ) octets.push(parseInt(ipInterfaceOctets[i], 10) | 255 ^ parseInt(subnetMaskOctets[i], 10)), 
            i++;
            return new this(octets);
        } catch (error1) {
            throw new Error("ipaddr: the address does not have IPv4 CIDR format");
        }
    }, ipaddr.IPv4.networkAddressFromCIDR = function(string) {
        var cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
        try {
            for (ipInterfaceOctets = (cidr = this.parseCIDR(string))[0].toByteArray(), subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray(), 
            octets = [], i = 0; i < 4; ) octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10)), 
            i++;
            return new this(octets);
        } catch (error1) {
            throw new Error("ipaddr: the address does not have IPv4 CIDR format");
        }
    }, ipaddr.IPv6.parseCIDR = function(string) {
        var maskLength, match, parsed;
        if ((match = string.match(/^(.+)\/(\d+)$/)) && (maskLength = parseInt(match[2])) >= 0 && maskLength <= 128) return parsed = [ this.parse(match[1]), maskLength ], 
        Object.defineProperty(parsed, "toString", {
            value: function() {
                return this.join("/");
            }
        }), parsed;
        throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range");
    }, ipaddr.isValid = function(string) {
        return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
    }, ipaddr.parse = function(string) {
        if (ipaddr.IPv6.isValid(string)) return ipaddr.IPv6.parse(string);
        if (ipaddr.IPv4.isValid(string)) return ipaddr.IPv4.parse(string);
        throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
    }, ipaddr.parseCIDR = function(string) {
        try {
            return ipaddr.IPv6.parseCIDR(string);
        } catch (error1) {
            try {
                return ipaddr.IPv4.parseCIDR(string);
            } catch (error1) {
                throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format");
            }
        }
    }, ipaddr.fromByteArray = function(bytes) {
        var length;
        if (4 === (length = bytes.length)) return new ipaddr.IPv4(bytes);
        if (16 === length) return new ipaddr.IPv6(bytes);
        throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address");
    }, ipaddr.process = function(string) {
        var addr;
        return "ipv6" === (addr = this.parse(string)).kind() && addr.isIPv4MappedAddress() ? addr.toIPv4Address() : addr;
    };
}.call(commonjsGlobal);

var ipaddr = ipaddr$1.exports, ipRangeCheck = function(addr, range) {
    if ("string" == typeof range) return check_single_cidr(addr, range);
    if ("object" == typeof range) {
        for (var ip_is_in_range = !1, i = 0; i < range.length; i++) if (check_single_cidr(addr, range[i])) {
            ip_is_in_range = !0;
            break;
        }
        return ip_is_in_range;
    }
};

function check_single_cidr(addr, cidr) {
    try {
        var parsed_addr = ipaddr.process(addr);
        if (-1 === cidr.indexOf("/")) {
            var parsed_cidr_as_ip = ipaddr.process(cidr);
            return "ipv6" === parsed_addr.kind() && "ipv6" === parsed_cidr_as_ip.kind() ? parsed_addr.toNormalizedString() === parsed_cidr_as_ip.toNormalizedString() : parsed_addr.toString() == parsed_cidr_as_ip.toString();
        }
        var parsed_range = ipaddr.parseCIDR(cidr);
        return parsed_addr.match(parsed_range);
    } catch (e) {
        return !1;
    }
}

class ClaimsValidator {
    static typeChecks(claim, value) {
        switch (claim) {
          case ClaimsLabelMap.iss:
            return this.typeCheckIss(value);

          case ClaimsLabelMap.sub:
            return this.typeCheckSub(value);

          case ClaimsLabelMap.aud:
            return this.typeCheckAud(value);

          case ClaimsLabelMap.exp:
            return this.typeCheckExp(value);

          case ClaimsLabelMap.nbf:
            return this.typeCheckNbf(value);

          case ClaimsLabelMap.iat:
            return this.typeCheckIat(value);

          case ClaimsLabelMap.cti:
            return this.typeCheckCti(value);

          case ClaimsLabelMap.catreplay:
            return this.typeCheckCatReplay(value);

          case ClaimsLabelMap.catv:
            return this.typeCheckCatv(value);

          case ClaimsLabelMap.crit:
            return this.typeCheckCrit(value);

          case ClaimsLabelMap.catu:
            return this.typeCheckCatu(value);

          case ClaimsLabelMap.catm:
            return this.typeCheckCatm(value);

          case ClaimsLabelMap.catalpn:
            return this.typeCheckCatalpn(value);

          case ClaimsLabelMap.cath:
            return this.typeCheckCath(value);

          case ClaimsLabelMap.catgeoiso3166:
            return this.typeCheckCatgeoiso3166(value);

          case ClaimsLabelMap.catgeocoord:
            return this.typeCheckCatgeocoord(value);

          case ClaimsLabelMap.catif:
            return this.typeCheckCatif(value);

          case ClaimsLabelMap.catr:
            return this.typeCheckCatr(value);

          case ClaimsLabelMap.and:
            return this.typeCheckCompositeClaim(value, "and");

          case ClaimsLabelMap.or:
            return this.typeCheckCompositeClaim(value, "or");

          case ClaimsLabelMap.nor:
            return this.typeCheckCompositeClaim(value, "nor");

          case ClaimsLabelMap.enc:
            return this.typeCheckEnc(value);

          case ClaimsLabelMap.catnip:
            return this.typeCheckCatnip(value);

          default:
            return {
                status: !0
            };
        }
    }
    static async validate(claim, value, catOptions, payload, request, decryptionKey) {
        switch (claim) {
          case ClaimsLabelMap.iss:
            return this.validateIss(value, catOptions);

          case ClaimsLabelMap.sub:
            return this.validateSub(value, catOptions);

          case ClaimsLabelMap.aud:
            return this.validateAud(value, catOptions);

          case ClaimsLabelMap.exp:
            return this.validateExp(value, catOptions);

          case ClaimsLabelMap.nbf:
            return this.validateNbf(value, catOptions);

          case ClaimsLabelMap.iat:
            return this.validateIat(value);

          case ClaimsLabelMap.catreplay:
            return this.validateCatReplay(value);

          case ClaimsLabelMap.catv:
            return this.validateCatv(value);

          case ClaimsLabelMap.crit:
            return this.validateCrit(value, payload);

          case ClaimsLabelMap.catu:
            return await this.validateCatu(value, request);

          case ClaimsLabelMap.catm:
            return this.validateCatm(value, request);

          case ClaimsLabelMap.catalpn:
            return this.validateCatalpn(value, request);

          case ClaimsLabelMap.cath:
            return this.validateCath(value, request);

          case ClaimsLabelMap.catgeoiso3166:
            return this.validateCatgeoiso3166(value, request);

          case ClaimsLabelMap.catgeocoord:
            return this.validateCatgeocoord(value, request);

          case ClaimsLabelMap.geohash:
            return this.validateGeoHash(value, request);

          case ClaimsLabelMap.and:
            return await this.validateAnd(value, catOptions, request);

          case ClaimsLabelMap.or:
            return await this.validateOr(value, catOptions, request);

          case ClaimsLabelMap.nor:
            return await this.validateNor(value, catOptions, request);

          case ClaimsLabelMap.enc:
            return await this.validateEnc(value, catOptions, payload, request, decryptionKey);

          case ClaimsLabelMap.catnip:
            return this.validateCatnip(value, request);

          default:
            return {
                status: !0
            };
        }
    }
    static typeCheckIss(value) {
        return "string" != typeof value ? {
            status: !1,
            errMsg: `Invalid value type for iss-label[${ClaimsLabelMap.iss}], expected text string.`
        } : {
            status: !0
        };
    }
    static typeCheckSub(value) {
        return "string" != typeof value ? {
            status: !1,
            errMsg: `Invalid value type for sub-label[${ClaimsLabelMap.sub}], expected text string.`
        } : {
            status: !0
        };
    }
    static typeCheckAud(value) {
        return "string" == typeof value || Array.isArray(value) && value.every((item => "string" == typeof item)) ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for aud-label[${ClaimsLabelMap.aud}], expected text string or array of text string.`
        };
    }
    static typeCheckExp(value) {
        return "bigint" == typeof value && value !== BigInt(0) || "number" == typeof value && Number.isFinite(value) && 0 !== value ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for exp-label[${ClaimsLabelMap.exp}], expected positive or negative integer or floating-point number.`
        };
    }
    static typeCheckNbf(value) {
        return "bigint" == typeof value && value !== BigInt(0) || "number" == typeof value && Number.isFinite(value) && 0 !== value ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for nbf-label[${ClaimsLabelMap.nbf}], expected positive or negative integer or floating-point number.`
        };
    }
    static typeCheckIat(value) {
        return "bigint" == typeof value && value !== BigInt(0) || "number" == typeof value && Number.isFinite(value) && 0 !== value ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for iat-label[${ClaimsLabelMap.iat}], expected positive or negative integer or floating-point number.`
        };
    }
    static typeCheckCti(value) {
        return value instanceof Uint8Array ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for cti-label[${ClaimsLabelMap.cti}], expected byte string (uint8array).`
        };
    }
    static typeCheckCatReplay(value) {
        return "number" == typeof value && value > 0 ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for catreplay-label[${ClaimsLabelMap.catreplay}], expected positive integer.`
        };
    }
    static typeCheckCatv(value) {
        return "number" == typeof value && value > 0 ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for catv-label[${ClaimsLabelMap.catv}], expected positive integer.`
        };
    }
    static typeCheckCrit(value) {
        return Array.isArray(value) && value.every((item => "string" == typeof item || "number" == typeof item)) ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for crit-label[${ClaimsLabelMap.crit}], expected array of string | number.`
        };
    }
    static typeCheckCatu(value) {
        if (!(value instanceof Map)) return {
            status: !1,
            errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}], expected Map<number, Map<number, string | bytes | array>>.`
        };
        for (const [k, v] of value) {
            if ("number" != typeof k) return {
                status: !1,
                errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}], expected Map<number, Map<number, string | bytes | array>>.`
            };
            if (!(v instanceof Map)) return {
                status: !1,
                errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}], expected Map<number, Map<number, string | bytes | array>>.`
            };
            for (const [a, b] of v) {
                if ("number" != typeof a) return {
                    status: !1,
                    errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}], expected Map<number, Map<number, string | bytes | array>>.`
                };
                if (0 === a || 1 === a || 2 == a || 3 === a) {
                    if ("string" != typeof b) return {
                        status: !1,
                        errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}]. Match component value type for [exact, prefix, suffix, contains] should be of type string`
                    };
                } else if (-1 === a || -2 === a) {
                    if (!(b instanceof Uint8Array)) return {
                        status: !1,
                        errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}], Match component value type for [sha256, sha512] should be byte string.`
                    };
                } else {
                    if (4 !== a) return {
                        status: !1,
                        errMsg: `Invalid match component key ${a} for catu-label[${ClaimsLabelMap.catu}], supported are [0=exact, 1=prefix, 2=suffix, 3=contains, 4=regularexp, -1=sha256, -2=sha512]`
                    };
                    if (!(Array.isArray(b) && b.length > 0 && "string" == typeof b[0] && b.every((item => null === item || "string" == typeof item)))) return {
                        status: !1,
                        errMsg: `Invalid value type for catu-label[${ClaimsLabelMap.catu}], Match component value type for regular expression should be array of string.`
                    };
                }
            }
        }
        return {
            status: !0
        };
    }
    static typeCheckCatm(value) {
        return Array.isArray(value) && value.every((item => "string" == typeof item)) ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for catm-label[${ClaimsLabelMap.catm}], expected array of text string.`
        };
    }
    static typeCheckCatalpn(value) {
        return Array.isArray(value) && value.every((item => item instanceof Uint8Array)) ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for catalpn-label[${ClaimsLabelMap.catalpn}], expected array of byte string.`
        };
    }
    static typeCheckCath(value) {
        if (!(value instanceof Map)) return {
            status: !1,
            errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}], expected Map<number, Map<number, string | bytes | array>>.`
        };
        for (const [k, v] of value) {
            if ("string" != typeof k) return {
                status: !1,
                errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}], expected Map<number, Map<number, string | bytes | array>>.`
            };
            if (!(v instanceof Map)) return {
                status: !1,
                errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}], expected Map<number, Map<number, string | bytes | array>>.`
            };
            for (const [a, b] of v) {
                if ("number" != typeof a) return {
                    status: !1,
                    errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}], expected Map<number, Map<number, string | bytes | array>>.`
                };
                if (0 === a || 1 === a || 2 == a || 3 === a) {
                    if ("string" != typeof b) return {
                        status: !1,
                        errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}]. Match component value type for [exact, prefix, suffix, contains] should be of type string`
                    };
                } else if (-1 === a || -2 === a) {
                    if (!(b instanceof Uint8Array)) return {
                        status: !1,
                        errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}], Match component value type for [sha256, sha512] should be byte string.`
                    };
                } else {
                    if (4 !== a) return {
                        status: !1,
                        errMsg: `Invalid match component key ${a} for cath-label[${ClaimsLabelMap.cath}], supported are [0=exact, 1=prefix, 2=suffix, 3=contains, 4=regularexp, -1=sha256, -2=sha512]`
                    };
                    if (!(Array.isArray(b) && b.length > 0 && "string" == typeof b[0] && b.every((item => null === item || "string" == typeof item)))) return {
                        status: !1,
                        errMsg: `Invalid value type for cath-label[${ClaimsLabelMap.cath}], Match component value type for regular expression should be array of string.`
                    };
                }
            }
        }
        return {
            status: !0
        };
    }
    static typeCheckCatgeoiso3166(value) {
        return Array.isArray(value) && value.length > 0 && value.every((item => "string" == typeof item)) ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for catgeoiso3166-label[${ClaimsLabelMap.catgeoiso3166}], expected array of strings.`
        };
    }
    static typeCheckCatgeocoord(value) {
        return Array.isArray(value) && value.length > 0 && value.every((item => Array.isArray(item) && 3 === item.length && item.every((i => "number" == typeof i)))) ? {
            status: !0
        } : {
            status: !1,
            errMsg: `Invalid value type for catgeocoord-label[${ClaimsLabelMap.catgeocoord}], expected array of array<number>(3).`
        };
    }
    static typeCheckCatif(value) {
        if (!(value instanceof Map)) return {
            status: !1,
            errMsg: `Invalid value type for catif-label[${ClaimsLabelMap.catif}], expected map.`
        };
        for (const [k, v] of value) {
            if (!("number" == typeof k || "string" == typeof k || Array.isArray(k) && k.every((i => "string" == typeof i || "number" == typeof i)))) return {
                status: !1,
                errMsg: `Invalid value type for catif-label[${ClaimsLabelMap.catif}], map key should be claim keys or arrays of claim keys.`
            };
            if (!Array.isArray(v) || 3 !== v.length) return {
                status: !1,
                errMsg: `Invalid value type for catif-label[${ClaimsLabelMap.catif}], map value should be array of 3 elements.`
            };
            const [a, b, c] = v;
            if ("number" != typeof a) return {
                status: !1,
                errMsg: `Invalid value type for catif-label[${ClaimsLabelMap.catif}], first array (map value) element must be of type number.`
            };
            if (!(b instanceof Map && Array.from(b.keys()).every((key => "string" == typeof key)))) return {
                status: !1,
                errMsg: `Invalid value type for catif-label[${ClaimsLabelMap.catif}], second array (map value) element must be of type map with string keys.`
            };
            if ("string" != typeof c) return {
                status: !1,
                errMsg: `Invalid value type for catif-label[${ClaimsLabelMap.catif}], third array (map value) element must be of type string.`
            };
        }
        return {
            status: !0
        };
    }
    static typeCheckCatr(value) {
        if (!(value instanceof Map)) return {
            status: !1,
            errMsg: `Invalid value type for catr-label[${ClaimsLabelMap.catr}], expected map.`
        };
        const mandatoryKeys = [];
        for (const [k, v] of value) {
            if ("number" != typeof k) return {
                status: !1,
                errMsg: `Invalid value type for catr-label[${ClaimsLabelMap.catr}], expected map with integer keys.`
            };
            if (0 === k || 1 === k || 2 === k || 7 === k) {
                if (0 != k && 1 !== k || mandatoryKeys.push(k), "number" != typeof v) return {
                    status: !1,
                    errMsg: `Invalid value type for catr-label[${ClaimsLabelMap.catr}], expected map with renewal-type, renewal-expadd, renewal-deadline-value value as number.`
                };
            } else if (3 === k || 4 === k) {
                if ("string" != typeof v) return {
                    status: !1,
                    errMsg: `Invalid value type for catr-label[${ClaimsLabelMap.catr}], expected map with renewal-cookie-name, renewal-header-name value as string.`
                };
            } else if (!(5 !== k && 6 !== k || Array.isArray(v) && v.every((i => "string" == typeof i)))) return {
                status: !1,
                errMsg: `Invalid value type for catr-label[${ClaimsLabelMap.catr}], expected map with renewal-cookie-params, renewal-header-params value as array of string.`
            };
        }
        return 2 !== mandatoryKeys.length ? {
            status: !1,
            errMsg: `Invalid value type for catr-label[${ClaimsLabelMap.catr}], expected renewable type and expiration extension params.`
        } : {
            status: !0
        };
    }
    static typeCheckCompositeClaim(value, claimName) {
        if (!Array.isArray(value)) return {
            status: !1,
            errMsg: `Invalid value type for ${claimName}-label[${ClaimsLabelMap[claimName]}], expected array of claim-set as Map.`
        };
        for (const a of value) if (!(a instanceof Map)) return {
            status: !1,
            errMsg: `Invalid value type for ${claimName}-label[${ClaimsLabelMap[claimName]}], expected array of claim-set as Map.`
        };
        for (const a of value) for (const [k, v] of a) {
            const claimsFieldCheck = ClaimsValidator.typeChecks(k, v);
            if (!claimsFieldCheck.status) return {
                status: !1,
                errMsg: `Invalid value type for ${claimName}-label[${ClaimsLabelMap[claimName]}], one of the claim in claim-set failed due to '${claimsFieldCheck.errMsg}'`
            };
        }
        return {
            status: !0
        };
    }
    static typeCheckEnc(value) {
        if (!(value instanceof Map)) return {
            status: !1,
            errMsg: `Invalid value type for enc-label[${ClaimsLabelMap.enc}], expected map.`
        };
        for (const v of value.values()) if (!(v instanceof Uint8Array || Array.isArray(v))) return {
            status: !1,
            errMsg: `Invalid value type for enc-label[${ClaimsLabelMap.enc}], expected map with values as Encrypt or Encrypt0 object.`
        };
        return {
            status: !0
        };
    }
    static typeCheckCatnip(value) {
        if (!Array.isArray(value)) return {
            status: !1,
            errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], expected array of IPv6/IPv4 type.`
        };
        for (const catNip of value) {
            if (!catNip.tag) return {
                status: !1,
                errMsg: `Module only support Tag 54 - IPv6 and Tag 52 - IPv4 type for catnip-label[${ClaimsLabelMap.catnip}], expected array of IPv6/IPv4 type.`
            };
            if (54 === catNip.tag) {
                if (Array.isArray(catNip.value)) {
                    if (catNip.value[0] < 0 || catNip.value[0] > 128) return {
                        status: !1,
                        errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], expected ipv6 prefix length to be between 0...128.`
                    };
                    if (catNip.value[1].length > 16 || 0 === catNip.value[1].length) return {
                        status: !1,
                        errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], invalid ipv6 address length.`
                    };
                } else if (catNip.value.length > 16 || 0 === catNip.value[1].length) return {
                    status: !1,
                    errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], invalid ipv6 address length.`
                };
            } else {
                if (52 !== catNip.tag) return {
                    status: !1,
                    errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], invalid tag for catnip value. Only Tag 54(IPv6) or Tag 52(IPv4) allowed.`
                };
                if (Array.isArray(catNip.value)) {
                    if (catNip.value[0] < 0 || catNip.value[0] > 32) return {
                        status: !1,
                        errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], expected ipv4 prefix length to be between 0...32.`
                    };
                    if (catNip.value[1].length > 4 || 0 === catNip.value[1].length) return {
                        status: !1,
                        errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], invalid ipv4 address length.`
                    };
                } else if (catNip.value.length > 4 || 0 === catNip.value[1].length) return {
                    status: !1,
                    errMsg: `Invalid value type for catnip-label[${ClaimsLabelMap.catnip}], invalid ipv4 address length.`
                };
            }
        }
        return {
            status: !0
        };
    }
    static validateIss(value, catOptions) {
        return catOptions.issuer && !catOptions.issuer.includes(value) ? Promise.resolve({
            status: !1,
            errMsg: `iss value ${value} does not match with expected.`
        }) : Promise.resolve({
            status: !0
        });
    }
    static validateSub(value, catOptions) {
        return catOptions.subject && !catOptions.subject.includes(value) ? Promise.resolve({
            status: !1,
            errMsg: `sub value ${value} does not match with expected.`
        }) : Promise.resolve({
            status: !0
        });
    }
    static validateAud(value, catOptions) {
        if (catOptions.audience) {
            const cwtAud = Array.isArray(value) ? value : [ value ];
            if (!catOptions.audience.some((item => cwtAud.includes(item)))) return Promise.resolve({
                status: !1,
                errMsg: `aud value ${value} does not match with expected.`
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static validateCrit(value, payload) {
        let encClaims = [];
        if (payload.get(ClaimsLabelMap.enc)) for (const k of payload.get(ClaimsLabelMap.enc).keys()) Array.isArray(k) ? encClaims = encClaims.concat(k) : encClaims.push(k);
        for (const c of value) {
            if (!encClaims.includes(c) && void 0 === payload.get(c)) return Promise.resolve({
                status: !1,
                errMsg: `One of critical claim ${c} is not found in the payload.`
            });
            if (!SupportedClaims.includes(c)) return Promise.resolve({
                status: !1,
                errMsg: `One of critical claim ${c} is not supported by the module.`
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static validateExp(value, catOptions) {
        if (!catOptions.ignoreExpiration) {
            if (Math.floor(Date.now() / 1e3) > value + (catOptions.clockTolerance || 0)) return Promise.resolve({
                status: !1,
                errMsg: "CAT token has been expired."
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static validateNbf(value, catOptions) {
        if (!catOptions.ignoreNotBefore) {
            if (value > Math.floor(Date.now() / 1e3) + (catOptions.clockTolerance || 0)) return Promise.resolve({
                status: !1,
                errMsg: "CAT token is not active."
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static validateIat(value) {
        return value > 0 ? Promise.resolve({
            status: !0
        }) : Promise.resolve({
            status: !1,
            errMsg: `iat value ${value} must be a positive integer.`
        });
    }
    static validateCatReplay(value) {
        return 0 !== value && 1 !== value ? Promise.resolve({
            status: !1,
            errMsg: "Invalid value for catreplay, expected 0 or 1."
        }) : 1 === value ? Promise.resolve({
            status: !1,
            errMsg: "CAT token replay not supported."
        }) : Promise.resolve({
            status: !0
        });
    }
    static validateCatv(value) {
        return 1 !== value ? Promise.resolve({
            status: !1,
            errMsg: `CAT token version ${value} not supported.`
        }) : Promise.resolve({
            status: !0
        });
    }
    static async validateCatu(value, request) {
        for (const [k, v] of value) switch (k) {
          case CatURILabelMap.scheme:
            {
                const cliScheme = request.scheme, result = await this.evalMatchRule(cliScheme, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu scheme match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.host:
            {
                const cliHost = request.host, result = await this.evalMatchRule(cliHost, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu host match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.port:
            {
                let port = request.host.split(":")[1];
                port || (port = "https" === request.scheme ? "443" : "80");
                const result = await this.evalMatchRule(port, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu port match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.path:
            {
                const cliPath = request.path, result = await this.evalMatchRule(cliPath, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu path match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.query:
            {
                const params = new URLSearchParams(request.query);
                params.delete("cat");
                const cliQuery = params.toString(), result = await this.evalMatchRule(cliQuery, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu query match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.parent_path:
            {
                const i = request.path.lastIndexOf("/"), parentPath = request.path.substring(0, i), result = await this.evalMatchRule(parentPath, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu parent path match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.filename:
            {
                let filename = request.path.split("/").pop();
                filename = (null == filename ? void 0 : filename.includes(".")) ? filename : "";
                const result = await this.evalMatchRule(filename, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu filename match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.stem:
            {
                let filename = request.path.split("/").pop();
                filename = (null == filename ? void 0 : filename.includes(".")) ? filename : "";
                const stem = null == filename ? void 0 : filename.slice(0, filename.lastIndexOf(".")), result = await this.evalMatchRule(stem, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu stem match rule failed, ${result.errMsg}`
                });
                break;
            }

          case CatURILabelMap.extension:
            {
                const filename = request.path.split("/").pop(), i = null == filename ? void 0 : filename.lastIndexOf("."), ext = -1 == i ? "" : null == filename ? void 0 : filename.slice(i, filename.length), result = await this.evalMatchRule(ext, v);
                if (!result.status) return Promise.resolve({
                    status: !1,
                    errMsg: `Catu extension match rule failed, ${result.errMsg}`
                });
                break;
            }

          default:
            return Promise.resolve({
                status: !1,
                errMsg: `Unsupported catu uri component key ${k}`
            });
        }
        return {
            status: !0
        };
    }
    static validateCatm(value, request) {
        const httpM = request.method;
        return value.includes(httpM) ? Promise.resolve({
            status: !0
        }) : Promise.resolve({
            status: !1,
            errMsg: `${httpM} method is not listed in catm claim. catm=${value}`
        });
    }
    static validateCatalpn(value, request) {
        const alpn = request.getVariable("PMUSER_ALPN"), alpnHex = base16.encode((new TextEncoder).encode(alpn));
        let isValid = !1;
        const alpnD = [];
        for (const a of value) {
            const aHex = base16.encode(new Uint8Array(a));
            alpnD.push("0x" + aHex), aHex === alpnHex && (isValid = !0);
        }
        return isValid ? Promise.resolve({
            status: !0
        }) : Promise.resolve({
            status: !1,
            errMsg: `0x${alpnHex} alpn is not listed in catapln claim. catalpn=${alpnD}`
        });
    }
    static async validateCath(value, request) {
        const headers = request.getHeaders();
        for (const [k, v] of value) {
            const cliHeaderVal = headers[k.toLowerCase()];
            if (!cliHeaderVal) return Promise.resolve({
                status: !1,
                errMsg: `${k.toLocaleLowerCase()} header is missing, required as per cath claim`
            });
            let status = !0;
            for (const hV of cliHeaderVal) {
                if (!(await this.evalMatchRule(hV, v)).status) {
                    status = !1;
                    break;
                }
            }
            if (!status) return Promise.resolve({
                status: !1,
                errMsg: `Cath match rule failed for header ${k}. Rule=${JSON.stringify(Object.fromEntries(v))}, header_values=${cliHeaderVal}`
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static validateCatgeoiso3166(value, request) {
        var _a, _b;
        const country = null === (_a = request.userLocation) || void 0 === _a ? void 0 : _a.country, region = null === (_b = request.userLocation) || void 0 === _b ? void 0 : _b.region;
        if (!country) return Promise.resolve({
            status: !1,
            errMsg: `Unable to find country code for request, required as per catgeoiso3166 claim. expected=${value}`
        });
        let result = !1;
        for (const iso3166 of value) {
            const s = iso3166.split("-"), c = s[0], r = s[1];
            if (country === c && void 0 === r) {
                result = !0;
                break;
            }
            if (country === c && r === region) {
                result = !0;
                break;
            }
        }
        return result ? Promise.resolve({
            status: !0
        }) : Promise.resolve({
            status: !1,
            errMsg: `Request's country / region code is not listed in catgeoiso3166 claim. expected=${value}}`
        });
    }
    static validateCatgeocoord(value, request) {
        var _a, _b;
        const latitude = null === (_a = request.userLocation) || void 0 === _a ? void 0 : _a.latitude, longitude = null === (_b = request.userLocation) || void 0 === _b ? void 0 : _b.longitude;
        if (!latitude) return Promise.resolve({
            status: !1,
            errMsg: `Unable to find latitude for request, required as per catgeocoord claim. expected=${value}`
        });
        if (!longitude) return Promise.resolve({
            status: !1,
            errMsg: `Unable to find longitude for request, required as per catgeocoord claim. expected=${value}`
        });
        const lat1 = parseFloat(latitude), lon1 = parseFloat(longitude);
        if (!this.validLat(lat1)) return Promise.resolve({
            status: !1,
            errMsg: "Invalid latitude value for request, must be a numeric value between 90 and -90"
        });
        if (!this.validLon(lon1)) return Promise.resolve({
            status: !1,
            errMsg: "Invalid longitude value for request, must be a numeric value between 180 and -180"
        });
        let result = !1;
        for (const val of value) {
            const [lat2, lon2, rad] = val;
            if (this.validLat(lat2) && this.validLon(lon2)) {
                if (this.calcHaversineDistance(lat1, lon1, lat2, lon2) < rad) {
                    result = !0;
                    break;
                }
            }
        }
        return result ? Promise.resolve({
            status: !0
        }) : Promise.resolve({
            status: !1,
            errMsg: `Catgeocoord match rule failed. Rule=${value}, lat=${lat1}, lon=${lon1}`
        });
    }
    static validateGeoHash(value, request) {
        var _a, _b;
        const latitude = null === (_a = request.userLocation) || void 0 === _a ? void 0 : _a.latitude, longitude = null === (_b = request.userLocation) || void 0 === _b ? void 0 : _b.longitude;
        if (!latitude) return Promise.resolve({
            status: !1,
            errMsg: "Unable to find latitude for request, required as per geohash claim."
        });
        if (!longitude) return Promise.resolve({
            status: !1,
            errMsg: "Unable to find longitude for request, required as per geohash claim."
        });
        const lat1 = parseFloat(latitude), lon1 = parseFloat(longitude);
        if (!this.validLat(lat1)) return Promise.resolve({
            status: !1,
            errMsg: "Invalid latitude value for request, must be a numeric value between 90 and -90"
        });
        if (!this.validLon(lon1)) return Promise.resolve({
            status: !1,
            errMsg: "Invalid longitude value for request, must be a numeric value between 180 and -180"
        });
        const precision = value.length;
        return Geohash.cta_encode(lat1, lon1, precision) !== value ? Promise.resolve({
            status: !1,
            errMsg: `Geohash match rule failed. expected=${value}, lat=${lat1}, lon=${lon1}`
        }) : Promise.resolve({
            status: !0
        });
    }
    static async validateAnd(value, catOptions, request) {
        for (const payload of value) {
            const result = await ClaimsValidator.validateClaimSet(payload, catOptions, request);
            if (!result.status) return Promise.resolve({
                status: result.status,
                errMsg: `And match rule failed, reason=${result.errMsg}`
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static async validateOr(value, catOptions, request) {
        for (const payload of value) {
            if ((await ClaimsValidator.validateClaimSet(payload, catOptions, request)).status) return Promise.resolve({
                status: !0
            });
        }
        return Promise.resolve({
            status: !1,
            errMsg: "Or match rule failed, none of the claim set is satisfied for the request"
        });
    }
    static async validateNor(value, catOptions, request) {
        for (const payload of value) {
            if ((await ClaimsValidator.validateClaimSet(payload, catOptions, request)).status) return Promise.resolve({
                status: !1,
                errMsg: "Nor match rule failed, one of the claim set is satisfied for the request"
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static async validateEnc(value, catOptions, payload, request, decryptionKey) {
        const critClaims = payload.get(ClaimsLabelMap.crit);
        let encClaims = [];
        for (const k of value.keys()) Array.isArray(k) ? encClaims = encClaims.concat(k) : encClaims.push(k);
        const commonClaims = critClaims.filter((v => encClaims.includes(v)));
        if (commonClaims.length > 0 && !decryptionKey) return Promise.resolve({
            status: !1,
            errMsg: `Failed to validate crit claims from enc-label[${ClaimsLabelMap.enc}], missing decryption key`
        });
        if (decryptionKey) for (const [k, v] of value) {
            let val, keys;
            const claimsString = [];
            keys = Array.isArray(k) ? k : [ k ];
            for (const k1 of keys) claimsString.push(ClaimsLabelMap.enc[k1]);
            try {
                if (val = await ClaimsValidator.decrypt(v, decryptionKey), Array.isArray(k)) {
                    if (!Array.isArray(val) || k.length > val.length) return Promise.resolve({
                        status: !1,
                        errMsg: `Failed to validate claims ${claimsString} from enc-label[${ClaimsLabelMap.enc}], reason=values of COSE_Encrypt0 has cardinality is less than claim keys`
                    });
                    for (let i = 0; i < keys.length; i++) {
                        let validationResult = ClaimsValidator.typeChecks(keys[i], val[i]);
                        if (!validationResult.status) return Promise.resolve({
                            status: !1,
                            errMsg: validationResult.errMsg
                        });
                        if (validationResult = await ClaimsValidator.validate(keys[i], val[i], catOptions, payload, request, decryptionKey), 
                        !validationResult.status) return Promise.resolve({
                            status: !1,
                            errMsg: validationResult.errMsg
                        });
                    }
                } else {
                    let validationResult = ClaimsValidator.typeChecks(k, val);
                    if (!validationResult.status) return Promise.resolve({
                        status: !1,
                        errMsg: validationResult.errMsg
                    });
                    if (validationResult = await ClaimsValidator.validate(k, val, catOptions, payload, request, decryptionKey), 
                    !validationResult.status) return Promise.resolve({
                        status: !1,
                        errMsg: validationResult.errMsg
                    });
                }
            } catch (error) {
                const cC = keys.filter((v => commonClaims.includes(v)));
                if (cC.length > 0) return Promise.resolve({
                    status: !1,
                    errMsg: `Failed to validate critical claims ${claimsString} from enc-label[${ClaimsLabelMap.enc}], reason=${error.message}`
                });
                logger.warn(`Failed to validate claims ${claimsString} from enc-label[${ClaimsLabelMap.enc}], reason=${error.message}`);
            }
        }
        return Promise.resolve({
            status: !0
        });
    }
    static validateCatnip(value, request) {
        const clientIp = request.getVariable("PMUSER_CLIENT_IP");
        if (!clientIp) return Promise.resolve({
            status: !1,
            errMsg: "Unable to fetch client ip from request. Make sure PMUSER_CLIENT_IP variable is set accordingly."
        });
        let isValid = !1;
        const validIpsList = [];
        for (const catNip of value) {
            if (54 === catNip.tag) if (Array.isArray(catNip.value)) {
                const cidr = catNip.value[0];
                let ip = base16.encode(new Uint8Array(catNip.value[1])).match(/.{1,4}/g).join(":");
                ip = ip.split(":").length < 8 ? ip + "::" : ip, validIpsList.push(ip + "/" + cidr);
            } else {
                let ip = base16.encode(new Uint8Array(catNip.value)).match(/.{1,4}/g).join(":");
                ip = ip.split(":").length < 8 ? ip + "::" : ip, validIpsList.push(ip);
            } else if (Array.isArray(catNip.value)) {
                const cidr = catNip.value[0];
                let ip = new Uint8Array(catNip.value[1]).join(".");
                const pad = ".0".repeat(4 - ip.split(".").length);
                ip = 4 - ip.split(".").length > 0 ? ip + pad : ip, validIpsList.push(ip + "/" + cidr);
            } else {
                let ip = new Uint8Array(catNip.value).join(".");
                const pad = ".0".repeat(4 - ip.split(".").length);
                ip = 4 - ip.split(".").length > 0 ? ip + pad : ip, validIpsList.push(ip);
            }
            if (isValid = ipRangeCheck(clientIp, validIpsList), !isValid) return Promise.resolve({
                status: !1,
                errMsg: `${clientIp} is not listed in acceptable networks ${validIpsList}`
            });
        }
        return Promise.resolve({
            status: !0
        });
    }
    static async validateClaimSet(payload, catOptions, request) {
        for (const [k, v] of payload) {
            const result = await ClaimsValidator.validate(k, v, catOptions, payload, request);
            if (!result.status) return Promise.resolve(result);
        }
        return Promise.resolve({
            status: !0
        });
    }
    static async evalMatchRule(tobeCompared, matchValue) {
        for (const [t, v] of matchValue) switch (t) {
          case MatchTypeLabelMap.exact:
            return tobeCompared !== v ? {
                status: !1,
                errMsg: `${tobeCompared} does not exactly match ${v}`
            } : {
                status: !0
            };

          case MatchTypeLabelMap.prefix:
            return tobeCompared.startsWith(v) ? {
                status: !0
            } : {
                status: !1,
                errMsg: `${v} is not prefix of ${tobeCompared}`
            };

          case MatchTypeLabelMap.suffix:
            return tobeCompared.endsWith(v) ? {
                status: !0
            } : {
                status: !1,
                errMsg: `${v} is not suffix of ${tobeCompared}`
            };

          case MatchTypeLabelMap.contains:
            return tobeCompared.includes(v) ? {
                status: !0
            } : {
                status: !1,
                errMsg: `${tobeCompared} does not include ${v}`
            };

          case MatchTypeLabelMap.regex:
            {
                const regex = v[0];
                let flag = v[1];
                flag || (flag = void 0);
                const re = new RegExp(regex, flag);
                return re.test(tobeCompared) ? {
                    status: !0
                } : {
                    status: !1,
                    errMsg: `${tobeCompared} does not contain ${re.source}. Regex=${regex}, flag=${flag}.`
                };
            }

          case MatchTypeLabelMap.sha256:
            {
                let enc;
                enc = "string" == typeof tobeCompared ? (new TextEncoder).encode(tobeCompared) : tobeCompared;
                const encoded = await crypto.subtle.digest("SHA-256", enc), encHex = base16.encode(new Uint8Array(encoded)), vHex = base16.encode(v);
                return encHex !== vHex ? {
                    status: !1,
                    errMsg: `${tobeCompared} sha256 match rule failed. src=0x${encHex}, target=0x${vHex}.`
                } : {
                    status: !0
                };
            }

          case MatchTypeLabelMap.sha512:
            {
                let enc;
                enc = "string" == typeof tobeCompared ? (new TextEncoder).encode(tobeCompared) : tobeCompared;
                const encoded = await crypto.subtle.digest("SHA-512", enc), encHex = base16.encode(new Uint8Array(encoded)), vHex = base16.encode(v);
                return encHex !== vHex ? {
                    status: !1,
                    errMsg: `${tobeCompared} sha512 match rule failed. src=0x${encHex}, target=0x${vHex}.`
                } : {
                    status: !0
                };
            }

          default:
            return {
                status: !1,
                errMsg: `Invalid match type rule ${t}`
            };
        }
        return {
            status: !0
        };
    }
    static calcHaversineDistance(lat1, lon1, lat2, lon2) {
        const radianLat1 = this.ToRadians(lat1), radianLon1 = this.ToRadians(lon1), radianLat2 = this.ToRadians(lat2), radianDistanceLat = radianLat1 - radianLat2, radianDistanceLon = radianLon1 - this.ToRadians(lon2), sinLat = Math.sin(radianDistanceLat / 2), sinLon = Math.sin(radianDistanceLon / 2), a = Math.pow(sinLat, 2) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLon, 2);
        return 12756200 * Math.asin(Math.min(1, Math.sqrt(a)));
    }
    static ToRadians(degree) {
        return degree * (Math.PI / 180);
    }
    static validLat(lat) {
        return lat >= -90 && lat <= 90;
    }
    static validLon(lon) {
        return lon >= -180 && lon <= 180;
    }
    static async decrypt(val, decryptionKey) {
        if (val instanceof Uint8Array && (val = globalThis.cbordec.decode(val)), !Array.isArray(val) || 4 !== val.length && 3 !== val.length) throw new Error("Not a valid COSE_Encrypt or COSE_Encrypt0 object.");
        {
            if (4 === val.length) throw new Error("COSE_Encrypt object not supported by the module.");
            const [p, u, ciphertext] = val;
            let pH = p.length ? globalThis.cbordec.decode(p) : new Uint8Array(0);
            pH = Object.keys(pH).length ? pH : new Uint8Array(0);
            const uH = Object.keys(u).length ? u : new Uint8Array(0);
            let alg = pH !== new Uint8Array(0) ? pH[HeaderLabelMap.alg] : uH !== new Uint8Array(0) ? u[HeaderLabelMap.alg] : void 0;
            if (!alg) throw new Error("Missing alg value in COSE_Encrypt0 header");
            alg = AlgoStringMap[Number(alg)];
            const iv = u[HeaderLabelMap.IV], Enc_structure = [ "Encrypt0", p, new Uint8Array(0) ], aad = globalThis.cborenc.encode(Enc_structure), decryptedData = await crypto.subtle.decrypt({
                name: "AES-GCM",
                iv: new Uint8Array(iv),
                additionalData: new Uint8Array(aad)
            }, decryptionKey, ciphertext);
            if (void 0 === decryptedData) throw new Error("Error decrypting cipher.");
            return decryptedData;
        }
    }
}

const cborDecoder = new Decoder;

class CAT {
    constructor(catOptions) {
        this.catOptions = catOptions || {}, this.validateOptionTypes();
    }
    decode(catTokenBytes) {
        if (!(catTokenBytes instanceof Uint8Array)) throw new Error("Invalid token type, expected Uint8Array!");
        let coseMessage = cborDecoder.decode(catTokenBytes);
        if (this.catOptions.isCWTTagAdded) {
            if (61 !== coseMessage.tag) throw new Error("CAT token malformed: expected CWT CBOR tag for the token!");
            coseMessage = coseMessage.value;
        }
        if (this.catOptions.isCoseCborTagAdded) {
            if (!coseMessage.tag) throw new Error("CAT token malformed: invalid COSE CBOR tag for the token!");
            coseMessage = coseMessage.value;
        }
        const [p, u, payload] = coseMessage;
        return {
            header: {
                p: p.length ? cborDecoder.decode(p) : new Map,
                u
            },
            payload: cborDecoder.decode(payload)
        };
    }
    isCATWellFormed(payload) {
        if (!(payload instanceof Map)) throw new Error("Invalid payload type, expected Map!");
        for (let [key, value] of payload) {
            let result = ClaimsValidator.typeChecks(key, value);
            if (!result.status) return result;
        }
        return {
            status: !0
        };
    }
    async isCATAcceptable(payload, request, decryptionKey) {
        if (!(payload instanceof Map)) throw new Error("Invalid payload type, expected Map!");
        if (!request) throw new Error("Invalid request type, expected http request object!");
        if (this.catOptions.issuer && !payload.get(ClaimsLabelMap.iss)) return {
            status: !1,
            errMsg: "iss value is null, does not match with expected."
        };
        if (this.catOptions.subject && !payload.get(ClaimsLabelMap.sub)) return {
            status: !1,
            errMsg: "sub value is null, does not match with expected."
        };
        if (this.catOptions.audience && !payload.get(ClaimsLabelMap.aud)) return {
            status: !1,
            errMsg: "aud value is null, does not match with expected."
        };
        for (const [k, v] of payload) {
            let result = await ClaimsValidator.validate(k, v, this.catOptions, payload, request, decryptionKey);
            if (!result.status) return result;
        }
        return Promise.resolve({
            status: !0
        });
    }
    validateOptionTypes() {
        if (void 0 === this.catOptions.isCWTTagAdded) this.catOptions.isCWTTagAdded = !1; else if ("boolean" != typeof this.catOptions.isCWTTagAdded) throw new Error("Invalid catOptions: isCWTTagAdded must be boolean");
        if (null == this.catOptions.isCoseCborTagAdded) this.catOptions.isCoseCborTagAdded = !0; else if ("boolean" != typeof this.catOptions.isCoseCborTagAdded) throw new Error("Invalid catOptions: isCoseCborTagAdded must be boolean");
        if (!(void 0 === this.catOptions.issuer || Array.isArray(this.catOptions.issuer) && 0 !== this.catOptions.issuer.length && this.catOptions.issuer.every((item => "string" == typeof item)))) throw new Error("Invalid catOptions: issuer must be list of non empty string");
        if (!(void 0 === this.catOptions.subject || Array.isArray(this.catOptions.subject) && 0 !== this.catOptions.subject.length && this.catOptions.subject.every((item => "string" == typeof item)))) throw new Error("Invalid catOptions: subject must be list of non empty string");
        if (!(void 0 === this.catOptions.audience || Array.isArray(this.catOptions.audience) && 0 !== this.catOptions.audience.length && this.catOptions.audience.every((item => "string" == typeof item)))) throw new Error("Invalid catOptions: audience must be list of non empty string");
        if (void 0 === this.catOptions.ignoreExpiration) this.catOptions.ignoreExpiration = !1; else if ("boolean" != typeof this.catOptions.ignoreExpiration) throw new Error("Invalid catOptions: ignoreExpiration must be boolean");
        if (void 0 === this.catOptions.ignoreNotBefore) this.catOptions.ignoreNotBefore = !1; else if ("boolean" != typeof this.catOptions.ignoreNotBefore) throw new Error("Invalid catOptions: ignoreNotBefore must be boolean");
        if (void 0 !== this.catOptions.clockTolerance && "number" != typeof this.catOptions.clockTolerance) throw new Error("Invalid catOptions: clockTolerance must be number");
        void 0 === this.catOptions.clockTolerance && (this.catOptions.clockTolerance = 60);
    }
}

export { AlgoLabelMap, CAT, CatRLabelMap, CatRRenewableTypes, CatURILabelMap, ClaimsLabelMap, HeaderLabelMap, MatchTypeLabelMap };
