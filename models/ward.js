const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('ward', {
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
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: true,
            notEmpty: true,
            max: 50
        }
    },
    capacity: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
            notNull: true,
            isInt: true
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });