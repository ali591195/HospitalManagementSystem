const Sequelize = require('sequelize');
const sequelize = new Sequelize('Local instance MySQL80', 'ali591', 'Dsk35124', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;