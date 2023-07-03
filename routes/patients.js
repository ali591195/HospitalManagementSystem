const { Patient, Person, Allergy } = require('../startup/associations');
const { postValidator, putValidator } = require('../validations/patient');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const validate = require('../middleware/validate');
const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', validate(putValidator), async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).send(`The id ${id} does not exist...`);

    const t = await sequelize.transaction();
    try {
        const person = await Person.findByPk(patient.personId);
        const gender = obj.gender || person.gender;
        await Person.update({ 
            firstName: obj.firstName || person.firstName, 
            lastName: obj.lastName || person.lastName, 
            gender: gender.toLowerCase(), 
            cnic: obj.cnic || person.cnic, 
            phone: obj.phone || person.phone, 
            birthDate: obj.birthDate || person.birthDate
        }, { where: { id: person.id }, transaction: t });
        await Patient.update({
            wardId: obj.wardId || patient.wardId,
            admitDate: obj.admitDate || patient.admitDate,
            releaseDate: obj.releaseDate || patient.releaseDate,
            sickness: obj.sickness || patient.sickness,
            medication: obj.medication || patient.medication,
        }, { where: { id: patient.id }, transaction: t });

        await t.commit();

        if (obj.allergies) {
            const allergiesId = await Promise.all(
                obj.allergies.map(async (allergyName) => {
                    const allergyInstance = await Allergy.findOne({ where: { name: allergyName } })
                    if(allergyInstance) return allergyInstance.id;
                    const allergy = await Allergy.create({ id: uuidv4(), name: allergyName });
                    return allergy.id
            }))
            await patient.addAllergies(allergiesId);
        }
        if (obj.assignedStaffs) await patient.addStaffs(obj.assignedStaffs);
        
        const updatedNurse = await Person.findByPk(person.id,
            {
                include: [
                    {
                        model: Patient,
                        attributes: [],
                    }
                ],
                attributes: { 
                    exclude: [
                        'id',
                        'firstName',
                        'lastName',
                        'created_at',
                        'updated_at'
                    ],
                    include: [
                        [sequelize.col('patient.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('patient.ward_id'), 'assignedWard'],
                        [sequelize.col('patient.admit_date'), 'admitDate'],
                        [sequelize.col('patient.release_date'), 'releaseDate'],
                        [sequelize.col('patient.sickness'), 'sickness'],
                        [sequelize.col('patient.medication'), 'medication'],
                    ]
                },
                raw: true
        });

        const allergies = await patient.getAllergies();
        updatedNurse.allergies = allergies.map(staff => staff.id);
        const staffs = await patient.getStaffs();
        updatedNurse.assignedStaffs = staffs.map(staff => staff.id);

        res.send(updatedNurse);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).send(`The id ${id} does not exist...`);

    const t = await sequelize.transaction();
    try {
        const deletedPatient = await Person.findByPk(patient.personId,
            {
                include: [
                    {
                        model: Patient,
                        attributes: [],
                    }
                ],
                attributes: { 
                    exclude: [
                        'id',
                        'firstName',
                        'lastName',
                        'created_at',
                        'updated_at'
                    ],
                    include: [
                        [sequelize.col('patient.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('patient.ward_id'), 'assignedWard'],
                        [sequelize.col('patient.admit_date'), 'admitDate'],
                        [sequelize.col('patient.release_date'), 'releaseDate'],
                        [sequelize.col('patient.sickness'), 'sickness'],
                        [sequelize.col('patient.medication'), 'medication'],
                    ]
                },
                raw: true
        });

        const allergies = await patient.getAllergies();
        deletedPatient.allergies = allergies.map(staff => staff.id);
        const staffs = await patient.getStaffs();
        deletedPatient.assignedStaffs = staffs.map(staff => staff.id);

        await Patient.destroy({ where: { id: id}, transaction: t });
        await Person.destroy({ where: { id: patient.personId }, transaction: t });
        await t.commit();
        
        res.send(deletedPatient);
    }
    catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).send(`The id ${id} does not exist...`);

    const person = await Person.findByPk(patient.personId);
    
    const patientInstance = await Person.findByPk(person.id,
        {
            include: [
                {
                    model: Patient,
                    attributes: [],
                }
            ],
            attributes: { 
                exclude: [
                    'id',
                    'firstName',
                    'lastName',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    [sequelize.col('patient.id'), 'id'],
                    [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                    'gender',
                    'cnic',
                    'phone',
                    ['birth_date', 'birthDate'],
                    [sequelize.col('patient.ward_id'), 'assignedWard'],
                    [sequelize.col('patient.admit_date'), 'admitDate'],
                    [sequelize.col('patient.release_date'), 'releaseDate'],
                    [sequelize.col('patient.sickness'), 'sickness'],
                    [sequelize.col('patient.medication'), 'medication'],
                ]
            },
            raw: true
    });

    const allergies = await patient.getAllergies();
    patientInstance.allergies = allergies.map(staff => staff.id);
    const staffs = await patient.getStaffs();
    patientInstance.assignedStaffs = staffs.map(staff => staff.id);

    res.send(patientInstance);
});

router.post('/', validate(postValidator), async (req, res) => {
    const obj = req.body;

    const t = await sequelize.transaction();

    try {
        const person = await Person.create({ 
            id: uuidv4(), 
            firstName: obj.firstName, 
            lastName: obj.lastName, 
            gender: obj.gender.toLowerCase(), 
            cnic: obj.cnic, 
            phone: obj.phone, 
            birthDate: obj.birthDate
        }, { transaction: t });
        const patient = await Patient.create({ 
            id: uuidv4(), 
            personId: person.id,
            wardId: obj.wardId,
            admitDate: obj.admitDate,
            releaseDate: obj.releaseDate || null,
            sickness: obj.sickness,
            medication: obj.medication || null,
        }, { transaction: t });

        await t.commit();

        if (obj.allergies) {
            const allergiesId = await Promise.all(
                obj.allergies.map(async (allergyName) => {
                    const allergyInstance = await Allergy.findOne({ where: { name: allergyName } })
                    if(allergyInstance) return allergyInstance.id;
                    const allergy = await Allergy.create({ id: uuidv4(), name: allergyName });
                    return allergy.id
            }))
            await patient.addAllergies(allergiesId);
        }
        if (obj.assignedStaffs) await patient.addStaffs(obj.assignedStaffs);
         
        const createdPatient = await Person.findByPk(person.id,
            {
                include: [
                    {
                        model: Patient,
                        attributes: [],
                    }
                ],
                attributes: { 
                    exclude: [
                        'id',
                        'firstName',
                        'lastName',
                        'created_at',
                        'updated_at'
                    ],
                    include: [
                        [sequelize.col('patient.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('patient.ward_id'), 'assignedWard'],
                        [sequelize.col('patient.admit_date'), 'admitDate'],
                        [sequelize.col('patient.release_date'), 'releaseDate'],
                        [sequelize.col('patient.sickness'), 'sickness'],
                        [sequelize.col('patient.medication'), 'medication'],
                    ]
                },
                raw: true
        });

        const allergies = await patient.getAllergies();
        createdPatient.allergies = allergies.map(staff => staff.id);
        const staffs = await patient.getStaffs();
        createdPatient.assignedStaffs = staffs.map(staff => staff.id);

        res.send(createdPatient);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const patientRecords = await Person.findAll({
        include: [
            {
                model: Patient,
                attributes: [],
            }
        ],
            where: {
                '$patient.id$': { [Op.not]: null }
            },
            attributes: { 
                exclude: [
                    'id',
                    'firstName',
                    'lastName',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    [sequelize.col('patient.id'), 'id'],
                    [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                    'gender',
                    'cnic',
                    'phone',
                    ['birth_date', 'birthDate'],
                    [sequelize.col('patient.ward_id'), 'assignedWard'],
                    [sequelize.col('patient.admit_date'), 'admitDate'],
                    [sequelize.col('patient.release_date'), 'releaseDate'],
                    [sequelize.col('patient.sickness'), 'sickness'],
                    [sequelize.col('patient.medication'), 'medication'],
                ]
            },
            raw: true
    });
    const patientsList = await Promise.all(
        patientRecords.map(async (patients) => {
            const patient = await Patient.findByPk(patients.id);
            const staffs = await patient.getStaffs();
            const assignedStaffs = staffs.map(staff => staff.id);
            const allergiesInstances = await patient.getAllergies();
            const allergies = allergiesInstances.map(allergy => allergy.id);
            return { ...patients, allergies, assignedStaffs };
        })
    );
    res.send(patientsList);
});

module.exports = router;