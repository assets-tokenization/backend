const { Pool } = require('pg')

const conf = require("../conf/db.json");

let pool;

module.exports = {

    getPool: function(){
        try{
            if(pool){
                //console.log( "db.PoolStats", db.PoolStats() );
                return pool;
            }
            pool = new Pool(conf.connect);
            return pool;
        } catch(err){
            console.log("Error connection DB", err);
            return err;
        }
    } 

}