const util = require( 'util' );
const mysql = require('mysql');
const key = require('../config/keys');
const pool = mysql.createPool({
    connectionLimit : key.connectionLimit, //important
    host: key.host,
    user: key.user,
    password: key.password,
    database : key.database,
    debug    :  false,
    supportBigNumbers: true,
    bigNumberStrings: true
});
module.exports
module.exports = {
      getPool: pool,
      query( sql, args ) {
        return util.promisify( pool.query )
          .call( pool, sql, args );
      },
      close() {
        return util.promisify( pool.end ).call( pool );
      }
    };
