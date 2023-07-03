require('../startup/associations');
const express = require('express');
const router = express.Router();
const sequelize = require('../startup/database');

router.post('/', async (req, res) => {
    await sequelize.sync({ force: true });
    res.send("The database has been synchronized");
});

module.exports = router;
