const db = require("../../db/connect");
const pool = db.getPool();

const messages = require("../../data/messages.json");

const query_db = {
}

exports.getAll = async function(req, res) {
    res.json( { data: messages} );
}

