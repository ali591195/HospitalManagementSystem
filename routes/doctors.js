const { Doctor, Staff, Person } = require('../startup/associations');
const { postValidator, putValidator } = require('../validations/doctor');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const validate = require('../middleware/validate');
const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', validate(putValidator), async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).send(`The id ${id} does not exist...`);

    const t = await sequelize.transaction();
    try {
        const staff = await Staff.findByPk(doctor.staffId);
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
        }, { where: { id: person.id }, transaction: t });
        await Staff.update({
            joinDate: obj.joinDate || staff.joinDate,
            salary: obj.salary || staff.salary,
            shift: shift.toLowerCase()
        }, { where: { id: staff.id }, transaction: t });
        await Doctor.update({
            specialty: obj.specialty || doctor.specialty
        }, { where: { id: doctor.id }, transaction: t });
        
        await t.commit();

        if (obj.assignedPatients) await staff.addPatients(obj.assignedPatients);
        if (obj.assignedNurses) await doctor.addNurses(obj.assignedNurses);
        if (obj.assignedWards) await staff.addWards(obj.assignedWards);
        
        const updatedDoctor = await Person.findByPk(person.id,
            {
                include: [
                    {
                        model: Staff,
                        attributes: [],
                        include: {
                            model: Doctor,
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
                        [sequelize.col('staff.doctor.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('staff.join_date'), 'joinDate'],
                        [sequelize.col('staff.salary'), 'salary'],
                        [sequelize.col('staff.shift'), 'shift'],
                        [sequelize.col('staff.doctor.specialty'), 'specialty']
                    ]
                },
                raw: true
        });

        const patients = await staff.getPatients();
        updatedDoctor.assignedPatients = patients.map(patient => patient.id);
        const nurses = await doctor.getNurses();
        updatedDoctor.assignedNurses = nurses.map(nurse => nurse.id);
        const wards = await staff.getWards();
        updatedDoctor.assignedWards = wards.map(ward => ward.id);

        res.send(updatedDoctor);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).send(`The id ${id} does not exist...`);

    const t = await sequelize.transaction();
    try {
        const staff = await Staff.findByPk(doctor.staffId);
        const deletedDoctor = await Person.findByPk(staff.personId,
            {
                include: [
                    {
                        model: Staff,
                        attributes: [],
                        include: {
                            model: Doctor,
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
                        [sequelize.col('staff.doctor.id'), 'id'],
                        ['id', 'personId'],
                        [sequelize.col('staff.id'), 'staffId'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('staff.join_date'), 'joinDate'],
                        [sequelize.col('staff.salary'), 'salary'],
                        [sequelize.col('staff.shift'), 'shift'],
                        [sequelize.col('staff.doctor.specialty'), 'specialty']
                    ]
                },
                raw: true
        });

        const patients = await staff.getPatients();
        deletedDoctor.assignedPatients = patients.map(patient => patient.id);
        const nurses = await doctor.getNurses();
        deletedDoctor.assignedNurses = nurses.map(nurse => nurse.id);
        const wards = await staff.getWards();
        deletedDoctor.assignedWards = wards.map(ward => ward.id);

        await Doctor.destroy({ where: { id: id}, transaction: t });
        await Staff.destroy({ where: { id: deletedDoctor.staffId }, transaction: t });
        await Person.destroy({ where: { id: deletedDoctor.personId }, transaction: t });
        await t.commit();
        
        res.send(deletedDoctor);
    }
    catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).send(`The id ${id} does not exist...`);

    const staff = await Staff.findByPk(doctor.staffId);
    const person = await Person.findByPk(staff.personId);
    
    const doctorInstance = await Person.findByPk(person.id,
        {
            include: [
                {
                    model: Staff,
                    attributes: [],
                    include: [
                        {
                            model: Doctor,
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
                    [sequelize.col('staff.doctor.id'), 'id'],
                    [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                    'gender',
                    'cnic',
                    'phone',
                    ['birth_date', 'birthDate'],
                    [sequelize.col('staff.join_date'), 'joinDate'],
                    [sequelize.col('staff.salary'), 'salary'],
                    [sequelize.col('staff.shift'), 'shift'],
                    [sequelize.col('staff.doctor.specialty'), 'specialty']
                ]
            },
            raw: true
    });

    const patients = await staff.getPatients();
    doctorInstance.assignedPatients = patients.map(patient => patient.id);
    const nurses = await doctor.getNurses();
    doctorInstance.assignedNurses = nurses.map(nurse => nurse.id);
    const wards = await staff.getWards();
    doctorInstance.assignedWards = wards.map(ward => ward.id);

    res.send(doctorInstance);
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
            post: 'doctor',
            joinDate: obj.joinDate,
            salary: obj.salary,
            shift: obj.shift.toLowerCase()
        }, { transaction: t });
        const doctor = await Doctor.create({ 
            id: uuidv4(), 
            staffId: staff.id,
            specialty: obj.specialty
        }, { transaction: t });

        await t.commit();

        if (obj.assignedPatients) await staff.addPatients(obj.assignedPatients);
        if (obj.assignedNurses) await doctor.addNurses(obj.assignedNurses);
        if (obj.assignedWards) await staff.addWards(obj.assignedWards);
        
        const createdDoctor = await Person.findByPk(person.id,
            {
                include: [
                    {
                        model: Staff,
                        attributes: [],
                        include: [
                            {
                                model: Doctor,
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
                        [sequelize.col('staff.doctor.id'), 'id'],
                        [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                        'gender',
                        'cnic',
                        'phone',
                        ['birth_date', 'birthDate'],
                        [sequelize.col('staff.join_date'), 'joinDate'],
                        [sequelize.col('staff.salary'), 'salary'],
                        [sequelize.col('staff.shift'), 'shift'],
                        [sequelize.col('staff.doctor.specialty'), 'specialty']
                    ]
                },
                raw: true
        });

        const patients = await staff.getPatients();
        createdDoctor.assignedPatients = patients.map(patient => patient.id);
        const nurses = await doctor.getNurses();
        createdDoctor.assignedNurses = nurses.map(nurse => nurse.id);
        const wards = await staff.getWards();
        createdDoctor.assignedWards = wards.map(ward => ward.id);

        res.send(createdDoctor);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const doctorsRecords = await Person.findAll({
            include: [
                {
                    model: Staff,
                    attributes: [],
                    include: [
                        {
                            model: Doctor,
                            attributes: []
                        }
                    ]
                }
            ],
            where: {
                '$staff.doctor.id$': { [Op.not]: null }
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
                    [sequelize.col('staff.doctor.id'), 'id'],
                    [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                    'gender',
                    'cnic',
                    'phone',
                    ['birth_date', 'birthDate'],
                    [sequelize.col('staff.join_date'), 'joinDate'],
                    [sequelize.col('staff.salary'), 'salary'],
                    [sequelize.col('staff.shift'), 'shift'],
                    [sequelize.col('staff.doctor.specialty'), 'specialty']
                ]
            },
            raw: true
    });
    const doctorsList = await Promise.all(
        doctorsRecords.map(async (doctors) => {
            const doctor = await Doctor.findByPk(doctors.id);
            const staff = await Staff.findByPk(doctor.staffId);
            const wards = await staff.getWards();
            const assignedWards = wards.map(ward => ward.id);
            const nurses = await doctor.getNurses();
            const assignedNurses = nurses.map(nurse => nurse.id);
            const patients = await staff.getPatients();
            const assignedPatients = patients.map(patient => patient.id);
            return { ...doctors, assignedPatients, assignedNurses, assignedWards };
        })
    );
    res.send(doctorsList);
});

module.exports = router;