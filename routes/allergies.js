const { postValidator, putValidator, expressPostValidator, expressPutValidator } = require('../validations/allergy');
const { Allergy, Patient, Person } = require('../startup/associations');

const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', expressPutValidator, async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    let allergy = await Allergy.findByPk(id);
    if (!allergy) return res.status(404).send(`The id ${id} does not exist...`);

    try {
        const error = putValidator(req.body);
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

        await Allergy.update({
            name: obj.name || allergy.name,
        }, { where: { id: allergy.id } });

        if (obj.patients) await allergy.addPatients(obj.patients);
        
        const allergyInstance = await Allergy.findByPk(id, {
            include: {
                model: Patient,
                include: {
                    model: Person,
                    attributes: []
                },
                through: { attributes: [] },
                attributes: [
                    'id',
                [sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                ['admit_date', 'admitDate'],
                ['release_date', 'releaseDate'],
                'sickness',
                'medication'
                ]
            },
            attributes: ['name'],
            nest: true
        });

        res.send(allergyInstance);
    } catch(err) {
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const allergyInstance = await Allergy.findByPk(id, {
        include: {
            model: Patient,
            include: {
                model: Person,
                attributes: []
            },
            through: { attributes: [] },
            attributes: [
                'id',
            [sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'fullName'],
            [sequelize.literal('cnic'), 'cnic'],
            [sequelize.literal('phone'), 'phone'],
            [sequelize.literal('birth_date'), 'birthDate'],
            [sequelize.literal('gender'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
            ]
        },
        attributes: ['name'],
        nest: true
    });
    if (!allergyInstance) return res.status(404).send(`The id ${id} does not exist...`);

    try {
        await Allergy.destroy({ where: { id: id } });
        
        res.send(allergyInstance);
    }
    catch(err) {
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const allergyInstance = await Allergy.findByPk(id, {
        include: {
            model: Patient,
            include: {
                model: Person,
                attributes: []
            },
            through: { attributes: [] },
            attributes: [
                'id',
            [sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'fullName'],
            [sequelize.literal('cnic'), 'cnic'],
            [sequelize.literal('phone'), 'phone'],
            [sequelize.literal('birth_date'), 'birthDate'],
            [sequelize.literal('gender'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
            ]
        },
        attributes: ['name'],
        nest: true
    });
    if (!allergyInstance) return res.status(404).send(`The id ${id} does not exist...`);

    res.send(allergyInstance);
});

router.post('/', expressPostValidator, async (req, res) => {
    const obj = req.body;

    try {
        const error = postValidator(req.body);
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

        const allergy = await Allergy.create({  
            name: obj.name
        });

        if (obj.patients) await allergy.addPatients(obj.patients);
        
        const allergyInstance = await Allergy.findByPk(allergy.id, {
            include: {
                model: Patient,
                include: {
                    model: Person,
                    attributes: []
                },
                through: { attributes: [] },
                attributes: [
                    'id',
                [sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                ['admit_date', 'admitDate'],
                ['release_date', 'releaseDate'],
                'sickness',
                'medication'
                ]
            },
            attributes: ['name'],
            nest: true
        });

        res.send(allergyInstance);
    } catch(err) {
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const allergyInstances = await Allergy.findAll({
        include: {
            model: Patient,
            include: {
                model: Person,
                attributes: []
            },
            through: { attributes: [] },
            attributes: [
                'id',
            [sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'fullName'],
            [sequelize.literal('cnic'), 'cnic'],
            [sequelize.literal('phone'), 'phone'],
            [sequelize.literal('birth_date'), 'birthDate'],
            [sequelize.literal('gender'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
            ]
        },
        attributes: ['name'],
        nest: true
    });

    res.send(allergyInstances);
});

module.exports = router;