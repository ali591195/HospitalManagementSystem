const Sequelize = require('sequelize');
const sequelize = require('../startup/database');

const Ward = sequelize.define('Ward', {
    wardId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});