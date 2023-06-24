const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('staff', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'person',
            key: 'id'
        }
    },
    post: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    joined_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    salary: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: false
    },
    shift: {
        type: DataTypes.STRING(2),
        allowNull: false,
    }
});