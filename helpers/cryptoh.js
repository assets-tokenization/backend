
const crypto = require('crypto');

const SIGNED = require('../conf/auth.json')['sign_secret'];

const system_key = require('../conf/sysapi.json');

exports.s_check_hach = function (ident, salt_check, hash_check){

    if(!ident || !system_key[ident] ) return false;

    const { peer_key } = system_key[ident];

    const control_hash = crypto.createHmac('sha512', peer_key).update(salt_check).digest('hex');

    return hash_check == control_hash;

}

exports.makeid = function (length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


exports.createHmac = function(str) {
    const hmac = crypto.createHmac('sha256', SIGNED);
    const data = hmac.update(str);
    return data.digest('hex');
}