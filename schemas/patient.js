const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../startup/database');

module.exports = sequelize.define('patient', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'person',
            key: 'id'
        }
    },
    ward_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ward',
            key: 'id'
        }
    },
    admit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    release_date: DataTypes.DATEONLY,
    sickness: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    medication: DataTypes.STRING(255),
});