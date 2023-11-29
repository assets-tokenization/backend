const db = require("./connect");

const pool = db.getPool();

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
});