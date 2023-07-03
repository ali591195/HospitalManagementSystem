const { Nurse, Staff, Person } = require('../startup/associations')
const { postValidator, putValidator } = require('../validations/nurse');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const validate = require('../middleware/validate');
const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', validate(putValidator), async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    const nurse = await Nurse.findByPk(id);
    if (!nurse) return res.status(404).send(`The id ${id} does not exist...`);

    const t = await sequelize.transaction();
    try {
        const staff = await Staff.findByPk(nurse.staffId);
        const person = await Person.findByPk(staff.personId);
        const gender = obj.gender || person.gender;
        const shift = obj.shift || staff.shift
        await Person.update({ 
            firstName: obj.firstName || person.firstName, 
            lastName: obj.lastName || person.lastName, 
            gender: gender.toLowerCase(), 
            cnic: obj.cnic || person.cnic, 
            phone: obj.phone || person.phone, 
            birthDate: obj.birthDate || person.birthDate
        }, { where: { id: person.id } ,transaction: t });
        await Staff.update({
            joinDate: obj.joinDate || staff.joinDate,
            salary: obj.salary || staff.salary,
            shift: shift.toLowerCase()
        }, { where: { id: staff.id } ,transaction: t });
        await t.commit();

        if (obj.assignedPatients) await staff.addPatients(obj.assignedPatients);
        if (obj.assignedDoctors) await nurse.addDoctors(obj.assignedDoctors);
        if (obj.assignedWards) await staff.addWards(obj.assignedWards);
        
        const updatedNurse = await Person.findByPk(person.id,
            {
                include: [
                    {
                        model: Staff,
                        attributes: [],
                        include: {
                            model: Nurse,
                            attributes: []
                        }
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
                        [sequelize.col('staff.nurse.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('staff.join_date'), 'joinDate'],
                        [sequelize.col('staff.salary'), 'salary'],
                        [sequelize.col('staff.shift'), 'shift']
                    ]
                },
                raw: true
        });
        
        const patients = await staff.getPatients();
        updatedNurse.assignedPatients = patients.map(patient => patient.id);
        const doctors = await nurse.getDoctors();
        updatedNurse.assignedNurses = doctors.map(doctor => doctor.id);
        const wards = await staff.getWards();
        updatedNurse.assignedWards = wards.map(ward => ward.id);

        res.send(updatedNurse);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const nurse = await Nurse.findByPk(id);
    if (!nurse) return res.status(404).send(`The id ${id} does not exist...`);

    const t = await sequelize.transaction();
    try {
        const staff = await Staff.findByPk(nurse.staffId);
        const deletedNurse = await Person.findByPk(staff.personId,
            {
                include: [
                    {
                        model: Staff,
                        attributes: [],
                        include: {
                            model: Nurse,
                            attributes: []
                        }
                    }
                ],
                attributes: { 
                    exclude: [
                        'firstName',
                        'lastName',
                        'created_at',
                        'updated_at'
                    ],
                    include: [
                        [sequelize.col('staff.nurse.id'), 'id'],
                        ['id', 'personId'],
                        [sequelize.col('staff.id'), 'staffId'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('staff.join_date'), 'joinDate'],
                        [sequelize.col('staff.salary'), 'salary'],
                        [sequelize.col('staff.shift'), 'shift']
                    ]
                },
                raw: true
        });

        const patients = await staff.getPatients();
        deletedNurse.assignedPatients = patients.map(patient => patient.id);
        const doctors = await nurse.getDoctors();
        deletedNurse.assignedNurses = doctors.map(doctor => doctor.id);
        const wards = await staff.getWards();
        deletedNurse.assignedWards = wards.map(ward => ward.id);

        await Nurse.destroy({ where: { id: id}, transaction: t });
        await Staff.destroy({ where: { id: deletedNurse.staffId }, transaction: t });
        await Person.destroy({ where: { id: deletedNurse.personId }, transaction: t });
        await t.commit();
        
        res.send(deletedNurse);
    }
    catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const nurse = await Nurse.findByPk(id);
    if (!nurse) return res.status(404).send(`The id ${id} does not exist...`);
    const staff = await Staff.findByPk(nurse.staffId);
    const person = await Person.findByPk(staff.personId);
    
    const nurseRecord = await Person.findByPk(person.id,
        {
            include: [
                {
                    model: Staff,
                    attributes: [],
                    include: [
                        {
                            model: Nurse,
                            attributes: []
                        }
                    ]
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
                    [sequelize.col('staff.nurse.id'), 'id'],
                    [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                    'gender',
                    'cnic',
                    'phone',
                    ['birth_date', 'birthDate'],
                    [sequelize.col('staff.join_date'), 'joinDate'],
                    [sequelize.col('staff.salary'), 'salary'],
                    [sequelize.col('staff.shift'), 'shift']
                ]
            },
            raw: true
    });

    const patients = await staff.getPatients();
    nurseRecord.assignedPatients = patients.map(patient => patient.id);
    const doctors = await nurse.getDoctors();
    nurseRecord.assignedNurses = doctors.map(doctor => doctor.id);
    const wards = await staff.getWards();
    nurseRecord.assignedWards = wards.map(ward => ward.id);

    res.send(nurseRecord);
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
        const staff = await Staff.create({
            id: uuidv4(),
            personId: person.id,
            post: 'nurse',
            joinDate: obj.joinDate,
            salary: obj.salary,
            shift: obj.shift.toLowerCase()
        }, { transaction: t });
        const nurse = await Nurse.create({ 
            id: uuidv4(), 
            staffId: staff.id
        }, { transaction: t });
        await t.commit();

        if (obj.assignedPatients) await staff.addPatients(obj.assignedPatients);
        if (obj.assignedDoctors) await nurse.addDoctors(obj.assignedDoctors);
        if (obj.assignedWards) await staff.addWards(obj.assignedWards);
        
        const createdNurse = await Person.findByPk(person.id,
            {
                include: [
                    {
                        model: Staff,
                        attributes: [],
                        include: [
                            {
                                model: Nurse,
                                attributes: []
                            }
                        ]
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
                        [sequelize.col('staff.nurse.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('staff.join_date'), 'joinDate'],
                        [sequelize.col('staff.salary'), 'salary'],
                        [sequelize.col('staff.shift'), 'shift']
                    ]
                },
                raw: true
        });

        const patients = await staff.getPatients();
        createdNurse.assignedPatients = patients.map(patient => patient.id);
        const doctors = await nurse.getDoctors();
        createdNurse.assignedNurses = doctors.map(doctor => doctor.id);
        const wards = await staff.getWards();
        createdNurse.assignedWards = wards.map(ward => ward.id);

        res.send(createdNurse);
        
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const nursesRecords = await Person.findAll({
            include: [
                {
                    model: Staff,
                    attributes: [],
                    include: [
                        {
                            model: Nurse,
                            attributes: []
                        }
                    ]
                }
            ],
            where: {
                '$staff.nurse.id$': { [Op.not]: null }
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
                    [sequelize.col('staff.nurse.id'), 'id'],
                    [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                    'gender',
                    'cnic',
                    'phone',
                    ['birth_date', 'birthDate'],
                    [sequelize.col('staff.join_date'), 'joinDate'],
                    [sequelize.col('staff.salary'), 'salary'],
                    [sequelize.col('staff.shift'), 'shift']
                ]
            },
            raw: true
    });

    const nursesWithWards = await Promise.all(
        nursesRecords.map(async (nurse) => {
            const nurseInstance = await Nurse.findByPk(nurse.id);
            const staff = await Staff.findByPk(nurseInstance.staffId);
            const wards = await staff.getWards();
            const assignedWards = wards.map(ward => ward.id);
            const doctors = await nurseInstance.getDoctors();
            const assignedDoctors = doctors.map(doctor => doctor.id);
            const patients = await staff.getPatients();
            const assignedPatients = patients.map(patient => patient.id);
            return { ...nurse, assignedPatients, assignedDoctors, assignedWards };
        })
    );
    res.send(nursesWithWards);
});

module.exports = router;