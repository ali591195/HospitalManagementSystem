const Sequelize = require('sequelize');
const sequelize = require('../startup/database');

const Person = sequelize.define('Person', {
    cnic: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        validate: {
            len: {
                args: [3, 15],
                msg: "CNIC format should be like this: 12101-1234567-X"
            },
            is: {
                args: /^[-0-9]+$/,
                msg: "CNIC must only contain numbers and symbol -"
            },
            noSpace(value) {
                if(value.includes(' '))
                    throw new Error('Code must not contain spaces.')
            }
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [3, 50],
                msg: "The length should be between 3 to 50 characters"
            },
            is: {
                args: /^[A-Za-z]+$/,
                msg: "Name should only contain alphabets"
            }
        }
    },
    gender: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [5],
                msg: "Gender should be atleast 5 letters"
            }
        }
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [11, 15],
                msg: "Please write a correct phone number"
            },
            is: {
                args: /^[\d-+]+$/,
                msg: "Phone no must not contain alphabets or unsupported symbols"
            }
        }
    },
    birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
});