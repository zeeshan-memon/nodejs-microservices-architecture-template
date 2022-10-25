'use strict'
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.SQL_DB_URI, {
    define: {
        underscored: false,
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci',
            connectTimeout: 60000
        },
        freezeTableName: true,
        timestamps: false,
    },
    dialect: 'mysql',
    pool: {
        max: 30,
        min: 0,
        idle: 200000,
        acquire: 1000000
    }
});

sequelize.authenticate().then(() => {
    console.log('Database Connection has been established successfully.');
    // sequelize.sync()
}).catch(err => {
    console.log('Unable to connect to the database:', err);
});

module.exports = sequelize;