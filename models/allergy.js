const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const sequelize = require('../startup/database');

module.exports = sequelize.define('allergy', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
        allowNull: false,
        unique: true,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING(255),
        unique: true,
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
  })