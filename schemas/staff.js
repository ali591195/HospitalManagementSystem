const Sequelize = require('sequelize');
const sequelize = require('../startup/database');

const Staff = sequelize.define('Staff', {
    cnic: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
            model: 'Persons',
            key: 'cnic'
        }
    },
    post: {
        type: Sequelize.STRING,
        allowNull: false
    },
    joinedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    salary: {
        type: Sequelize.NUMBER,
        allowNull: false
    },
    shift: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [3],
                msg: "Write atleast three characters"
            }
        }
    }
});