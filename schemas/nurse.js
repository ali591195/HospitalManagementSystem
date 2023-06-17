const Sequelize = require('sequelize');
const sequelize = require('../startup/database');

const Nurse = sequelize.define('Nurse', {
    nurseId: {
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
});