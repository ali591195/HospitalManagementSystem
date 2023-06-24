const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('doctor', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'staff',
            key: 'id'
        }
    },
    specialty: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
});