import CryptoJS from './crypto-js_custom.min.js';
import b64toJSON from './utils.js';

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
        this.head = b64toJSON(this.jwtArray[0]);
        this.body = b64toJSON(this.jwtArray[1]);
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