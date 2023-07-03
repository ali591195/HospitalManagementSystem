const doctors = require('../routes/doctors');
const nurses = require('../routes/nurses');
const wards = require('../routes/wards');
const sync = require('../routes/sync');

const sequelize = require('./database');

const express = require('express');

module.exports = function(app){ 
    app.use(express.json());
    app.use('/api/sync', sync);
    app.use('/api/wards', wards);
    app.use('/api/nurses', nurses);
    app.use('/api/doctors', doctors);
}