const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const sequelize = require('../startup/database');

module.exports = sequelize.define('person', {
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
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'first_name',
        validate: {
            isAlpha: true,
            notNull: true,
            notEmpty: true,
            max: 50
        }
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'last_name',
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
                if (value === 'male' || value === 'm') this.setDataValue('gender', 'M');
                else if (value === 'female' || value === 'f') this.setDataValue('gender', 'F');
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
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'birth_date',
        validate: {
            isDate: true,
            notNull: true,
        }
    },
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });