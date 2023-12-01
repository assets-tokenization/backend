const db = require("../../db/connect");

const pool = db.getPool();

const solcompile = require('../../helpers/soliditycompile');

const contract = require('../../helpers/web3tokenize');

const contractconf = require('../../conf/w3ether.json');

const userinfo = require('../../helpers/users');

const contract_meta = require('../../conf/contract.json');

const allowed_p2p_platforms = require('../../conf/alowed_p2p_platforms.json');

const TABLE_USER_PROFILE = 'userprofiles';

const { ic_get_user_profile, ic_set_asset_info } = require('./ic_register.js');


exports.p2p_platforms_list = async function(req,res) {
	res.json(allowed_p2p_platforms);
}

exports.getCompileContractSolidity = async function (req, res) {

    const info = JSON.parse(solcompile);

    const { fileName, name } = contractconf.contract;

    const abi = info.contracts[fileName][name].abi;

    const bytecode = info.contracts[fileName][name].evm.bytecode.object;

    res.json({data: abi});
}

exports.deployContract = async function (req, res) {

    const { body , user} = req;
    
    if(!user) return res.status(401).json(
        { error: "need authorization"}
    );
    
    const { data } = body;

    if(!data) return res.status(403).json(
        { error: "data not defined"}
    );

    const { name_contract, symbol, id_real_estate, description } = data;

    try {

        const user_info = await userinfo.getInfo(user);

        const { wallet } = user_info.profile || {};

        const ic_user_info = await ic_get_user_profile(user.ipn);

        if(!wallet || !ic_user_info || !ic_user_info.wallet || (ic_user_info.wallet !== wallet)) return res.status(403).json(
            { error: "wallet not defined or not valid"}
        );

        const deploy = await contract.deploy({ info: { abi: contract_meta.abi, bytecode: contract_meta.bytecode}, params: { name: name_contract, symbol, owner: wallet, description, id_real_estate, p2p_platform: allowed_p2p_platforms[0].address}});

        const statement = `Update REALESTATEOBJECTS set (address_contract, tokenized) = ('${deploy}', TRUE) where id_real_estate = '${id_real_estate}'`;

        const result = await pool.query(statement);

        await ic_set_asset_info(id_real_estate, {id: id_real_estate, addr: deploy, status_rec: true, name: name_contract});

        res.json({contract: deploy, owner: wallet});
    } catch (err) {
        res.status(500).json({error: err});
    }
}

exports.testTokenezed = async function (req, res) {

    const { wallet, token, id_real_estate, name_contract, description } = req.query;

    const info = JSON.parse(solcompile);

    const { fileName, name } = contractconf.contract;

    const abi = info.contracts[fileName][name].abi;

    const set_owner = await contract.set_owner_tokenize({abi, wallet, token, id_real_estate, name_contract, description});

    res.json(set_owner);

}

exports.setSelectedPlatform = async function (req, res) {

	const { id } = req.params;

	const { state } = req.query;

	if(!id) res.json({error: `not inaf data`});

    try {

        const statement = `Update REALESTATEOBJECTS set is_selected_p2p = ${state == 'true' ? 'TRUE' : 'FALSE'}  where id = ${+id}`;

        const result = await pool.query(statement);

        res.json({status: 'updated', result});
    } catch(err) {
        res.status(500).json(err);
    }
}

exports.setNewOwner = async function(req, res) {

    const {query, params,user} = req;
    const { id_obj } = params;
    const { wallet_new_owner } = query;

    if(!id_obj || !wallet_new_owner ) return res.json({error: `not inaf data`});

    const user_info = await userinfo.getInfo(user);
    const ipn_owner = user_info.ipn && user_info.ipn.DRFO;

    if(!ipn_owner ) return res.json({error: `not found owner info`});
    try{
        const _user_info = await pool.query(`Select id, ipn from ${TABLE_USER_PROFILE} where wallet = '${wallet_new_owner}'`);
        const {id, ipn} = _user_info && _user_info.rows && _user_info.rows[0] || {};
        if(!id || !ipn ) return res.json({error: `info about new user not found in the records`});
        const statement = `Update REALESTATEOBJECTS set (user_ipn, userid) = ('${ipn}', '${id}') where id = ${+id_obj}  RETURNING id_real_estate`
        const result = await pool.query(statement);
        res.json({status: 'updated', id: result && result.rows && result.rows[0] && result.rows[0]['id_real_estate'] || null});
    } catch(err) {
        res.status(500).json(err);
    }
}



exports.testNetwork = async function(req, res) {
    contract.test_network(res);
}