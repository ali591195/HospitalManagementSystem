const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('staff_ward_assignment', {
    staff_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'staff',
            key: 'id'
        }
    },
    ward_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'ward',
            key: 'id'
        }
    }
});