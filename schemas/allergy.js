const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('allergy', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
})