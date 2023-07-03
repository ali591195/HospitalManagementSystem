const { postValidator, putValidator } = require('../validations/allergy');
const { Allergy } = require('../startup/associations');
const { v4: uuidv4 } = require('uuid');

const validate = require('../middleware/validate');

const express = require('express');
const router = express.Router();

router.put('/:id', validate(putValidator), async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    const allergy = await Allergy.findByPk(id);
    if (!allergy) return res.status(404).send(`The id ${id} does not exist...`);

    try {
        await Allergy.update({
            name: obj.name || allergy.name,
        }, { where: { id: allergy.id } });

        if (obj.patients) await allergy.addPatients(obj.patients);
        
        const updatedAllergy = await Allergy.findByPk(allergy.id,
            {
                attributes: { 
                    exclude: [
                        'created_at',
                        'updated_at'
                    ]
                },
                raw: true
        });

        const patients = await allergy.getPatients();
        updatedAllergy.patients = patients.map(patient => patient.id);

        res.send(updatedAllergy);
    } catch(err) {
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const allergy = await Allergy.findByPk(id);
    if (!allergy) return res.status(404).send(`The id ${id} does not exist...`);

    try {
        const deletedAllergy = await Allergy.findByPk(allergy.id,
            {
                attributes: { 
                    exclude: [
                        'created_at',
                        'updated_at'
                    ]
                },
                raw: true
        });

        const patients = await allergy.getPatients();
        deletedAllergy.patients = patients.map(patient => patient.id);

        
        await Allergy.destroy({ where: { id: allergy.id } });
        
        res.send(deletedAllergy);
    }
    catch(err) {
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const allergy = await Allergy.findByPk(id);
    if (!allergy) return res.status(404).send(`The id ${id} does not exist...`);
    
    const allegyInstance = await Allergy.findByPk(allergy.id,
        {
            attributes: { 
                exclude: [
                    'created_at',
                    'updated_at'
                ]
            },
            raw: true
    });

    const patients = await allergy.getPatients();
    allegyInstance.patients = patients.map(patient => patient.id);

    res.send(allegyInstance);
});

router.post('/', validate(postValidator), async (req, res) => {
    const obj = req.body;

    try {
        const allergy = await Allergy.create({ 
            id: uuidv4(), 
            name: obj.name
        });

        if (obj.patients) await allergy.addPatients(obj.patients);
        
        const createdAllergy = await Allergy.findByPk(allergy.id,
            {
                attributes: { 
                    exclude: [
                        'created_at',
                        'updated_at'
                    ]
                },
                raw: true
        });

        const patients = await allergy.getPatients();
        createdAllergy.patients = patients.map(patient => patient.id);

        res.send(createdAllergy);
    } catch(err) {
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const allergyRecords = await Allergy.findAll(
        {
            attributes: { 
                exclude: [
                    'created_at',
                    'updated_at'
                ]
            },
            raw: true
    });
    const allergyList = await Promise.all(
        allergyRecords.map(async (allergies) => {
            const allergy = await Allergy.findByPk(allergies.id);
            const patientInstances = await allergy.getPatients();
            const patients = patientInstances.map(patient => patient.id);
            return { ...allergies, patients };
        })
    );
    res.send(allergyList);
});

module.exports = router;