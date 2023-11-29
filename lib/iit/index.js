const _ = require('lodash');
const UpdateHandler = require('./update');
const { getEuSign, checkLibraryLoaded } = require('./iit.js');


const config = {
  iit:{
    iit: 
    {
      "caCertsOrigin": "https://iit.com.ua/download/productfiles/CACertificates.p7b",
      "caCertsPath": "./data/CACertificates.p7b",
      "casOrigin": "https://iit.com.ua/download/productfiles/CAs.json",
      "casPath": "./data/CAs.json",
      "updateSchedule": "0 * * * *"
    }
  } 
}

const log = {
  save: ()=>{
    for (var i = 0; i < arguments.length; i++) {
      console.log(arguments[i]);
    }
  }
}

class Iit {
  /**
   * Constructor.
   */
  constructor() {
    if (!Iit.singleton) {
      this.updateHandler = new UpdateHandler(config.iit, this.init.bind(this));
      Iit.singleton = this;
    }

    return Iit.singleton;
  }

  async init() {

    this.euSign = getEuSign();
    this.euSign.SetOCSPResponseExpireTime(30);

    while (!checkLibraryLoaded()) {
      console.log('lib-iit-wait-init');
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return new Promise((resolve) => {
      console.log('lib-iit-successfully-initialized');
      resolve();
    });
  }

  /**
   * To pem.
   * @param {string} base64 Base64.
   * @returns {string}
   */
  toPem(base64) {
    let lines = [];
    const chunks = _.chunk([...base64], 64);
    for (const chunk of chunks) {
      lines.push(chunk.join(''));
    }
    return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----`;
  }

  async getSignatureInfo(sign, hash, signExternal = false, content) {
    let signInfo;
    let signerInfo;
    let cert;

    const context = await this.euSign.CtxCreate();

    const signsCount = await this.euSign.CtxGetSignsCount(context, sign);
    if (signsCount === 0) {
      throw Error('Sign not found.');
    }

    if (!hash) {
      if (signExternal === true) {
        signInfo = this.euSign.CtxVerifyData(context, Buffer.from(content, 'base64'), 0, sign);
      } else {
        try{
        signInfo = this.euSign.CtxVerifyDataInternal(context, 0, sign);
        } catch (err) {
          console.log(`signInfo err ${err}`);
        }
      }
      signerInfo = this.euSign.CtxGetSignerInfo(context, 0, sign);
      cert = this.euSign.Base64Encode(signerInfo.GetData());
    } else {
      signInfo = this.euSign.CtxVerifyHashValue(context, hash, 0, sign);
      signerInfo = this.euSign.CtxGetSignerInfo(context, 0, sign);
    }

    this.euSign.CtxFree(context);
    const signTimeInfo = signInfo.GetTimeInfo();

    if (typeof cert === 'undefined') {
      log.save('get-signature-info-error', 'Can\'t find certificate.', 'warn');
    }

    if (!signInfo.data) {
      log.save('get-signature-info-content-not-defined', 'Signed content not defined.', 'warn');
    }

    const signer = _.fromPairs(signerInfo.infoEx.subject.split(';').map((s) => s.split('=')));
    const issuer = _.fromPairs(signerInfo.infoEx.issuer.split(';').map((s) => s.split('=')));

    return {
      signer: {
        organizationName: signer.O,
        ...(signer.Title && { title: signer.Title }),
        commonName: signer.CN,
        surname: signer.SN,
        givenName: signer.GivenName,
        serialNumber: signer.Serial,
        countryName: signer.C,
        localityName: signer.L,
        ipn: {
          ...(signerInfo.infoEx.subjEDRPOUCode && { EDRPOU: signerInfo.infoEx.subjEDRPOUCode }),
          ...(signerInfo.infoEx.subjDRFOCode && { DRFO: signerInfo.infoEx.subjDRFOCode })
        }
      },
      issuer: {
        organizationName: issuer.O,
        organizationalUnitName: issuer.OU,
        commonName: issuer.CN,
        serialNumber: issuer.Serial,
        countryName: issuer.C,
        localityName: issuer.L
      },
      serial: signerInfo.infoEx.GetSerial(),
      signTime: signTimeInfo.GetSignTimeStamp().toISOString(),
      ...(signInfo.data && { content: Buffer.from(signInfo.data) }),
      ...(cert && { pem: this.toPem(cert) })
    };
  }

  /**
   * @param {Buffer} data
   * @param {boolean} [isReturnAsBase64 = true]
   * @return {string|Buffer}
   */
  hashData(data, isReturnAsBase64 = true) {
    if (typeOf(data) !== 'uint8array') {
      throw new Error('iit.hashData data must be a buffer.');
    }
    return this.euSign.HashData(data, isReturnAsBase64);
  }

  /**
   * @param {string} hash
   * @param {string} sign
   * @return {EndUserSignInfo}
   */
  verifyHash(hash, sign) {
    return this.euSign.VerifyHash(hash, sign);
  }

  /**
   * Update sign. Replace hash by original content.
   * @param {string} signedHash Signed hash.
   * @param {string} content Content.
   * @returns {string}
   */
  hashToInternalSignature(signedHash, content) {
    const decodedSign = this.euSign.Base64Decode(signedHash);

    const context = this.euSign.CtxCreate();
    let signature = this.euSign.CreateEmptySign(content);

    const signsCount = this.euSign.CtxGetSignsCount(context, decodedSign);

    for (let index = 0; index < signsCount; index++) {
      const signerInfo = this.euSign.CtxGetSignerInfo(context, index, decodedSign);
      const signerC = this.euSign.GetSigner(index, decodedSign, false);
      signature = this.euSign.CtxAppendSigner(context, 1, signerC, signerInfo.data, signature, true);
    }

    this.euSign.CtxFree(context);
    return signature;
  }
}

module.exports = Iit;
