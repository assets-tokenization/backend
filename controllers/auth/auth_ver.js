const db = require("../../db/connect");

const SIGNED = require('../../conf/auth.json')['sign_secret'];

var jwt = require('jsonwebtoken');

const { createHmac, ch_hash } = require('../../helpers/cryptoh');

const { b64EncodeUnicode } = require('../../helpers/textconv');

const randstring = require('../../helpers/cryptoh')['makeid'];

const { mergeDeep } = require('../../helpers/mergeobject');

const { ic_set_user_profile, ic_get_user_profile } = require('../tokenized/ic_register');

const Iit_lib = require('../../lib/iit');
const { result } = require("lodash");

const iitClass = new Iit_lib();
const pool = db.getPool();

const LENGTH_STR_RAY = 64;
const TABLE_RAY = 'ray_auth';
const TABLE_USER_PROFILE = 'userprofiles';
//time live of RAY in seconds
const TIME_CONSISTENCE = 100;

const SECRET_JWT = 'TEST_BLOCKCHAIN_REGISTRY'; 


/**
 * Checket as correct JWT.
 * @param req
 * @param res
 */
exports.checkJWT = async (req, res) => {
  const { jwt_t } = req.body;

  try{
    const ver = jwt.verify(jwt_t, SECRET_JWT);
    res.json({ver});

  } catch (err) {
    res.status(401).json({err})
  }
}

/**
 * Check RAY and construct token.
 * @param req
 * @param res
 */
exports.signOverRay  =async (req, res) => {
  const { ray } = req.body;

  if(!ray) res.status(500).json({ err: 'not inaf param'});

  try{

    const init_iit = await iitClass.init();

    const checkSign = await iitClass.getSignatureInfo(ray);

    const { content, signer } = checkSign;

    if(!content || !signer) res.status(500).json({ err: 'signed not valid'});

    const ver = jwt.verify(content.toString(), SECRET_JWT);
    
    const token = jwt.sign({ signer}, SECRET_JWT, { expiresIn: '3h'} );
    res.json({data: {token}});
  } catch (err) {
    res.status(401).json({ err})
  }

}

exports.getRayWebToken = async (req, res) => {

  const ray = jwt.sign({ ray: new Date().getTime() }, SECRET_JWT, { expiresIn: '5m'});

  res.json({ ray});

}

exports.verifySign = async (req, res) =>{

  const { signedData } = req.body;
  
  const init_iit = await iitClass.init();

  const checkSign = await iitClass.getSignatureInfo(signedData);

  res.json(checkSign);

}

/**
 * Save user data profile.
 * @param req
 * @param res
 */
exports.createUpdateUser = async (req, res) => {

  const { body, user } = req;

  const { data } = body;

  const { description, wallet } = data;

  const check_wallet = (wallet)=>wallet && wallet.match(/0x[a,b,c,d,e,f,A,B,C,D,E,F,0-9]{40}$/);
  
  if( (!description || typeof description !== 'object') && !check_wallet(wallet)) return res.status(500).json({err: 'data not valid'});
  
  const { ipn, surname, givenName } = user;
  
  if(ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});
  
  const check = await pool.query(`Select id, description from ${TABLE_USER_PROFILE} where ipn = '${ipn.DRFO}'`);

  const row = check && check.rows && check.rows[0] || null;

  const fields = ['ipn'];
  const values = [+ipn.DRFO];

  if( (typeof description) == 'object') {
    fields.push('description');
    values.push(`'${JSON.stringify(!row ? description :  mergeDeep( JSON.parse(row.description), description))}'`);
  }

  if(check_wallet(wallet)) {
    fields.push('wallet');
    values.push(`'${wallet}'`);
  }


  const query = !row ? `Insert into ${TABLE_USER_PROFILE} (${fields.join()}) VALUES (${values.join()}) RETURNING id;` 
                     :`Update ${TABLE_USER_PROFILE} SET (${fields}) = (${values.join()}) where id=${row.id};`;
  
  try{
    const result = pool.query(query);
    await ic_set_user_profile(ipn.DRFO, {firstName: givenName, lastName: surname, status: true, ipn: ipn.DRFO, wallet: wallet, description: commonName})
    res.json({result: {op: !row ? 'insert': 'update', id: !row ? result && result.rows && result.rows[0] && result.rows[0].id || null : row.id }});
  } catch (err) {
    res.status(500).json({error: err})
  }  
}


exports.getProfile = async (req, res) => {
  
  const { user } = req;
  
  const { ipn } = user;

  if(ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});

  try{

    const info = await pool.query(`Select id, description, wallet from ${TABLE_USER_PROFILE} where ipn = '${ipn.DRFO}'`);

    const {description, wallet} = info && info.rows && info.rows[0] || {};
  
    const ic_profile = await ic_get_user_profile({key: ipn.DRFO});
  
    if(!ic_profile || !ic_profile.wallet || (ic_profile.wallet !== wallet)) return res.status(500).json({error: "error by validate records IC"});
  
    res.json( { description: description ? JSON.parse(description) : {}, wallet: wallet || null } );
  
  } catch (err) {

    return res.status(500).json({error: err});
    
  }
  

}

/**
 * Altrnative construct RAY wo JWT.
 * @param req
 * @param res
 */
exports.getRayAsSigned = async (req,res) => {

  const time_ms = Math.floor( Date.now() );
  const string = randstring(LENGTH_STR_RAY);

  const sendstr = createHmac(`${b64EncodeUnicode(string)}.${b64EncodeUnicode(time_ms)}`);
  
  const statement = `INSERT INTO ${TABLE_RAY} (rayid, timestamp) VALUES  ('${sendstr}', '${new Date().toISOString()}') RETURNING id`;
  
  const result = await pool.query(statement);

  if(!result || !result.rows || !result.rows[0].hasOwnProperty('id')) console.log(`result save ray err ${result}`);
    
  return res.json({id: result.rows[0].id, ray: sendstr});

}

/**
 * Base checking users token.
 * @param req
 * @param res
 */
exports.authenticateToken = (auth) =>{
  return function (req, res, next) {
    if(auth.length < 1) return next();
    const role = auth[0];

    if(role !== 'user') return next();
    const { token } = req.headers;
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_JWT, (err, payload) => {
      console.log(err)
      if (err) return res.sendStatus(401);
      const { signer } = payload;
      req.user = signer;
      next();
    });  
  }
}
