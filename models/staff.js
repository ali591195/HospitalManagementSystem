const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('staff', {
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
    person_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        },
        references: {
            model: 'people',
            key: 'id'
        }
    },
    post: {
        type: DataTypes.STRING(6),
        allowNull: false,
        validate: {
            notNull: true,
            is: /^(doctor|nurse){5,6}$/i
        },
        set(value) {
            value.toLowerCase();
            const correctVal = value.charAt(0).toUpperCase() + value.slice(1);
            this.setDataValue('post', correctVal);
        }
    },
    join_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            notNull: true,
        }
    },
    salary: {
        type: DataTypes.DECIMAL(9, 2).UNSIGNED,
        allowNull: false,
        validate: {
            isDecimal: true,
            notNull: true
        }
    },
    shift: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
            notNull: true,
            is: /^(Morning|M|Day|D|Evening|E|Night|N|Midnight|MD)$/i
        },
        set(value) {
            value.toLowerCase();
            if (value === 'morning' || value === 'm') this.setDataValue('gender', 'M');
            if (value === 'day' || value === 'd') this.setDataValue('gender', 'D');
            if (value === 'evening' || value === 'e') this.setDataValue('gender', 'E');
            if (value === 'night' || value === 'n') this.setDataValue('gender', 'N');
            if (value === 'midnight' || value === 'md') this.setDataValue('gender', 'MD');
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

// 