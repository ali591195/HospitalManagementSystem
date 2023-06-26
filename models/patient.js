const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('patient', {
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
    ward_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        },
        references: {
            model: 'wards',
            key: 'id'
        }
    },
    admit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            notNull: true,
        }
    },
    release_date: {
        type: DataTypes.DATEONLY,
        validate: {
            isDate: true,
        }
    },
    sickness: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: true,
            notEmpty: true,
            max: 255
        }
    },
    medication: {
        type: DataTypes.STRING(255),
        validate: {
            notEmpty: true,
            max: 255
        }
    },
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });