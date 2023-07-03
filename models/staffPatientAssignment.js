const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('staff_patient_assignment', {
    staffId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'staff_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    patientId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'patient_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });