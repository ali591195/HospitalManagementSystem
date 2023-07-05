const { Doctor, Staff, Person, Patient, Nurse, Ward, StaffWardAssignment, DoctorNurseAssignment, StaffPatientAssignment } = require('../startup/associations');
const { postValidator, putValidator, expressPostValidator, expressPutValidator } = require('../validations/doctor');

const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', expressPutValidator, async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    let doctor = await await Doctor.findByPk(id, {
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
            'specialty'
        ],
        nest: true
    });
    if (!doctor) return res.status(404).send(`The id ${id} does not exist...`);

    doctor = doctor.get({ plain: true });

    const t = await sequelize.transaction();
    try {
        const gender = obj.gender || doctor.gender;
        const shift = obj.shift || doctor.shift

        const error = putValidator(req.body);
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

        await Person.update({ 
            firstName: obj.firstName || doctor.firstName, 
            lastName: obj.lastName || doctor.lastName, 
            gender: gender.toLowerCase(), 
            cnic: obj.cnic || doctor.cnic, 
            phone: obj.phone || doctor.phone, 
            birthDate: obj.birthDate || doctor.birthDate
        }, { where: { id: doctor.personId }, transaction: t });
        await Staff.update({
            joinDate: obj.joinDate || doctor.joinDate,
            salary: obj.salary || doctor.salary,
            shift: shift.toLowerCase()
        }, { where: { id: doctor.staffId }, transaction: t });
        await Doctor.update({
            specialty: obj.specialty || doctor.specialty
        }, { where: { id: doctor.id }, transaction: t });
        
        await t.commit();

        if (obj.assignedPatients) {
            const assignments = obj.assignedPatients.map(instance => ({
                staffId: doctor.staffId,
                patientId: instance
            }));
            await StaffPatientAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        if (obj.assignedNurses) {
            const assignments = obj.assignedNurses.map(instance => ({
                doctorId: doctor.id,
                nurseId: instance
            }));
            await DoctorNurseAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        if (obj.assignedWards) {
            const assignments = obj.assignedWards.map(instance => ({
                staffId: doctor.staffId,
                wardId: instance
            }));
            await StaffWardAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        
        const doctorInstance = await Doctor.findByPk(id, {
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
                    model: Nurse,
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
                        [sequelize.literal("CONCAT(`nurses->staff->person`.`first_name`, ' ', `nurses->staff->person`.`last_name`)"), 'fullName'],
                        [sequelize.literal('`nurses->staff->person`.`cnic`'), 'cnic'],
                        [sequelize.literal('`nurses->staff->person`.`phone`'), 'phone'],
                        [sequelize.literal('`nurses->staff->person`.`birth_date`'), 'birthDate'],
                        [sequelize.literal('`nurses->staff->person`.`gender`'), 'gender'],
                        [sequelize.literal('`nurses->staff`.`join_date`'), 'joinDate'],
                        [sequelize.literal('`nurses->staff`.`salary`'), 'salary'],
                        [sequelize.literal('`nurses->staff`.`shift`'), 'shift'],
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
                'specialty'
            ],
            nest: true
        });

        doctor = doctorInstance.get({ plain: true });
        doctor.assignedWards = doctor.staff.wards;
        doctor.assignedPatients = doctor.staff.patients;
        doctor.assignedNurses = doctor.nurses;
        delete doctor.staff;
        delete doctor.nurses;

        res.send(doctor);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const doctorInstance = await Doctor.findByPk(id, {
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
                model: Nurse,
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
                    [sequelize.literal("CONCAT(`nurses->staff->person`.`first_name`, ' ', `nurses->staff->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`nurses->staff->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`nurses->staff->person`.`phone`'), 'phone'],
                    [sequelize.literal('`nurses->staff->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`nurses->staff->person`.`gender`'), 'gender'],
                    [sequelize.literal('`nurses->staff`.`join_date`'), 'joinDate'],
                    [sequelize.literal('`nurses->staff`.`salary`'), 'salary'],
                    [sequelize.literal('`nurses->staff`.`shift`'), 'shift'],
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
            'specialty'
        ],
        nest: true
    });
    if (!doctorInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const doctor = doctorInstance.get({ plain: true });
    doctor.assignedWards = doctor.staff.wards;
    doctor.assignedPatients = doctor.staff.patients;
    doctor.assignedNurses = doctor.nurses;
    delete doctor.staff;
    delete doctor.nurses;

    const t = await sequelize.transaction();
    try {
        await Doctor.destroy({ where: { id: id}, transaction: t });
        await Staff.destroy({ where: { id: doctor.staffId }, transaction: t });
        await Person.destroy({ where: { id: doctor.personId }, transaction: t });
        await t.commit();
        
        res.send(doctor);
    }
    catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const doctorInstance = await Doctor.findByPk(id, {
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
                model: Nurse,
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
                    [sequelize.literal("CONCAT(`nurses->staff->person`.`first_name`, ' ', `nurses->staff->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`nurses->staff->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`nurses->staff->person`.`phone`'), 'phone'],
                    [sequelize.literal('`nurses->staff->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`nurses->staff->person`.`gender`'), 'gender'],
                    [sequelize.literal('`nurses->staff`.`join_date`'), 'joinDate'],
                    [sequelize.literal('`nurses->staff`.`salary`'), 'salary'],
                    [sequelize.literal('`nurses->staff`.`shift`'), 'shift'],
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
            'specialty'
        ],
        nest: true
    });
    if (!doctorInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const doctor = doctorInstance.get({ plain: true });
    doctor.assignedWards = doctor.staff.wards;
    doctor.assignedPatients = doctor.staff.patients;
    doctor.assignedNurses = doctor.nurses;
    delete doctor.staff;
    delete doctor.nurses;

    res.send(doctor);
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
            post: 'doctor',
            joinDate: obj.joinDate,
            salary: obj.salary,
            shift: obj.shift.toLowerCase()
        }, { transaction: t });
        let doctor = await Doctor.create({ 
            staffId: staff.id,
            specialty: obj.specialty
        }, { transaction: t });

        await t.commit();

        if (obj.assignedPatients) await staff.addPatients(obj.assignedPatients);
        if (obj.assignedNurses) await doctor.addNurses(obj.assignedNurses);
        if (obj.assignedWards) await staff.addWards(obj.assignedWards);
        
        const doctorInstance = await Doctor.findByPk(doctor.id, {
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
                    model: Nurse,
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
                        [sequelize.literal("CONCAT(`nurses->staff->person`.`first_name`, ' ', `nurses->staff->person`.`last_name`)"), 'fullName'],
                        [sequelize.literal('`nurses->staff->person`.`cnic`'), 'cnic'],
                        [sequelize.literal('`nurses->staff->person`.`phone`'), 'phone'],
                        [sequelize.literal('`nurses->staff->person`.`birth_date`'), 'birthDate'],
                        [sequelize.literal('`nurses->staff->person`.`gender`'), 'gender'],
                        [sequelize.literal('`nurses->staff`.`join_date`'), 'joinDate'],
                        [sequelize.literal('`nurses->staff`.`salary`'), 'salary'],
                        [sequelize.literal('`nurses->staff`.`shift`'), 'shift'],
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
                'specialty'
            ],
            nest: true
        });

        doctor = doctorInstance.get({ plain: true });
        doctor.assignedWards = doctor.staff.wards;
        doctor.assignedPatients = doctor.staff.patients;
        doctor.assignedNurses = doctor.nurses;
        delete doctor.staff;
        delete doctor.nurses;

        res.send(doctor);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const doctorInstance = await Doctor.findAll({
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
                model: Nurse,
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
                    [sequelize.literal("CONCAT(`nurses->staff->person`.`first_name`, ' ', `nurses->staff->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`nurses->staff->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`nurses->staff->person`.`phone`'), 'phone'],
                    [sequelize.literal('`nurses->staff->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`nurses->staff->person`.`gender`'), 'gender'],
                    [sequelize.literal('`nurses->staff`.`join_date`'), 'joinDate'],
                    [sequelize.literal('`nurses->staff`.`salary`'), 'salary'],
                    [sequelize.literal('`nurses->staff`.`shift`'), 'shift'],
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
            'specialty'
        ],
        nest: true
    });
    
    let doctor = doctorInstance.map(instance => instance.get({ plain: true }));
    doctor = doctor.map(instance => {
        instance.assignedWards = instance.staff.wards;
        instance.assignedPatients = instance.staff.patients;
        instance.assignedNurses = instance.nurses;
        delete instance.staff;
        delete instance.nurses;
        return instance;
    });

    res.send(doctor);
});

module.exports = router;