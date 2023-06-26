const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('person', {
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
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isAlpha: true,
            notNull: true,
            notEmpty: true,
            max: 50
        }
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isAlpha: true,
            notNull: true,
            notEmpty: true,
            max: 50
        }
    },
    gender: {
        type: DataTypes.STRING(1),
        allowNull: false,
        validate: {
            notNull: true,
            is: /^(Male|Female|M|F)$/i
        },
        set(value) {
            value.toLowerCase();
            if (value === 'male' || value === 'm') this.setDataValue('gender', 'M');
            if (value === 'female' || value === 'f') this.setDataValue('gender', 'F');
        }
    },
    cnic: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
        validate: {
            notNull: true,
            is: /^[0-9]{5}-[0-9]{7}-[0-9]$/
        }
    },
    phone: {
        type: DataTypes.STRING(12),
        allowNull: false,
        validate: {
            notNull: true,
            is: /^[0-9]{4}-[0-9]{7}$/
        }
    },
    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            notNull: true,
        }
    },
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });