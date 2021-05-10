const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist

    const { host, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql', host: host });

    // await sequelize.drop()

    // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);
    // sync all models with database
    await sequelize.sync();
}