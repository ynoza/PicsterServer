const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};
// module.exports = db =  {
//     HOST: "us-cdbr-east-03.cleardb.com",
//     USER: "b1f6bd6150b66f",
//     PASSWORD: "55daa557",
//     DB: "heroku_931ecfbffb230c4"
//   };

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);
    console.log(host,port,user,password,database);
    // sync all models with database
    await sequelize.sync();
}