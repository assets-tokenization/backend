const db = require("../db/connect");

const pool = db.getPool();

const TABLE_USER_PROFILE = 'userprofiles';

exports.getInfo = async (user) => {
    const { ipn } = user;

    if(ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});
    
    const check = await pool.query(`Select id, description, wallet from ${TABLE_USER_PROFILE} where ipn = '${ipn.DRFO}'`);
  
    const row = check && check.rows && check.rows[0] || null;

    return ({ipn, profile: row});
}