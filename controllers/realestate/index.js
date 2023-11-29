const db = require("../../db/connect");

const pool = db.getPool();

const realestate = require("../../data/my_real_estate.json");
const objects = require("../../data/objects.json");

const get_queue_from_object = require("../../helpers/getqueryfromobject")['GET_QUERY_PG_INTO_FROM_OBJECT'];
const get_queue_from_object_update = require("../../helpers/getqueryfromobject")['GET_QUERY_PG_UPDATE_FROM_OBJECT_BY_ID'];


const schema = {
    userid: 'number',
    title: 'string',
    tokenized: 'boolean',
    description: 'string',
    photos: 'arraystring',
    number: 'string',
    address: 'string',
    type: 'string',
    lawdata: 'string',
    location: 'arrayreal',
    document: 'string',
    ownform: 'string',
    expdate: 'string',
    govregistrator: 'string',
    objectdescription: 'string',
    totalarea: 'string',
    livingarea: 'string',
    problems: 'string',
    user_ipn: 'number',
    address_contract: 'string',
    id_real_estate: 'string',
    is_selected_p2p: 'boolean'
};

const res_fields = {
    id: 'id',
    userid: 'id_user',
    title: 'title',
    tokenized: 'tokenized',
    description: 'description',
    number: 'number',
    address: 'address',
    type: 'type',
    lawdata: 'lawData',
    location: 'location',
    document: 'document',
    ownform: 'ownForm',
    expdate: 'expDate',
    govregistrator: 'govRegistrator',
    objectdescription: 'objectDescription',
    totalarea: 'totalArea',
    livingarea: 'livingArea',
    problems: 'problems',
    user_ipn: 'user_ipn',
    address_contract: 'address_contract',
    id_real_estate: 'id_real_estate',
    is_selected_p2p: 'is_selected_p2p'
};

const table = 'REALESTATEOBJECTS';

const prepFields = (data) =>{
    const pr_d = {};

    Object.keys(res_fields).forEach(k=>{
        if(data[res_fields[k]]) pr_d[k] = data[res_fields[k]];
    });

    return pr_d;
}

const normFields = (rows) => {
    const resarray = [];

    rows.forEach(r=>{
        const resrow = {};
        Object.keys(r).forEach(k=>{
           resrow[res_fields[k]] = r[k]; 
        });
        resarray.push(resrow);
    })

    return resarray;
}


const query_db = {
}

exports.getAll = async function(req, res) {
    res.json( { data: realestate} );
}

exports.getObjectsExample = async function(req, res) {
    res.json( { data: objects} );
}

exports.getDetails = async function(req, res) {

    const { user, params } = req;
  
    const { ipn } = user;

    const { id } = params; 
  
    if(!ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});

    if(!id) res.json({error: `not inaf data`});
   
    const statement = `SELECT ${Object.keys(res_fields).join(', ')} FROM ${table} WHERE id = ${id} AND user_ipn = ${+ipn.DRFO}`;

    const result = await pool.query(statement);

    res.json({ data: result.rows && result.rows[0] && normFields(result.rows)[0] || {}});
}


exports.saveNewObject = async function(req, res) {

    const { user, body } = req;
  
    const { ipn } = user;
  
    if(ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});
   
    const { data } = body;

    if(!data || Object.keys(data).length < 3) res.json({error: `not inaf data`});

    data['user_ipn'] = +ipn.DRFO;

    data['tokenized'] = false;
    data['address_contract'] = '';

    const statement = get_queue_from_object(table, prepFields(data), schema);

    const result = await pool.query(statement);

    res.json({ data: result.rows || {error:{result}} });
}

exports.updateObject = async function(req, res) {

    const { user, body, params } = req;
  
    const { ipn } = user;
  
    if(ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});
   
    const { data } = body;

    const { id } = params;

    if( !data || Object.keys(data).length < 1 || !id ) res.json({error: `not inaf data`});

    data['user_ipn'] = +ipn.DRFO;

    data['id'] = id;

    const statement = get_queue_from_object_update(table, prepFields(data), schema);

    const result = await pool.query(statement);

    res.json({ data: result.rows || {error:{result}} });

}



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

exports.getObjects = async function(req, res) {

    const { user } = req;
  
    const { ipn } = user;
  
    if(!ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});
   
    const statement = `SELECT ${Object.keys(res_fields).join(', ')} FROM ${table} WHERE user_ipn = ${+ipn.DRFO}`;

    const result = await pool.query(statement);

    res.json({ data: normFields(result.rows)});
}

exports.my_real_estate = async function(req, res) {

    const { user } = req;
  
    const { ipn } = user;
  
    if(!ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});
   
    const statement = `SELECT ${Object.keys(res_fields).join(', ')} FROM ${table} WHERE user_ipn = ${+ipn.DRFO}`;

    const result = await pool.query(statement);

    res.json({ data: normFields(result.rows)});
}


exports.getDetailsTokenized = async function(req, res) {

    const { user, query } = req;
  
    const { ipn } = user;

    const { contract } = query; 
  
    if(!ipn && ipn.DRFO && isNaN(+ipn.DRFO)) return res.status(403).json({err: 'ipn of user not valid'});

    if(!contract) res.json({error: `not inaf data`});
   
    const statement = `SELECT ${Object.keys(res_fields).join(', ')} FROM ${table} WHERE address_contract = '${contract}'`;

    const result = await pool.query(statement);

    res.json({ data: result.rows && result.rows[0] && normFields(result.rows)[0] || {}});
}


