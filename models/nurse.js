const {Sequelize, DataTypes} = require('sequelize');
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
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });