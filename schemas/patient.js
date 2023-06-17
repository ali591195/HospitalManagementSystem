const Sequelize = require('sequelize');
const sequelize = require('../startup/database');

const Patient = sequelize.define('Patient', {
    patientId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cnic: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
            model: 'Persons',
            key: 'cnic'
        }
    },
    admittedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    sickness: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
    },
    medications: {
        type: Sequelize.ARRAY(Sequelize.STRING),
    },
    allergies: {
        type: Sequelize.ARRAY(Sequelize.STRING),
    },
    isDischarged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});