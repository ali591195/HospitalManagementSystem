const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const sequelize = require('../startup/database');

module.exports = sequelize.define('patient', {
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
    wardId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'ward_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    admitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'admit_date',
        validate: {
            isDate: true,
            notNull: true,
        }
    },
    releaseDate: {
        type: DataTypes.DATEONLY,
        field: 'release_date',
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