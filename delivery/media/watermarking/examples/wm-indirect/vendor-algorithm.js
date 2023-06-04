//This code just demonstrate the sample interface of the vendorAlgorithm class.
class VendorAlgorithm {
    async generateTmid(payload, secretKey) {
      //Vendor specific logic to generate TMID in hex.
      //Customer needs to obtain/implement with permissions from respective vendor as this could be protected by copyrights.
      return '48656c6c6f77576f726c64'
    }
}

const vendorAlgorithm = new VendorAlgorithm;

export { vendorAlgorithm };
