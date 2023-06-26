const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('staff_ward_assignment', {
    staff_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        },
        references: {
            model: 'staffs',
            key: 'id'
        }
    },
    ward_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        },
        references: {
            model: 'wards',
            key: 'id'
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });