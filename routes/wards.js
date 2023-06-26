const Ward = require('../models/ward');
const { Sequelize } = require('sequelize');
const validate = require('../middleware/validate');
const { postValidator, putValidator } = require('../validations/ward');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.post('/', validate(postValidator), async (req, res) => {
    const obj = req.body;
    const ward = await Ward.create({ id: uuidv4(), name: obj.name, capacity: obj.capacity });

    res.send(ward);
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const ward = await Ward.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] } });
    if (!ward) return res.status(404).send(`The id ${id} does not exist...`);

    await Ward.destroy({ where: { id: id } });
    res.send(ward);
});
router.put('/:id', validate(putValidator), async (req, res) => {
    const id = req.params.id;

    let ward = await Ward.findByPk(id);
    if (!ward) return res.status(404).send(`The id ${id} does not exist...`);

    await Ward.update(req.body, { where: { id: id } });

    ward = await Ward.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] } });
    res.send(ward);
});
router.get('/', async (req, res) => {
    const ward = await Ward.findAll({ attributes: { exclude: ['created_at', 'updated_at'] } });

    res.send(ward);
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const ward = await Ward.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] } });

    res.send(ward);
});

module.exports = router;