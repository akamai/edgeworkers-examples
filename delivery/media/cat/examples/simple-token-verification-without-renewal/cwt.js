/** @preserve @version 1.2.0 */
import { crypto } from "crypto";

import { Encoder, Decoder, Tag } from "./cbor-x.js";

import { logger } from "log";

const COSE_Mac0 = 17, COSE_Mac = 97, COSE_Sign = 98, COSE_Sign1 = 18, COSE_Encrypt0 = 16, COSE_Encrypt = 96, coseAlgTags = {
    "-7": "ES256",
    5: "HS256"
}, HeaderLabels = {
    alg: 1,
    crit: 2,
    kid: 4
}, ClaimLabels = {
    iss: 1,
    sub: 2,
    aud: 3,
    exp: 4,
    nbf: 5,
    iat: 6,
    cti: 7
}, AlgorithmLabels = {
    ES256: -7,
    HS256: 5
};

class Mac {
    static async verifyHMAC(alg, message, signature, key) {
        if ("HS256" === alg) return await crypto.subtle.verify({
            name: "HMAC"
        }, key, signature, message);
        throw new Error(`Unsupported Algorithm, ${alg}`);
    }
    static async doSign(signaturePayload, key, alg) {
        if ("HS256" === alg) {
            return await crypto.subtle.sign({
                name: "HMAC",
                hash: {
                    name: "SHA-256"
                }
            }, key, signaturePayload);
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
        if (payload instanceof Map) {
            const result = new Map;
            for (const [k, v] of payload) {
                const tK = labelsMap[k] ? labelsMap[k] : k, tV = translators && translators[tK] ? translators[tK](v) : v;
                result.set(tK, tV);
            }
            return result;
        }
        {
            const result = new Map;
            for (const param in payload) {
                const key = labelsMap[param] ? labelsMap[param] : param, theValue = translators && translators[key] ? translators[key](payload[param]) : payload[param];
                result.set(key, theValue);
            }
            return result;
        }
    }
    static isUint8ArrayEqual(arr1, arr2) {
        return arr1 instanceof Uint8Array && (arr2 instanceof Uint8Array && (arr1.length === arr2.length && arr1.every(((value, index) => value === arr2[index]))));
    }
}

CWTUtil.EMPTY_BUFFER = new Uint8Array(0);

class Sign {
    static async verifySignature(alg, message, signature, key) {
        if ("ES256" === alg) return await crypto.subtle.verify({
            name: "ECDSA",
            hash: "SHA-256"
        }, key, signature, new Uint8Array(message));
        throw new Error(`Unsupported Algorithm, ${alg}`);
    }
    static async doSign(signaturePayload, key, alg) {
        if ("ES256" === alg) return await crypto.subtle.sign({
            name: "ECDSA",
            hash: "SHA-256"
        }, key, signaturePayload);
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
    async validate(tokenBuf, verifiers) {
        if (!(tokenBuf instanceof Uint8Array)) throw new Error("Invalid token type, expected Uint8Array!");
        if (verifiers.find((elem => void 0 === elem.key || void 0 === elem.key.type || null == elem.key.algorithm || null == elem.key.usages || elem.externalAAD && !(elem.externalAAD instanceof Uint8Array) || elem.kid && !(elem.kid instanceof Uint8Array)))) throw new Error("Invalid verifiers, expected list of verifier with valid crypto key!");
        let coseMessage = globalThis.cbordec.decode(tokenBuf), cwtType = this.cwtOptions.defaultCoseMsgType;
        if (this.cwtOptions.isCWTTagAdded) {
            if (61 !== coseMessage.tag) throw new Error("CWT malformed: expected CWT CBOR tag for the token!");
            coseMessage = coseMessage.value;
        }
        if (this.cwtOptions.isCoseCborTagAdded) {
            if (cwtType = coseMessage.tag, ![ COSE_Mac0, COSE_Mac, COSE_Sign, COSE_Sign1, COSE_Encrypt, COSE_Encrypt0 ].includes(cwtType)) throw new Error("CWT malformed: invalid COSE CBOR tag!");
            coseMessage = coseMessage.value;
        }
        const cwtJSON = await this.verifyCoseMessage(coseMessage, cwtType, verifiers, this.cwtOptions.headerValidation);
        return this.validateClaims(cwtJSON.payload), cwtJSON;
    }
    async verifyCoseMessage(coseMessage, cwtType, verifiers, headerValidation) {
        switch (cwtType) {
          case COSE_Mac0:
            {
                if (!Array.isArray(coseMessage) || 4 !== coseMessage.length) throw new Error("CWT malformed: invalid COSE message structure for COSE CBOR MAC0Tag, expected array of length 4!");
                const [p, u, payload, tag] = coseMessage;
                let pH = p.length ? globalThis.cbordec.decode(p) : CWTUtil.EMPTY_BUFFER;
                const uH = u.size ? u : CWTUtil.EMPTY_BUFFER;
                let alg;
                if (headerValidation && this.validateHeader(pH, !0), pH !== CWTUtil.EMPTY_BUFFER) alg = pH.get(HeaderLabels.alg); else {
                    if (uH === CWTUtil.EMPTY_BUFFER) throw new Error("CWT malformed: unable to find algo field from CWT token.");
                    alg = uH.get(HeaderLabels.alg);
                }
                let pP = pH.size ? p : CWTUtil.EMPTY_BUFFER;
                alg = coseAlgTags[alg];
                let isSignVerified = !1;
                for (const verifier of verifiers) {
                    const MACstructure = [ "MAC0", pP, verifier.externalAAD ? verifier.externalAAD : CWTUtil.EMPTY_BUFFER, payload ], toBeVerified = globalThis.cborenc.encode(MACstructure);
                    if (isSignVerified = await Mac.verifyHMAC(alg, toBeVerified, tag, verifier.key), 
                    isSignVerified) break;
                }
                if (!isSignVerified) throw new Error("CWT token signature verification failed!");
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
                const [p, u, payload, signature] = coseMessage;
                let pH = p.length ? globalThis.cbordec.decode(p) : CWTUtil.EMPTY_BUFFER;
                pH = pH.size ? pH : CWTUtil.EMPTY_BUFFER;
                const uH = u.size ? u : CWTUtil.EMPTY_BUFFER;
                let alg;
                if (headerValidation && this.validateHeader(pH, !0), pH !== CWTUtil.EMPTY_BUFFER) alg = pH.get(HeaderLabels.alg); else {
                    if (uH === CWTUtil.EMPTY_BUFFER) throw new Error("CWT malformed: unable to find algo field from CWT token.");
                    alg = u.get(HeaderLabels.alg);
                }
                let pP = pH.size ? p : CWTUtil.EMPTY_BUFFER;
                alg = coseAlgTags[alg];
                let isSignVerified = !1;
                for (const verifier of verifiers) {
                    const SigStructure = [ "Signature1", pP, verifier.externalAAD ? verifier.externalAAD : CWTUtil.EMPTY_BUFFER, payload ], toBeVerified = globalThis.cborenc.encode(SigStructure);
                    if (isSignVerified = await Sign.verifySignature(alg, toBeVerified, signature, verifier.key), 
                    isSignVerified) break;
                }
                if (!isSignVerified) throw new Error("CWT token signature verification failed!");
                const decodedPayload = globalThis.cbordec.decode(payload);
                return Promise.resolve({
                    header: {
                        p: pH,
                        u: uH
                    },
                    payload: decodedPayload
                });
            }

          case COSE_Sign:
            {
                if (!Array.isArray(coseMessage) || 4 !== coseMessage.length) throw new Error("CWT malformed: invalid COSE message structure for COSE CBOR COSE_Sign, expected array of length 4!");
                const [p, u, payload, signatures] = coseMessage;
                let pH = p.length ? globalThis.cbordec.decode(p) : CWTUtil.EMPTY_BUFFER;
                const uH = u.size ? u : CWTUtil.EMPTY_BUFFER;
                headerValidation && this.validateHeader(pH, !0);
                let pP = pH.size ? p : CWTUtil.EMPTY_BUFFER, isSignVerified = !1;
                for (const signature of signatures) {
                    let [signP, signU, sign] = signature;
                    const verifier = this.getVerifier(signU, verifiers);
                    if (verifier) {
                        const externalAAD = verifier.externalAAD ? verifier.externalAAD : CWTUtil.EMPTY_BUFFER, signerPMap = signP.length ? globalThis.cborenc.decode(signP) : CWTUtil.EMPTY_BUFFER;
                        signP = signerPMap.size ? signP : CWTUtil.EMPTY_BUFFER;
                        const alg = signerPMap.get ? signerPMap.get(HeaderLabels.alg) : pH.get ? pH.get(HeaderLabels.alg) : void 0;
                        if (alg) {
                            const SigStructure = [ "Signature", pP, signP, externalAAD, payload ], toBeVerified = globalThis.cborenc.encode(SigStructure);
                            if (isSignVerified = await Sign.verifySignature(coseAlgTags[alg], toBeVerified, sign, verifier.key), 
                            isSignVerified) break;
                        } else logger.error(`Unable to find alg in CWT token for kid = ${verifier.kid}, hence skipping the verifier!`);
                    }
                }
                if (!isSignVerified) throw new Error("CWT token signature verification failed!");
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
            const h = headers, crit = h.get(HeaderLabels.crit);
            if (Array.isArray(crit)) {
                if (0 === crit.length) throw new Error("CWT Malformed: malformed protected header, crit array cannot be empty!");
                for (const e of crit) if (void 0 === h.get(e)) throw new Error("CWT Malformed: malformed protected header, crit labels are not part of protected header");
            }
        }
    }
    validateClaims(decodedPayload) {
        if (this.cwtOptions.issuer) {
            const iss = decodedPayload.get(ClaimLabels.iss);
            if (iss && this.cwtOptions.issuer !== iss) throw new Error(`CWT malformed: invalid iss, expected ${this.cwtOptions.issuer}`);
        }
        if (this.cwtOptions.subject) {
            const sub = decodedPayload.get(ClaimLabels.sub);
            if (sub && this.cwtOptions.subject !== sub) throw new Error(`CWT malformed: invalid sub, expected ${this.cwtOptions.subject}`);
        }
        if (this.cwtOptions.audience) {
            const aud = decodedPayload.get(ClaimLabels.aud);
            if (aud && (Array.isArray(aud) || "string" == typeof aud)) {
                if (!(Array.isArray(aud) ? aud : [ aud ]).includes(this.cwtOptions.audience)) throw new Error(`CWT malformed: invalid aud, expected ${this.cwtOptions.audience}`);
            }
        }
        const clockTimestamp = Math.floor(Date.now() / 1e3);
        if (!1 === this.cwtOptions.ignoreExpiration) {
            const exp = decodedPayload.get(ClaimLabels.exp);
            if (exp) {
                if ("number" != typeof exp) throw new Error("CWT malformed: exp must be number");
                if (clockTimestamp > exp + (this.cwtOptions.clockTolerance || 0)) throw new Error("CWT token has been expired");
            }
        }
        if (!1 === this.cwtOptions.ignoreNotBefore) {
            const nbf = decodedPayload.get(ClaimLabels.nbf);
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
    getVerifier(signU, verifiers) {
        const kid = signU.get(HeaderLabels.kid);
        for (const verifier of verifiers) if (CWTUtil.isUint8ArrayEqual(kid, verifier.kid)) return verifier;
        return null;
    }
}

class CWTGenerator {
    static async mac(claims, signer, contentHeader, recipients, options) {
        if (!claims) throw new Error("Invalid claims type, cannot be null or undefined!");
        if (void 0 === signer.key || void 0 === signer.key.type || null == signer.key.algorithm || null == signer.key.usages || signer.externalAAD && !(signer.externalAAD instanceof Uint8Array)) throw new Error("Invalid signer, expected signer with valid crypto key!");
        if (!contentHeader) throw new Error("Invalid contentHeader type, cannot be null or undefined!");
        options = options || {};
        let pH = contentHeader && contentHeader.p ? contentHeader.p : new Map, uH = contentHeader && contentHeader.u ? contentHeader.u : new Map, protectedHeader = 0 === pH.size ? CWTUtil.EMPTY_BUFFER : globalThis.cborenc.encode(pH), alg = pH.get(HeaderLabels.alg);
        if (!alg) throw new Error("No algorithm found, kindly specify the algorithm in protected header of ContentHeader!");
        let result, payload = globalThis.cborenc.encode(claims);
        if (Array.isArray(recipients)) {
            if (0 === recipients.length) throw new Error("No recipients found, there has to be atleast one recipients!");
            if (recipients.length > 0) throw new Error("Mac with recipients is not currently supported!");
        } else {
            const MACstructure = [ "MAC0", protectedHeader, signer.externalAAD || CWTUtil.EMPTY_BUFFER, payload ];
            let signed = globalThis.cborenc.encode(MACstructure);
            result = [ protectedHeader, uH, payload, await Mac.doSign(signed, signer.key, coseAlgTags[alg]) ], 
            result = options.isCoseCborTagAdded || void 0 === options.isCoseCborTagAdded ? new Tag(result, COSE_Mac0) : result;
        }
        return result = options.isCWTTagAdded ? new Tag(result, 61) : result, globalThis.cborenc.encode(result);
    }
    static async sign(claims, signers, contentHeader, options) {
        if (!claims) throw new Error("Invalid claims type, cannot be null or undefined!");
        if (!signers || Array.isArray(signers) && 0 == signers.length) throw new Error("Invalid signers, cannot be null or undefined, requies at atleast one signer!");
        if (Array.isArray(signers)) {
            if (signers.find((elem => void 0 === elem.key || void 0 === elem.key.type || null == elem.key.algorithm || null == elem.key.usages || elem.externalAAD && !(elem.externalAAD instanceof Uint8Array)))) throw new Error("Invalid signers, expected list of signers with valid crypto key!");
        } else if (void 0 === signers.key || void 0 === signers.key.type || null == signers.key.algorithm || null == signers.key.usages || signers.externalAAD && !(signers.externalAAD instanceof Uint8Array)) throw new Error("Invalid signer, expected signer with valid crypto key!");
        options = options || {};
        let result, pH = contentHeader && contentHeader.p ? contentHeader.p : new Map, uH = contentHeader && contentHeader.u ? contentHeader.u : new Map, protectedHeader = 0 === pH.size ? CWTUtil.EMPTY_BUFFER : globalThis.cborenc.encode(pH), payload = globalThis.cborenc.encode(claims);
        if (Array.isArray(signers)) {
            let signatures = Array();
            for (const signer of signers) {
                const externalAAD = signer.externalAAD || CWTUtil.EMPTY_BUFFER;
                let signPH = signer.p ? signer.p : new Map, signUH = signer.u ? signer.u : new Map, alg = signPH.get(HeaderLabels.alg) || pH.get(HeaderLabels.alg);
                if (!alg) throw new Error("No algorithm found, kindly specify the algorithm in protected header of ContentHeader or Signer object!");
                let signprotectedHeader = 0 === signPH.size ? CWTUtil.EMPTY_BUFFER : globalThis.cborenc.encode(signPH);
                const SigStructure = [ "Signature", protectedHeader, signprotectedHeader, externalAAD, payload ];
                let signaturePayload = globalThis.cborenc.encode(SigStructure);
                const sig = await Sign.doSign(signaturePayload, signer.key, coseAlgTags[alg]);
                signatures.push([ signprotectedHeader, signUH, sig ]);
            }
            let signed = [ protectedHeader, uH, payload, signatures ];
            result = options.isCoseCborTagAdded || void 0 === options.isCoseCborTagAdded ? new Tag(signed, COSE_Sign) : signed;
        } else {
            const externalAAD = signers.externalAAD || CWTUtil.EMPTY_BUFFER;
            let alg = pH.get(HeaderLabels.alg);
            if (!alg) throw new Error("No algorithm found, kindly specify the algorithm in protected header of ContentHeader!");
            const SigStructure = [ "Signature1", protectedHeader, externalAAD, payload ];
            let signaturePayload = globalThis.cborenc.encode(SigStructure);
            let signed = [ protectedHeader, uH, payload, await Sign.doSign(signaturePayload, signers.key, coseAlgTags[alg]) ];
            result = options.isCoseCborTagAdded || void 0 === options.isCoseCborTagAdded ? new Tag(signed, COSE_Sign1) : signed;
        }
        return result = options.isCWTTagAdded ? new Tag(result, 61) : result, globalThis.cborenc.encode(result);
    }
}

export { AlgorithmLabels, CWTGenerator, CWTUtil, CWTValidator, ClaimLabels, HeaderLabels };
