const {Sequelize, DataTypes} = require('sequelize');

const sequelize = require('../startup/database');

module.exports = sequelize.define('staff_ward_assignment', {
    staffId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'staff_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    wardId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'ward_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });