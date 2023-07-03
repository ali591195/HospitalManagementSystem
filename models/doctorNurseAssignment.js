const { DataTypes } = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('doctor_nurse_assignment', {
    doctorId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'doctor_id',
        validate: {
            isUUID: 4,
            notNull: true,
            notEmpty: true
        }
    },
    nurseId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'nurse_id',
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