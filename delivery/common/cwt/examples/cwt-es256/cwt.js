/** @preserve @version 1.1.1 */
import { crypto } from "crypto";

import { Encoder, Decoder } from "./cbor-x.js";

const COSE_Mac0 = 17, COSE_Mac = 97, COSE_Sign = 98, COSE_Sign1 = 18, COSE_Encrypt0 = 16, COSE_Encrypt = 96, coseAlgTags = {
    5: "HMAC 256/256",
    "-7": "ES256"
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

CWTUtil.EMPTY_BUFFER = new Uint8Array(0);

class Sign {
    static async verifySignature(alg, message, signature, keys) {
        if ("ES256" === alg) {
            let isSignVerified = !1;
            for (const key of keys) if (isSignVerified = await crypto.subtle.verify({
                name: "ECDSA",
                hash: "SHA-256"
            }, key, signature, new Uint8Array(message)), isSignVerified) return Promise.resolve(isSignVerified);
            return Promise.resolve(isSignVerified);
        }
        throw new Error(`Unsupported Algorithm, ${alg}`);
    }
}

globalThis.cborenc = new Encoder({
    tagUint8Array: !1
}), globalThis.cbordec = new Decoder;

class CWTValidator {
    constructor(cwtOptions) {
        this.cwtOptions = cwtOptions || {}, this.validateOptionTypes();
    }
    async validate(tokenBuf, keys, externalAAD) {
        if (!(tokenBuf instanceof Uint8Array)) throw new Error("Invalid token type, expected Uint8Array!");
        if (externalAAD && !(externalAAD instanceof Uint8Array)) throw new Error("Invalid externalAAD type, expected Uint8Array!");
        if (!Array.isArray(keys) || !keys.every((elem => void 0 !== elem.type || void 0 !== elem.extractable || null != elem.algorithm || null != elem.usages))) throw new Error("Invalid keys type, expected list of CryptoKey!");
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
        switch (cwtType) {
          case COSE_Mac0:
            {
                if (!Array.isArray(coseMessage) || 4 !== coseMessage.length) throw new Error("CWT malformed: invalid COSE message structure for COSE CBOR MAC0Tag, expected array of length 4!");
                const [p, u, payload, tag] = coseMessage;
                let pH = p.length ? globalThis.cbordec.decode(p) : CWTUtil.EMPTY_BUFFER;
                pH = pH.size ? pH : CWTUtil.EMPTY_BUFFER;
                const uH = u.size ? u : CWTUtil.EMPTY_BUFFER;
                let alg;
                if (headerValidation && this.validateHeader(pH, !0), pH !== CWTUtil.EMPTY_BUFFER) alg = pH.get(HeaderLabelToKey_alg); else {
                    if (uH === CWTUtil.EMPTY_BUFFER) throw new Error("CWT malformed: unable to find algo field from CWT token.");
                    alg = u.get(HeaderLabelToKey_alg);
                }
                alg = coseAlgTags[alg.toString()];
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

          case COSE_Sign1:
            {
                if (!Array.isArray(coseMessage) || 4 !== coseMessage.length) throw new Error("CWT malformed: invalid COSE message structure for COSE CBOR COSE_Sign1, expected array of length 4!");
                const [p, u, payload, signer] = coseMessage;
                let pH = p.length ? globalThis.cbordec.decode(p) : CWTUtil.EMPTY_BUFFER;
                pH = pH.size ? pH : CWTUtil.EMPTY_BUFFER;
                const uH = u.size ? u : CWTUtil.EMPTY_BUFFER;
                let alg;
                if (headerValidation && this.validateHeader(pH, !0), pH !== CWTUtil.EMPTY_BUFFER) alg = pH.get(HeaderLabelToKey_alg); else {
                    if (uH === CWTUtil.EMPTY_BUFFER) throw new Error("CWT malformed: unable to find algo field from CWT token.");
                    alg = u.get(HeaderLabelToKey_alg);
                }
                alg = coseAlgTags[alg.toString()];
                const SigStructure = [ "Signature1", p, externalAAD, payload ], toBeVeried = globalThis.cborenc.encode(SigStructure);
                if (!await Sign.verifySignature(alg, toBeVeried, signer, keys)) throw new Error("CWT token signature verification failed!");
                const decodedPayload = globalThis.cbordec.decode(payload);
                return Promise.resolve({
                    header: {
                        p: pH,
                        u: uH
                    },
                    payload: decodedPayload
                });
            }

          default:
            throw new Error(`COSE CBOR tag ${cwtType} is not supported at the moment`);
        }
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

export { CWTUtil, CWTValidator };
