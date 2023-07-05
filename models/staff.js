const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const sequelize = require('../startup/database');

module.exports = sequelize.define('staff', {
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
    personId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'person_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    post: {
        type: DataTypes.STRING(6),
        allowNull: false,
        validate: {
            notNull: true,
            is: /^(Doctor|Nurse)$/
        },
        set(value) {
            const correctVal = value.charAt(0).toUpperCase() + value.slice(1);
            this.setDataValue('post', correctVal);
        }
    },
    joinDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'join_date',
        validate: {
            isDate: true,
            notNull: true,
        }
    },
    salary: {
        type: DataTypes.DECIMAL(9, 2).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isDecimal: true,
            notNull: true
        }
    },
    shift: {
        type: DataTypes.STRING(2),
        validate: {
            is: /^(Morning|M|Day|D|Evening|E|Night|N|Midnight|MD)$/i
        },
        set(value) {
            if (value === 'morning' || value === 'm') this.setDataValue('shift', 'M');
            if (value === 'day' || value === 'd') this.setDataValue('shift', 'D');
            if (value === 'evening' || value === 'e') this.setDataValue('shift', 'E');
            if (value === 'night' || value === 'n') this.setDataValue('shift', 'N');
            if (value === 'midnight' || value === 'md') this.setDataValue('shift', 'MD');
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

// 