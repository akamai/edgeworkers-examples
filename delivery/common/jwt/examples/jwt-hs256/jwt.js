import { atob } from "base64";

import { crypto, pem2ab } from "crypto";

import { TextEncoder } from "encoding";

class JWTUtil {
    static isEmptyString(str) {
        return !str || 0 === str.trim().length;
    }
    static base64URLDecode(base64Str) {
        const pad = (base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/")).length % 4;
        if (pad) {
            if (1 === pad) throw new Error("InvalidLengthError: Input base64url string is the wrong length to determine padding");
            base64Str += new Array(5 - pad).join("=");
        }
        try {
            const binaryString = atob(base64Str), len = binaryString.length, bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            return bytes.buffer;
        } catch (error) {
            throw new Error("InvalidLengthError: JWT signature is not correctly encoded");
        }
    }
    static hexToUint8Array(hexString) {
        if (hexString.length % 2 != 0) throw new Error("Invalid hex string");
        const numBytes = hexString.length / 2, byteArray = new Uint8Array(numBytes);
        for (let i = 0; i < numBytes; i++) byteArray[i] = parseInt(hexString.substr(2 * i, 2), 16);
        return byteArray;
    }
}

class JWTValidator {
    constructor(jwtOptions) {
        this.jwtOptions = jwtOptions || {}, this.jwtOptions.algorithms = [ "RS256", "HS256" ], 
        this.validateOptionTypes();
    }
    decode(base64JWTToken) {
        var _a;
        if ("string" != typeof base64JWTToken) throw new Error("Invalid arguments!");
        const jwtParts = base64JWTToken.split(".");
        let jwtHeader, jwtPayload;
        if (3 !== jwtParts.length || JWTUtil.isEmptyString(jwtParts[0]) || JWTUtil.isEmptyString(jwtParts[1])) throw new Error("JWT malformed: invalid jwt format");
        try {
            jwtHeader = JSON.parse(atob(jwtParts[0])), jwtPayload = JSON.parse(atob(jwtParts[1]));
        } catch (error) {
            throw new Error("JWT malformed: token not correctly encoded");
        }
        if (jwtHeader.alg && "NONE" !== jwtHeader.alg.toUpperCase() && !(null === (_a = this.jwtOptions.algorithms) || void 0 === _a ? void 0 : _a.includes(jwtHeader.alg.toUpperCase()))) throw new Error(`${jwtHeader.alg} is not supported at the moment`);
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
        return {
            header: jwtHeader,
            payload: jwtPayload
        };
    }
    validateOptionTypes() {
        if (void 0 !== this.jwtOptions.issuer && ("string" != typeof this.jwtOptions.issuer || 0 === this.jwtOptions.issuer.trim().length)) throw new Error("Invalid jwtOptions: issuer must be non empty string");
        if (void 0 !== this.jwtOptions.audience && ("string" != typeof this.jwtOptions.audience || 0 === this.jwtOptions.audience.trim().length)) throw new Error("Invalid jwtOptions: audience must be non empty string");
        if (void 0 !== this.jwtOptions.subject && ("string" != typeof this.jwtOptions.subject || 0 === this.jwtOptions.subject.trim().length)) throw new Error("Invalid jwtOptions: subject must be non empty string");
        if (void 0 === this.jwtOptions.ignoreExpiration) this.jwtOptions.ignoreExpiration = !0; else if ("boolean" != typeof this.jwtOptions.ignoreExpiration) throw new Error("Invalid jwtOptions: ignoreExpiration must be boolean");
        if (void 0 === this.jwtOptions.ignoreNotBefore) this.jwtOptions.ignoreNotBefore = !0; else if ("boolean" != typeof this.jwtOptions.ignoreNotBefore) throw new Error("Invalid jwtOptions: ignoreNotBefore must be boolean");
        if (void 0 === this.jwtOptions.clockTolerance) this.jwtOptions.clockTolerance = 60; else if ("number" != typeof this.jwtOptions.clockTolerance) throw new Error("Invalid jwtOptions: clockTimestamp must be number");
    }
    async validate(base64JWTToken, alg, key) {
        if ("string" != typeof base64JWTToken || "string" != typeof alg || "string" != typeof key) throw new Error("Invalid arguments!");
        const jwtParts = base64JWTToken.split(".");
        switch (alg) {
          case "RS256":
            try {
                const cryptoKey = await crypto.subtle.importKey("spki", pem2ab(key), {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: "SHA-256"
                }, !1, [ "verify" ]);
                return await crypto.subtle.verify({
                    name: "RSASSA-PKCS1-v1_5"
                }, cryptoKey, JWTUtil.base64URLDecode(jwtParts[2]), (new TextEncoder).encode(`${jwtParts[0]}.${jwtParts[1]}`));
            } catch (error) {
                throw error;
            }

          case "HS256":
            try {
                const iKey = await crypto.subtle.importKey("raw", JWTUtil.hexToUint8Array(key).buffer, {
                    name: "HMAC",
                    hash: "SHA-256"
                }, !1, [ "verify" ]);
                return await crypto.subtle.verify({
                    name: "HMAC"
                }, iKey, JWTUtil.base64URLDecode(jwtParts[2]), (new TextEncoder).encode(`${jwtParts[0]}.${jwtParts[1]}`));
            } catch (error) {
                throw error;
            }

          default:
            throw new Error(`${alg} is not supported at the moment`);
        }
    }
}

export { JWTValidator };
