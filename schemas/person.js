const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('person', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING(1),
        allowNull: false,
    },
    cnic: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
});