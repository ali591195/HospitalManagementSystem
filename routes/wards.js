const { postValidator, putValidator } = require('../validations/ward');
const { Ward } = require('../startup/associations');
const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const validate = require('../middleware/validate');

const express = require('express');
const router = express.Router();

router.put('/:id', validate(putValidator), async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    const ward = await Ward.findByPk(id);
    if (!ward) return res.status(404).send(`The id ${id} does not exist...`);

    await Ward.update({
        name: obj.name || ward.name,
        capacity: obj.capacity || ward.capacity,
    }, { where: { id: id } });

    if (obj.assignedStaffs) await ward.addStaffs(obj.assignedStaffs);

    const wardInstance = await Ward.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] }, raw: true });

    const staffs = await ward.getStaffs();
    wardInstance.assignedStaffs = staffs.map(staff => staff.id);

    res.send(wardInstance);
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const ward = await Ward.findByPk(id);
    if (!ward) return res.status(404).send(`The id ${id} does not exist...`);

    const wardInstance = await Ward.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] }, raw: true });

    await Ward.destroy({ where: { id: id } });

    const staffs = await ward.getStaffs();
    wardInstance.assignedStaffs = staffs.map(staff => staff.id);

    res.send(wardInstance);
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const ward = await Ward.findByPk(id);
    if (!ward) return res.status(404).send(`The id ${id} does not exist...`);

    const wardInstance = await Ward.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] }, raw: true });

    const staffs = await ward.getStaffs();
    wardInstance.assignedStaffs = staffs.map(staff => staff.id);

    res.send(wardInstance);
});

router.post('/', validate(postValidator), async (req, res) => {
    const obj = req.body;

    const ward = await Ward.create({ id: uuidv4(), name: obj.name, capacity: obj.capacity });

    if (obj.assignedStaffs) await ward.addStaffs(obj.assignedStaffs);

    const wardInstance = await Ward.findByPk(ward.id, { attributes: { exclude: ['created_at', 'updated_at'] }, raw: true });

    const staffs = await ward.getStaffs();
    wardInstance.assignedStaffs = staffs.map(staff => staff.id);

    res.send(wardInstance);
});
router.get('/', async (req, res) => {
    const wardRecord = await Ward.findAll({ attributes: { exclude: ['created_at', 'updated_at'] }, raw: true });

    const wardsWithStaffs = await Promise.all(
        wardRecord.map(async (ward) => {
            const wardInstance = await Ward.findByPk(ward.id);
            const staffs = await wardInstance.getStaffs();
            const assignedStaffs = staffs.map(staff => staff.id);
            return { ...ward, assignedStaffs };
        })
    );

    res.send(wardsWithStaffs);
});

module.exports = router;