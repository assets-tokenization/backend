var fs = require('fs');

const config = {
    iit: 
    {
      "caCertsOrigin": "https://iit.com.ua/download/productfiles/CACertificates.p7b",
      "caCertsPath": "./data/CACertificates.p7b",
      "casOrigin": "https://iit.com.ua/download/productfiles/CAs.json",
      "casPath": "./data/CAs.json",
      "updateSchedule": "0 * * * *"
    }
}

var EU_MAX_DATA_SIZE_MB = 75;

eval(fs.readFileSync(__dirname + '/lib/euscpt.js').toString());
eval(fs.readFileSync(__dirname + '/lib/euscpm.js').toString());
eval(fs.readFileSync(__dirname + '/lib/euscp.js').toString());

console.log(`config.iit.casPath ${config.iit.casPath}`)

const cas = JSON.parse(fs.readFileSync(config.iit.casPath));
const caCerts = [config.iit.caCertsPath];
const DEFAULT_SETTINGS = {
  issuerCNs: [
    'Акредитований центр сертифікації ключів ІДД ДФС',
    'Акредитований центр сертифікації ключів ІДД Міндоходів',
    'Акредитований центр сертифікації ключів ІДД ДПС'
  ],
  address: 'acskidd.gov.ua',
  ocspAccessPointAddress: 'acskidd.gov.ua/services/ocsp/',
  ocspAccessPointPort: '80',
  cmpAddress: 'acskidd.gov.ua',
  tspAddress: 'acskidd.gov.ua',
  tspAddressPort: '80',
  directAccess: true
};

let isLibraryLoaded = false;

/**
 * Set settings.
 * @param {*} cas
 * @param {*} caSettings
 */
function setSettings(cas, caSettings) {
  let offline = true;
  let useOCSP = false;
  let useCMP = false;

  offline = caSettings == null || caSettings.address === '' ? true : false;
  useOCSP = !offline && caSettings.ocspAccessPointAddress !== '';
  useCMP = !offline && caSettings.cmpAddress !== '';

  euSign.SetCharset('UTF-8');
  euSign.SetJavaStringCompliant(true);

  let settings = euSign.CreateFileStoreSettings();
  settings.SetPath('');
  settings.SetSaveLoadedCerts(true);
  euSign.SetFileStoreSettings(settings);

  settings = euSign.CreateModeSettings();
  settings.SetOfflineMode(offline);
  euSign.SetModeSettings(settings);

  settings = euSign.CreateProxySettings();
  euSign.SetProxySettings(settings);

  settings = euSign.CreateTSPSettings();
  settings.SetGetStamps(!offline);
  if (!offline) {
    if (caSettings.tspAddress !== '') {
      settings.SetAddress(caSettings.tspAddress);
      settings.SetPort(caSettings.tspAddressPort);
    } else if (DEFAULT_SETTINGS) {
      settings.SetAddress(DEFAULT_SETTINGS.tspAddress);
      settings.SetPort(DEFAULT_SETTINGS.tspAddressPort);
    }
  }
  euSign.SetTSPSettings(settings);

  settings = euSign.CreateOCSPSettings();
  if (useOCSP) {
    settings.SetUseOCSP(true);
    settings.SetBeforeStore(true);
    settings.SetAddress(caSettings.ocspAccessPointAddress);
    settings.SetPort('80');
  }
  euSign.SetOCSPSettings(settings);

  settings = euSign.CreateOCSPAccessInfoModeSettings();
  settings.SetEnabled(true);
  euSign.SetOCSPAccessInfoModeSettings(settings);
  settings = euSign.CreateOCSPAccessInfoSettings();
  for (let i = 0; i < cas.length; i++) {
    settings.SetAddress(cas[i].ocspAccessPointAddress);
    settings.SetPort(cas[i].ocspAccessPointPort);

    for (let j = 0; j < cas[i].issuerCNs.length; j++) {
      settings.SetIssuerCN(cas[i].issuerCNs[j]);
      euSign.SetOCSPAccessInfoSettings(settings);
    }
  }

  settings = euSign.CreateCMPSettings();
  settings.SetUseCMP(useCMP);
  if (useCMP) {
    settings.SetAddress(caSettings.cmpAddress);
    settings.SetPort('80');
  }
  euSign.SetCMPSettings(settings);

  settings = euSign.CreateLDAPSettings();
  euSign.SetLDAPSettings(settings);
}

/**
 * Load certificates.
 * @param {string[]} certsFilePaths
 */
function loadCertificates(certsFilePaths) {
  if (!certsFilePaths) {
    return;
  }

  for (let i = 0; i < certsFilePaths.length; i++) {
    const path = certsFilePaths[i];
    const data = new Uint8Array(fs.readFileSync(path));
    if (path.substr(path.length - 3) === 'p7b') {
      euSign.SaveCertificates(data);
    } else {
      euSign.SaveCertificate(data);
    }
  }
}

/**
 * Init.
 */
function init() {
  if (!euSign.IsInitialized()) {
    euSign.Initialize();
  }

  if (euSign.DoesNeedSetSettings()) {
    const caSettings = null;

    setSettings(cas, caSettings);
    loadCertificates(caCerts);
  }
}

/**
 * Function which calls after EUSignCP().
 * @param {*} isInitialized
 */
function EUSignCPModuleInitialized(isInitialized) {
  isLibraryLoaded = isInitialized;

  if (!isLibraryLoaded) {
    throw new Error('Library not loaded.');
  }

  init();
}

const euSign = EUSignCP();

module.exports = {
  checkLibraryLoaded: () => {
    return isLibraryLoaded;
  },

  getEuSign: () => {
    return euSign;
  }
};
