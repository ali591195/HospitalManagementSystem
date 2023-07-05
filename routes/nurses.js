const { Nurse, Staff, Person, Patient, Ward, Doctor, StaffPatientAssignment, StaffWardAssignment, DoctorNurseAssignment } = require('../startup/associations')
const { postValidator, putValidator, expressPostValidator, expressPutValidator } = require('../validations/nurse');

const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', expressPutValidator, async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    let nurse = await Nurse.findByPk(id, {
        include: [
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    }
                ],
                attributes: [],
            }
        ],
        attributes: [
            'id',
            ['staff_id', 'staffId'],
            [sequelize.literal('`staff`.`person_id`'), 'personId'],
            [sequelize.literal('`staff->person`.`first_name`'), 'firstName'],
            [sequelize.literal('`staff->person`.`last_name`'), 'lastName'],
            [sequelize.literal('`staff->person`.`cnic`'), 'cnic'],
            [sequelize.literal('`staff->person`.`phone`'), 'phone'],
            [sequelize.literal('`staff->person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`staff->person`.`gender`'), 'gender'],
            [sequelize.literal('`staff`.`post`'), 'post'],
            [sequelize.literal('`staff`.`join_date`'), 'joinDate'],
            [sequelize.literal('`staff`.`salary`'), 'salary'],
            [sequelize.literal('`staff`.`shift`'), 'shift'],
        ],
        nest: true
    });
    if (!nurse) return res.status(404).send(`The id ${id} does not exist...`);

    nurse = nurse.get({ plain: true });

    const t = await sequelize.transaction();
    try {
        const gender = obj.gender || nurse.gender;
        const shift = obj.shift || nurse.shift

        const error = putValidator(req.body);
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

        await Person.update({ 
            firstName: obj.firstName || nurse.firstName, 
            lastName: obj.lastName || nurse.lastName, 
            gender: gender.toLowerCase(), 
            cnic: obj.cnic || nurse.cnic, 
            phone: obj.phone || nurse.phone, 
            birthDate: obj.birthDate || nurse.birthDate
        }, { where: { id: nurse.personId } ,transaction: t });
        await Staff.update({
            joinDate: obj.joinDate || nurse.joinDate,
            salary: obj.salary || nurse.salary,
            shift: shift.toLowerCase()
        }, { where: { id: nurse.staffId } ,transaction: t });
        
        await t.commit();

        if (obj.assignedPatients) {
            const assignments = obj.assignedPatients.map(instance => ({
                staffId: nurse.staffId,
                patientId: instance
            }));
            await StaffPatientAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        if (obj.assignedDoctors) {
            const assignments = obj.assignedDoctors.map(instance => ({
                nurseId: nurse.id,
                doctorId: instance
            }));
            await DoctorNurseAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        if (obj.assignedWards) {
            const assignments = obj.assignedWards.map(instance => ({
                staffId: nurse.staffId,
                wardId: instance
            }));
            await StaffWardAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        
        const nurseInstance = await Nurse.findByPk(id, {
            include: [
                {
                    model: Staff,
                    include: [
                        {
                            model: Person,
                            attributes: []
                        },
                        {
                            model: Patient,
                            through: { attributes: [] },
                            include: [
                                {
                                    model: Person,
                                    attributes: []
                                }
                            ],
                            attributes: [
                                'id',
                                ['ward_id', 'wardId'],
                                [sequelize.literal("CONCAT(`staff->patients->person`.`first_name`, ' ', `staff->patients->person`.`last_name`)"), 'fullName'],
                                [sequelize.literal('`staff->patients->person`.`cnic`'), 'cnic'],
                                [sequelize.literal('`staff->patients->person`.`phone`'), 'phone'],
                                [sequelize.literal('`staff->patients->person`.`birth_date`'), 'birthDate'],
                                [sequelize.literal('`staff->patients->person`.`gender`'), 'gender'],
                                ['admit_date', 'admitDate'],
                                ['release_date', 'releaseDate'],
                                'sickness',
                                'medication'
                            ]
                        },
                        {
                            model: Ward,
                            attributes: [ 'id', 'name', 'capacity' ],
                            through: { attributes: [] }
                        }
                    ],
                    attributes: [
                        'id'
                    ],
                },
                {
                    model: Doctor,
                    include: {
                        model: Staff,
                        include: {
                            model: Person,
                            attributes: []
                        },
                        attributes: []
                    },
                    attributes: [
                        'id',
                        ['staff_id', 'staffId'],
                        [sequelize.literal("CONCAT(`doctors->staff->person`.`first_name`, ' ', `doctors->staff->person`.`last_name`)"), 'fullName'],
                        [sequelize.literal('`doctors->staff->person`.`cnic`'), 'cnic'],
                        [sequelize.literal('`doctors->staff->person`.`phone`'), 'phone'],
                        [sequelize.literal('`doctors->staff->person`.`birth_date`'), 'birthDate'],
                        [sequelize.literal('`doctors->staff->person`.`gender`'), 'gender'],
                        [sequelize.literal('`doctors->staff`.`join_date`'), 'joinDate'],
                        [sequelize.literal('`doctors->staff`.`salary`'), 'salary'],
                        [sequelize.literal('`doctors->staff`.`shift`'), 'shift'],
                        'specialty'
                    ],
                    through: { attributes: [] }
                },
            ],
            attributes: [
                'id',
                ['staff_id', 'staffId'],
                [sequelize.literal("CONCAT(`staff->person`.`first_name`, ' ', `staff->person`.`last_name`)"), 'fullName'],
                [sequelize.literal('`staff->person`.`cnic`'), 'cnic'],
                [sequelize.literal('`staff->person`.`phone`'), 'phone'],
                [sequelize.literal('`staff->person`.`birth_date`'), 'birthDate'],
                [sequelize.literal('`staff->person`.`gender`'), 'gender'],
                [sequelize.literal('`staff`.`post`'), 'post'],
                [sequelize.literal('`staff`.`join_date`'), 'joinDate'],
                [sequelize.literal('`staff`.`salary`'), 'salary'],
                [sequelize.literal('`staff`.`shift`'), 'shift'],
            ],
            nest: true
        });
        
        nurse = nurseInstance.get({ plain: true });
        nurse.assignedWards = nurse.staff.wards;
        nurse.assignedPatients = nurse.staff.patients;
        nurse.assignedDoctors = nurse.doctors;
        delete nurse.staff;
        delete nurse.doctors;

        res.send(nurse);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const nurseInstance = await Nurse.findByPk(id, {
        include: [
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    },
                    {
                        model: Patient,
                        through: { attributes: [] },
                        include: [
                            {
                                model: Person,
                                attributes: []
                            }
                        ],
                        attributes: [
                            'id',
                            ['ward_id', 'wardId'],
                            [sequelize.literal("CONCAT(`staff->patients->person`.`first_name`, ' ', `staff->patients->person`.`last_name`)"), 'fullName'],
                            [sequelize.literal('`staff->patients->person`.`cnic`'), 'cnic'],
                            [sequelize.literal('`staff->patients->person`.`phone`'), 'phone'],
                            [sequelize.literal('`staff->patients->person`.`birth_date`'), 'birthDate'],
                            [sequelize.literal('`staff->patients->person`.`gender`'), 'gender'],
                            ['admit_date', 'admitDate'],
                            ['release_date', 'releaseDate'],
                            'sickness',
                            'medication'
                        ]
                    },
                    {
                        model: Ward,
                        attributes: [ 'id', 'name', 'capacity' ],
                        through: { attributes: [] }
                    }
                ],
                attributes: [
                    'id'
                ],
            },
            {
                model: Doctor,
                include: {
                    model: Staff,
                    include: {
                        model: Person,
                        attributes: []
                    },
                    attributes: []
                },
                attributes: [
                    'id',
                    ['staff_id', 'staffId'],
                    [sequelize.literal("CONCAT(`doctors->staff->person`.`first_name`, ' ', `doctors->staff->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`doctors->staff->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`doctors->staff->person`.`phone`'), 'phone'],
                    [sequelize.literal('`doctors->staff->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`doctors->staff->person`.`gender`'), 'gender'],
                    [sequelize.literal('`doctors->staff`.`join_date`'), 'joinDate'],
                    [sequelize.literal('`doctors->staff`.`salary`'), 'salary'],
                    [sequelize.literal('`doctors->staff`.`shift`'), 'shift'],
                    'specialty'
                ],
                through: { attributes: [] }
            },
        ],
        attributes: [
            'id',
            ['staff_id', 'staffId'],
            [sequelize.literal('`staff`.`person_id`'), 'personId'],
            [sequelize.literal("CONCAT(`staff->person`.`first_name`, ' ', `staff->person`.`last_name`)"), 'fullName'],
            [sequelize.literal('`staff->person`.`cnic`'), 'cnic'],
            [sequelize.literal('`staff->person`.`phone`'), 'phone'],
            [sequelize.literal('`staff->person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`staff->person`.`gender`'), 'gender'],
            [sequelize.literal('`staff`.`post`'), 'post'],
            [sequelize.literal('`staff`.`join_date`'), 'joinDate'],
            [sequelize.literal('`staff`.`salary`'), 'salary'],
            [sequelize.literal('`staff`.`shift`'), 'shift'],
        ],
        nest: true
    });
    if (!nurseInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const nurse = nurseInstance.get({ plain: true });
    nurse.assignedWards = nurse.staff.wards;
    nurse.assignedPatients = nurse.staff.patients;
    nurse.assignedDoctors = nurse.doctors;
    delete nurse.staff;
    delete nurse.doctors;

    const t = await sequelize.transaction();
    try {
        await Nurse.destroy({ where: { id: id}, transaction: t });
        await Staff.destroy({ where: { id: nurse.staffId }, transaction: t });
        await Person.destroy({ where: { id: nurse.personId }, transaction: t });
        await t.commit();
        
        res.send(nurse);
    }
    catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const nurseInstance = await Nurse.findByPk(id, {
        include: [
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    },
                    {
                        model: Patient,
                        through: { attributes: [] },
                        include: [
                            {
                                model: Person,
                                attributes: []
                            }
                        ],
                        attributes: [
                            'id',
                            ['ward_id', 'wardId'],
                            [sequelize.literal("CONCAT(`staff->patients->person`.`first_name`, ' ', `staff->patients->person`.`last_name`)"), 'fullName'],
                            [sequelize.literal('`staff->patients->person`.`cnic`'), 'cnic'],
                            [sequelize.literal('`staff->patients->person`.`phone`'), 'phone'],
                            [sequelize.literal('`staff->patients->person`.`birth_date`'), 'birthDate'],
                            [sequelize.literal('`staff->patients->person`.`gender`'), 'gender'],
                            ['admit_date', 'admitDate'],
                            ['release_date', 'releaseDate'],
                            'sickness',
                            'medication'
                        ]
                    },
                    {
                        model: Ward,
                        attributes: [ 'id', 'name', 'capacity' ],
                        through: { attributes: [] }
                    }
                ],
                attributes: [
                    'id'
                ],
            },
            {
                model: Doctor,
                include: {
                    model: Staff,
                    include: {
                        model: Person,
                        attributes: []
                    },
                    attributes: []
                },
                attributes: [
                    'id',
                    ['staff_id', 'staffId'],
                    [sequelize.literal("CONCAT(`doctors->staff->person`.`first_name`, ' ', `doctors->staff->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`doctors->staff->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`doctors->staff->person`.`phone`'), 'phone'],
                    [sequelize.literal('`doctors->staff->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`doctors->staff->person`.`gender`'), 'gender'],
                    [sequelize.literal('`doctors->staff`.`join_date`'), 'joinDate'],
                    [sequelize.literal('`doctors->staff`.`salary`'), 'salary'],
                    [sequelize.literal('`doctors->staff`.`shift`'), 'shift'],
                    'specialty'
                ],
                through: { attributes: [] }
            },
        ],
        attributes: [
            'id',
            ['staff_id', 'staffId'],
            [sequelize.literal("CONCAT(`staff->person`.`first_name`, ' ', `staff->person`.`last_name`)"), 'fullName'],
            [sequelize.literal('`staff->person`.`cnic`'), 'cnic'],
            [sequelize.literal('`staff->person`.`phone`'), 'phone'],
            [sequelize.literal('`staff->person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`staff->person`.`gender`'), 'gender'],
            [sequelize.literal('`staff`.`post`'), 'post'],
            [sequelize.literal('`staff`.`join_date`'), 'joinDate'],
            [sequelize.literal('`staff`.`salary`'), 'salary'],
            [sequelize.literal('`staff`.`shift`'), 'shift'],
        ],
        nest: true
    });
    if (!nurseInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const nurse = nurseInstance.get({ plain: true });
    nurse.assignedWards = nurse.staff.wards;
    nurse.assignedPatients = nurse.staff.patients;
    nurse.assignedDoctors = nurse.doctors;
    delete nurse.staff;
    delete nurse.doctors;

    res.send(nurse);
});

router.post('/', expressPostValidator, async (req, res) => {
    const obj = req.body;

    const t = await sequelize.transaction();

    try {
        const error = postValidator(req.body);
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

        const person = await Person.create({ 
            firstName: obj.firstName, 
            lastName: obj.lastName, 
            gender: obj.gender.toLowerCase(), 
            cnic: obj.cnic, 
            phone: obj.phone, 
            birthDate: obj.birthDate
        }, { transaction: t });
        const staff = await Staff.create({
            personId: person.id,
            post: 'nurse',
            joinDate: obj.joinDate,
            salary: obj.salary,
            shift: obj.shift.toLowerCase()
        }, { transaction: t });
        let nurse = await Nurse.create({ 
            staffId: staff.id
        }, { transaction: t });
        
        await t.commit();

        if (obj.assignedPatients) await staff.addPatients(obj.assignedPatients);
        if (obj.assignedDoctors) await nurse.addDoctors(obj.assignedDoctors);
        if (obj.assignedWards) await staff.addWards(obj.assignedWards);
        
        const nurseInstance = await Nurse.findByPk(nurse.id, {
            include: [
                {
                    model: Staff,
                    include: [
                        {
                            model: Person,
                            attributes: []
                        },
                        {
                            model: Patient,
                            through: { attributes: [] },
                            include: [
                                {
                                    model: Person,
                                    attributes: []
                                }
                            ],
                            attributes: [
                                'id',
                                ['ward_id', 'wardId'],
                                [sequelize.literal("CONCAT(`staff->patients->person`.`first_name`, ' ', `staff->patients->person`.`last_name`)"), 'fullName'],
                                [sequelize.literal('`staff->patients->person`.`cnic`'), 'cnic'],
                                [sequelize.literal('`staff->patients->person`.`phone`'), 'phone'],
                                [sequelize.literal('`staff->patients->person`.`birth_date`'), 'birthDate'],
                                [sequelize.literal('`staff->patients->person`.`gender`'), 'gender'],
                                ['admit_date', 'admitDate'],
                                ['release_date', 'releaseDate'],
                                'sickness',
                                'medication'
                            ]
                        },
                        {
                            model: Ward,
                            attributes: [ 'id', 'name', 'capacity' ],
                            through: { attributes: [] }
                        }
                    ],
                    attributes: [
                        'id'
                    ],
                },
                {
                    model: Doctor,
                    include: {
                        model: Staff,
                        include: {
                            model: Person,
                            attributes: []
                        },
                        attributes: []
                    },
                    attributes: [
                        'id',
                        ['staff_id', 'staffId'],
                        [sequelize.literal("CONCAT(`doctors->staff->person`.`first_name`, ' ', `doctors->staff->person`.`last_name`)"), 'fullName'],
                        [sequelize.literal('`doctors->staff->person`.`cnic`'), 'cnic'],
                        [sequelize.literal('`doctors->staff->person`.`phone`'), 'phone'],
                        [sequelize.literal('`doctors->staff->person`.`birth_date`'), 'birthDate'],
                        [sequelize.literal('`doctors->staff->person`.`gender`'), 'gender'],
                        [sequelize.literal('`doctors->staff`.`join_date`'), 'joinDate'],
                        [sequelize.literal('`doctors->staff`.`salary`'), 'salary'],
                        [sequelize.literal('`doctors->staff`.`shift`'), 'shift'],
                        'specialty'
                    ],
                    through: { attributes: [] }
                },
            ],
            attributes: [
                'id',
                ['staff_id', 'staffId'],
                [sequelize.literal("CONCAT(`staff->person`.`first_name`, ' ', `staff->person`.`last_name`)"), 'fullName'],
                [sequelize.literal('`staff->person`.`cnic`'), 'cnic'],
                [sequelize.literal('`staff->person`.`phone`'), 'phone'],
                [sequelize.literal('`staff->person`.`birth_date`'), 'birthDate'],
                [sequelize.literal('`staff->person`.`gender`'), 'gender'],
                [sequelize.literal('`staff`.`post`'), 'post'],
                [sequelize.literal('`staff`.`join_date`'), 'joinDate'],
                [sequelize.literal('`staff`.`salary`'), 'salary'],
                [sequelize.literal('`staff`.`shift`'), 'shift'],
            ],
            nest: true
        });

        nurse = nurseInstance.get({ plain: true });
        nurse.assignedWards = nurse.staff.wards;
        nurse.assignedPatients = nurse.staff.patients;
        nurse.assignedDoctors = nurse.doctors;
        delete nurse.staff;
        delete nurse.doctors;

        res.send(nurse);
        
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const nurseInstance = await Nurse.findAll({
        include: [
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    },
                    {
                        model: Patient,
                        through: { attributes: [] },
                        include: [
                            {
                                model: Person,
                                attributes: []
                            }
                        ],
                        attributes: [
                            'id',
                            ['ward_id', 'wardId'],
                            [sequelize.literal("CONCAT(`staff->patients->person`.`first_name`, ' ', `staff->patients->person`.`last_name`)"), 'fullName'],
                            [sequelize.literal('`staff->patients->person`.`cnic`'), 'cnic'],
                            [sequelize.literal('`staff->patients->person`.`phone`'), 'phone'],
                            [sequelize.literal('`staff->patients->person`.`birth_date`'), 'birthDate'],
                            [sequelize.literal('`staff->patients->person`.`gender`'), 'gender'],
                            ['admit_date', 'admitDate'],
                            ['release_date', 'releaseDate'],
                            'sickness',
                            'medication'
                        ]
                    },
                    {
                        model: Ward,
                        attributes: [ 'id', 'name', 'capacity' ],
                        through: { attributes: [] }
                    }
                ],
                attributes: [
                    'id'
                ],
            },
            {
                model: Doctor,
                include: {
                    model: Staff,
                    include: {
                        model: Person,
                        attributes: []
                    },
                    attributes: []
                },
                attributes: [
                    'id',
                    ['staff_id', 'staffId'],
                    [sequelize.literal("CONCAT(`doctors->staff->person`.`first_name`, ' ', `doctors->staff->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`doctors->staff->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`doctors->staff->person`.`phone`'), 'phone'],
                    [sequelize.literal('`doctors->staff->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`doctors->staff->person`.`gender`'), 'gender'],
                    [sequelize.literal('`doctors->staff`.`join_date`'), 'joinDate'],
                    [sequelize.literal('`doctors->staff`.`salary`'), 'salary'],
                    [sequelize.literal('`doctors->staff`.`shift`'), 'shift'],
                    'specialty'
                ],
                through: { attributes: [] }
            },
        ],
        attributes: [
            'id',
            ['staff_id', 'staffId'],
            [sequelize.literal("CONCAT(`staff->person`.`first_name`, ' ', `staff->person`.`last_name`)"), 'fullName'],
            [sequelize.literal('`staff->person`.`cnic`'), 'cnic'],
            [sequelize.literal('`staff->person`.`phone`'), 'phone'],
            [sequelize.literal('`staff->person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`staff->person`.`gender`'), 'gender'],
            [sequelize.literal('`staff`.`post`'), 'post'],
            [sequelize.literal('`staff`.`join_date`'), 'joinDate'],
            [sequelize.literal('`staff`.`salary`'), 'salary'],
            [sequelize.literal('`staff`.`shift`'), 'shift'],
        ],
        nest: true
    });

    let nurse = nurseInstance.map(instance => instance.get({ plain: true }));
    nurse = nurse.map(instance => {
        instance.assignedWards = instance.staff.wards;
        instance.assignedPatients = instance.staff.patients;
        instance.assignedDoctors = instance.doctors;
        delete instance.staff;
        delete instance.doctors;
        return instance;
    });

    res.send(nurse);
});

module.exports = router;