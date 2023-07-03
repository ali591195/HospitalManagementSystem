const { DataTypes } = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('nurse', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        allowNull: false,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    staffId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'staff_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });