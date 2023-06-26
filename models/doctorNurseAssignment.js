const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('doctor_nurse_assignment', {
    doctor_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        },
        references: {
            model: 'doctors',
            key: 'id'
        }
    },
    nurse_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        },
        references: {
            model: 'nurses',
            key: 'id'
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });