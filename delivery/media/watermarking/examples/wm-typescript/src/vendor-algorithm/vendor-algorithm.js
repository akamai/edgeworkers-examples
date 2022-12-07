/** @preserve @version 1.0.0 */
/**
Note: This is mock implementation of vendor algorithm. The purpose of this file is just to demonstrate how the interface of the vendor algorithm should look like.
*/
class VendorAlgorithm {

    async generateTmid(payload, secretKey) {
        return 'example-tmid'
    }
}

const VendorAlgorithm = new VendorAlgorithm;

export { VendorAlgorithm };
