var mysql = require('mysql');
var util = require('util');

// mysql 연결
var pool      =    mysql.createPool({
    connectionLimit : 20, 
    host     : '127.0.0.1', //DB_HOST,
    user     : 'webi', //DB_USER,
    password : '7200', //DB_PASSWORD,
    database : 'anpr_center', //DB_DATABASE,
    waitForConnections:true,
    debug    :  false
});
//console.log(DB_HOST);
//console.log(pool);

// db 연결
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection) connection.release();
    return;
});
pool.query = util.promisify(pool.query);

module.exports = pool;