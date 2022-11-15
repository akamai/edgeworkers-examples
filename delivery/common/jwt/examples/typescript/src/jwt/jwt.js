import { crypto } from "crypto";

import { base64url, TextEncoder } from "encoding";

class JWTUtil {
    static isEmptyString(str) {
        return !str || 0 === str.trim().length;
    }
}

class JWTValidator {
    constructor(jwtOptions) {
        this.jwtOptions = jwtOptions || {}, this.validateOptionTypes(), this.algorithms = [ "RS256", "RS384", "RS512", "HS256", "HS384", "HS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" ], 
        this.jwtOptions.allowUnsecuredToken && this.algorithms.push("NONE");
    }
    async validate(base64JWTToken, keys) {
        var _a, _b;
        if ("string" != typeof base64JWTToken) throw new Error("Invalid token type, expected string!");
        if (!Array.isArray(keys) || !keys.every((elem => void 0 !== elem.type || void 0 !== elem.extractable || null != elem.algorithm || null != elem.usages))) throw new Error("Invalid keys type, expected list of CryptoKey!");
        const jwtParts = base64JWTToken.split(".");
        if (jwtParts.length > 3 || jwtParts.length < 2) throw new Error("JWT malformed: Invalid number of parts for JWT token. expected 3 or 2 (unsecured JWT)!");
        if (JWTUtil.isEmptyString(jwtParts[0])) throw new Error("JWT malformed: jwt header cannot be empty");
        if (JWTUtil.isEmptyString(jwtParts[1])) throw new Error("JWT malformed: jwt payload cannot be empty");
        const jwtHBin = base64url.decode(jwtParts[0], "String"), jwtPBin = base64url.decode(jwtParts[1], "String"), jwtHeader = JSON.parse(jwtHBin), jwtPayload = JSON.parse(jwtPBin);
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
        if ("NONE" === jwtHeader.alg.toUpperCase()) {
            if (null === (_a = this.algorithms) || void 0 === _a ? void 0 : _a.includes(jwtHeader.alg.toUpperCase())) return {
                header: jwtHeader,
                payload: jwtPayload
            };
            throw new Error("Unsecured JWT Token are not allowed");
        }
        if (!(null === (_b = this.algorithms) || void 0 === _b ? void 0 : _b.includes(jwtHeader.alg.toUpperCase()))) throw new Error(`${jwtHeader.alg} is not supported at the moment`);
        for (const cryptoKey of keys) {
            if (await this.validateSignature(base64JWTToken, jwtParts, jwtHeader.alg.toUpperCase(), cryptoKey)) return {
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
        if (void 0 === this.jwtOptions.allowUnsecuredToken) this.jwtOptions.allowUnsecuredToken = !1; else if ("boolean" != typeof this.jwtOptions.allowUnsecuredToken) throw new Error("Invalid jwtOptions: allowUnsecuredToken must be boolean");
        if (void 0 === this.jwtOptions.clockTolerance) this.jwtOptions.clockTolerance = 60; else if ("number" != typeof this.jwtOptions.clockTolerance) throw new Error("Invalid jwtOptions: clockTimestamp must be number");
    }
    async validateSignature(base64JWTToken, jwtParts, alg, cryptoKey) {
        switch (alg) {
          case "RS512":
          case "RS384":
          case "RS256":
            return await crypto.subtle.verify({
                name: "RSASSA-PKCS1-v1_5"
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "HS512":
          case "HS384":
          case "HS256":
            return await crypto.subtle.verify({
                name: "HMAC"
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "PS512":
            return await crypto.subtle.verify({
                name: "RSA-PSS",
                saltLength: 64
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "PS384":
            return await crypto.subtle.verify({
                name: "RSA-PSS",
                saltLength: 48
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "PS256":
            return await crypto.subtle.verify({
                name: "RSA-PSS",
                saltLength: 32
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "ES512":
            return await crypto.subtle.verify({
                name: "ECDSA",
                hash: {
                    name: "SHA-512"
                }
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "ES384":
            return await crypto.subtle.verify({
                name: "ECDSA",
                hash: {
                    name: "SHA-384"
                }
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          case "ES256":
            return await crypto.subtle.verify({
                name: "ECDSA",
                hash: {
                    name: "SHA-256"
                }
            }, cryptoKey, base64url.decode(jwtParts[2], "Uint8Array").buffer, (new TextEncoder).encode(base64JWTToken.substring(0, jwtParts[0].length + 1 + jwtParts[1].length)));

          default:
            throw new Error(`${alg} is not supported at the moment`);
        }
    }
}

export { JWTValidator };
