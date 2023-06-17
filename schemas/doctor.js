const Sequelize = require('sequelize');
const sequelize = require('../startup/database');

const Doctor = sequelize.define('Doctor', {
    doctorId: {
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
    specialty: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
    }
});