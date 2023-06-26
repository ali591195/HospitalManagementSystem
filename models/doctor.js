const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('doctor', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        unique: true,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
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
    specialty: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: true,
            notEmpty: true,
            max: 255
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });