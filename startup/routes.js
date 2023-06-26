const sequelize = require('./database');
const express = require('express');
const sync = require('../routes/sync');
const wards = require('../routes/wards');

module.exports = function(app){ 
    app.use(express.json());
    app.use('/api/sync', sync);
    app.use('/api/wards', wards)
}