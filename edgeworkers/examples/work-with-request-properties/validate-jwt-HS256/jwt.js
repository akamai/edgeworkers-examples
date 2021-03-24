import CryptoJS from './crypto-js_custom.min.js';

/**
 * Class representing a JSON Web Token Object
 * Currently implements HMAC-SHA256 
 * */
class JWT {
    /**
     * Create a JWT object
     * @param {string} jwtString - full JWT string
     */
    constructor(jwtString,secretKey) {
        this.key = secretKey;
        this.jwt = jwtString;
        this.jwtArray = jwtString.split(".");
        this.head = JSON.parse(CryptoJS.enc.Base64.parse(this.jwtArray[0]).toString(CryptoJS.enc.Utf8));
        this.body = JSON.parse(CryptoJS.enc.Base64.parse(this.jwtArray[1]).toString(CryptoJS.enc.Utf8));
        this.signature = this.jwtArray[2];
    }
    /**
     * Checks `exp` property against current timestamp.
     * Fails closed - lack of `exp` property is considered expired.
     */
    isExpired () {
        return !(this.body.hasOwnProperty("exp") && this.body.exp > (Date.now() / 1000));
    }
    /**
     * Checks if JWT signature matches signature generated with given key.
     */
    signatureMatches (key = this.key) {
        let content = this.jwtArray[0] + "." + this.jwtArray[1];
        let hash = CryptoJS.HmacSHA256(content,key);
        let b64hash = CryptoJS.enc.Base64.stringify(hash);
        return b64hash == this.signature;
    }
}

export {JWT as default};