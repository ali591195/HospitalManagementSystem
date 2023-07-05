const { Patient, Person, Allergy, Staff, Doctor, Nurse, Ward, PatientAllergyAssignment, StaffPatientAssignment } = require('../startup/associations');
const { postValidator, putValidator, expressPostValidator, expressPutValidator } = require('../validations/patient');

const sequelize = require('../startup/database');

const express = require('express');
const router = express.Router();

router.put('/:id', expressPutValidator, async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    let patient = await Patient.findByPk(id, {
        include: {
            model: Person,
            attributes: []
        },
        attributes: [
            [sequelize.literal('`person`.`id`'), 'personId'],
            [sequelize.literal('`person`.`first_name`'), 'firstName'],
            [sequelize.literal('`person`.`last_name`'), 'lastName'],
            [sequelize.literal('`person`.`cnic`'), 'cnic'],
            [sequelize.literal('`person`.`phone`'), 'phone'],
            [sequelize.literal('`person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`person`.`gender`'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
        ]

    });
    if (!patient) return res.status(404).send(`The id ${id} does not exist...`);

    patient = patient.get({ plain: true });

    const t = await sequelize.transaction();
    try {
        const gender = obj.gender || patient.gender;

        const error = putValidator(req.body);
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

        await Person.update({ 
            firstName: obj.firstName || patient.firstName, 
            lastName: obj.lastName || patient.lastName, 
            gender: gender.toLowerCase(), 
            cnic: obj.cnic || patient.cnic, 
            phone: obj.phone || patient.phone, 
            birthDate: obj.birthDate || patient.birthDate
        }, { where: { id: patient.personId }, transaction: t });
        await Patient.update({
            wardId: obj.wardId || patient.wardId,
            admitDate: obj.admitDate || patient.admitDate,
            releaseDate: obj.releaseDate || patient.releaseDate,
            sickness: obj.sickness || patient.sickness,
            medication: obj.medication || patient.medication,
        }, { where: { id: id }, transaction: t });

        await t.commit();

        if (obj.allergies) {
            let allergies = await Promise.all(
                Array.from(obj.allergies, async instance => {
                  const [allergyInstance] = await Allergy.findOrCreate({
                    where: { name: instance },
                    defaults: { name: instance }
                  });
                  return allergyInstance.id;
                })
            );
            allergies = allergies.map(instance => ({ allergyId: instance, patientId: id }))
            await PatientAllergyAssignment.bulkCreate(allergies, { validate: true, ignoreDuplicates: true });
        }
        if (obj.assignedStaffs) {
            const assignments = obj.assignedStaffs.map(instance => ({
                staffId: instance,
                patientId: id
            }));
            await StaffPatientAssignment.bulkCreate(assignments, { validate: true, ignoreDuplicates: true });
        }
        
        const patientInstance = await Patient.findByPk(id, {
            include: [
                {
                    model: Person,
                    attributes: []
                },
                {
                    model: Allergy,
                    through: { attributes: [] },
                    attributes: ['name']
                },
                {
                    model: Staff,
                    include: [
                        {
                            model: Person,
                            attributes: []
                        },
                        {
                            model: Doctor,
                            attributes: ['id'],
                        },
                        {
                            model: Nurse,
                            attributes: ['id'],
                        }
                    ],
                    through: { attributes: [] },
                    attributes: [
                        ['id', 'staffId'],
                        [sequelize.literal("CONCAT(`staffs->person`.`first_name`, ' ', `staffs->person`.`last_name`)"), 'fullName'],
                        [sequelize.literal('`staffs->person`.`cnic`'), 'cnic'],
                        [sequelize.literal('`staffs->person`.`phone`'), 'phone'],
                        [sequelize.literal('`staffs->person`.`birth_date`'), 'birthDate'],
                        [sequelize.literal('`staffs->person`.`gender`'), 'gender'],
                        'post',
                        'joinDate',
                        'salary',
                        'shift',
                        [sequelize.literal('specialty'), 'specialty'],
                    ]
                },
                {
                    model: Ward,
                    attributes: [ 'id', 'name', 'capacity' ]
                }
            ],
            attributes: [
                'id',
                [sequelize.literal("CONCAT(`person`.`first_name`, ' ', `person`.`last_name`)"), 'fullName'],
                [sequelize.literal('`person`.`cnic`'), 'cnic'],
                [sequelize.literal('`person`.`phone`'), 'phone'],
                [sequelize.literal('`person`.`birth_date`'), 'birthDate'],
                [sequelize.literal('`person`.`gender`'), 'gender'],
                ['admit_date', 'admitDate'],
                ['release_date', 'releaseDate'],
                'sickness',
                'medication'
            ],
            nest: true
        });

        patient = patientInstance.get({ plain: true });
        patient.allergies = patient.allergies.map(instance => instance.name);
        patient.assignedStaffs = patient.staffs.map(instance => {
            let id
            if(instance.post === 'Doctor') {
                id = instance.doctor.id;
                delete instance.doctor;
                delete instance.nurse;
            } else if (instance.post === 'Nurse') {
                id = instance.nurse.id;
                delete instance.doctor;
                delete instance.specialty;
                delete instance.nurse;
            }
            return { id, ...instance };
        });
        delete patient.staffs

        res.send(patient);
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const patientInstance = await Patient.findByPk(id, {
        include: [
            {
                model: Person,
                attributes: []
            },
            {
                model: Allergy,
                through: { attributes: [] },
                attributes: ['name']
            },
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    },
                    {
                        model: Doctor,
                        attributes: ['id'],
                    },
                    {
                        model: Nurse,
                        attributes: ['id'],
                    }
                ],
                through: { attributes: [] },
                attributes: [
                    ['id', 'staffId'],
                    [sequelize.literal("CONCAT(`staffs->person`.`first_name`, ' ', `staffs->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`staffs->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`staffs->person`.`phone`'), 'phone'],
                    [sequelize.literal('`staffs->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`staffs->person`.`gender`'), 'gender'],
                    'post',
                    'joinDate',
                    'salary',
                    'shift',
                    [sequelize.literal('specialty'), 'specialty'],
                ]
            },
            {
                model: Ward,
                attributes: [ 'id', 'name', 'capacity' ]
            }
        ],
        attributes: [
            'id',
            [sequelize.literal('`person`.`id`'), 'personId'],
            [sequelize.literal("CONCAT(`person`.`first_name`, ' ', `person`.`last_name`)"), 'fullName'],
            [sequelize.literal('`person`.`cnic`'), 'cnic'],
            [sequelize.literal('`person`.`phone`'), 'phone'],
            [sequelize.literal('`person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`person`.`gender`'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
        ],
        nest: true
    });
    if (!patientInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const patient = patientInstance.get({ plain: true });
    patient.allergies = patient.allergies.map(instance => instance.name);
    patient.assignedStaffs = patient.staffs.map(instance => {
        let id
        if(instance.post === 'Doctor') {
            id = instance.doctor.id;
            delete instance.doctor;
            delete instance.nurse;
        } else if (instance.post === 'Nurse') {
            id = instance.nurse.id;
            delete instance.doctor;
            delete instance.specialty;
            delete instance.nurse;
        }
        return { id, ...instance };
    });
    delete patient.staffs

    const t = await sequelize.transaction();
    try {
        await Patient.destroy({ where: { id: id}, transaction: t });
        await Person.destroy({ where: { id: patient.personId }, transaction: t });
        await t.commit();
        
        res.send(patient);
    }
    catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const patientInstance = await Patient.findByPk(id, {
        include: [
            {
                model: Person,
                attributes: []
            },
            {
                model: Allergy,
                through: { attributes: [] },
                attributes: ['name']
            },
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    },
                    {
                        model: Doctor,
                        attributes: ['id'],
                    },
                    {
                        model: Nurse,
                        attributes: ['id'],
                    }
                ],
                through: { attributes: [] },
                attributes: [
                    ['id', 'staffId'],
                    [sequelize.literal("CONCAT(`staffs->person`.`first_name`, ' ', `staffs->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`staffs->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`staffs->person`.`phone`'), 'phone'],
                    [sequelize.literal('`staffs->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`staffs->person`.`gender`'), 'gender'],
                    'post',
                    'joinDate',
                    'salary',
                    'shift',
                    [sequelize.literal('specialty'), 'specialty'],
                ]
            },
            {
                model: Ward,
                attributes: [ 'id', 'name', 'capacity' ]
            }
        ],
        attributes: [
            'id',
            [sequelize.literal("CONCAT(`person`.`first_name`, ' ', `person`.`last_name`)"), 'fullName'],
            [sequelize.literal('`person`.`cnic`'), 'cnic'],
            [sequelize.literal('`person`.`phone`'), 'phone'],
            [sequelize.literal('`person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`person`.`gender`'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
        ],
        nest: true
    });
    if (!patientInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const patient = patientInstance.get({ plain: true });
    patient.allergies = patient.allergies.map(instance => instance.name);
    patient.assignedStaffs = patient.staffs.map(instance => {
        let id
        if(instance.post === 'Doctor') {
            id = instance.doctor.id;
            delete instance.doctor;
            delete instance.nurse;
        } else if (instance.post === 'Nurse') {
            id = instance.nurse.id;
            delete instance.doctor;
            delete instance.specialty;
            delete instance.nurse;
        }
        return { id, ...instance };
    });
    delete patient.staffs

    res.send(patient);
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
        let patient = await Patient.create({ 
            personId: person.id,
            wardId: obj.wardId,
            admitDate: obj.admitDate,
            releaseDate: obj.releaseDate || null,
            sickness: obj.sickness,
            medication: obj.medication || null,
        }, { transaction: t });

        await t.commit();

        if (obj.allergies) {
            const allergies = await Promise.all(
                Array.from(obj.allergies, async instance => {
                  const [allergyInstance] = await Allergy.findOrCreate({
                    where: { name: instance },
                    defaults: { name: instance }
                  });
                  return allergyInstance.id;
                })
            );
            await patient.addAllergies(allergies);
        }
        if (obj.assignedStaffs) await patient.addStaffs(obj.assignedStaffs);
         
        const patientInstance = await Patient.findByPk(patient.id, {
            include: [
                {
                    model: Person,
                    attributes: []
                },
                {
                    model: Allergy,
                    through: { attributes: [] },
                    attributes: ['name']
                },
                {
                    model: Staff,
                    include: [
                        {
                            model: Person,
                            attributes: []
                        },
                        {
                            model: Doctor,
                            attributes: ['id'],
                        },
                        {
                            model: Nurse,
                            attributes: ['id'],
                        }
                    ],
                    through: { attributes: [] },
                    attributes: [
                        ['id', 'staffId'],
                        [sequelize.literal("CONCAT(`staffs->person`.`first_name`, ' ', `staffs->person`.`last_name`)"), 'fullName'],
                        [sequelize.literal('`staffs->person`.`cnic`'), 'cnic'],
                        [sequelize.literal('`staffs->person`.`phone`'), 'phone'],
                        [sequelize.literal('`staffs->person`.`birth_date`'), 'birthDate'],
                        [sequelize.literal('`staffs->person`.`gender`'), 'gender'],
                        'post',
                        'joinDate',
                        'salary',
                        'shift',
                        [sequelize.literal('specialty'), 'specialty'],
                    ]
                },
                {
                    model: Ward,
                    attributes: [ 'id', 'name', 'capacity' ]
                }
            ],
            attributes: [
                'id',
                [sequelize.literal("CONCAT(`person`.`first_name`, ' ', `person`.`last_name`)"), 'fullName'],
                [sequelize.literal('`person`.`cnic`'), 'cnic'],
                [sequelize.literal('`person`.`phone`'), 'phone'],
                [sequelize.literal('`person`.`birth_date`'), 'birthDate'],
                [sequelize.literal('`person`.`gender`'), 'gender'],
                ['admit_date', 'admitDate'],
                ['release_date', 'releaseDate'],
                'sickness',
                'medication'
            ],
            nest: true
        });

        patient = patientInstance.get({ plain: true });
        patient.allergies = patient.allergies.map(instance => instance.name);
        patient.assignedStaffs = patient.staffs.map(instance => {
            let id
            if(instance.post === 'Doctor') {
                id = instance.doctor.id;
                delete instance.doctor;
                delete instance.nurse;
            } else if (instance.post === 'Nurse') {
                id = instance.nurse.id;
                delete instance.doctor;
                delete instance.specialty;
                delete instance.nurse;
            }
            return { id, ...instance };
        });
        delete patient.staffs

        res.send(patient);
        
    } catch(err) {
        await t.rollback();
        console.error(err);
        res.send(err.message);
    }
});
router.get('/', async (req, res) => {
    const patientInstance = await Patient.findAll({
        include: [
            {
                model: Person,
                attributes: []
            },
            {
                model: Allergy,
                through: { attributes: [] },
                attributes: ['name']
            },
            {
                model: Staff,
                include: [
                    {
                        model: Person,
                        attributes: []
                    },
                    {
                        model: Doctor,
                        attributes: ['id'],
                    },
                    {
                        model: Nurse,
                        attributes: ['id'],
                    }
                ],
                through: { attributes: [] },
                attributes: [
                    ['id', 'staffId'],
                    [sequelize.literal("CONCAT(`staffs->person`.`first_name`, ' ', `staffs->person`.`last_name`)"), 'fullName'],
                    [sequelize.literal('`staffs->person`.`cnic`'), 'cnic'],
                    [sequelize.literal('`staffs->person`.`phone`'), 'phone'],
                    [sequelize.literal('`staffs->person`.`birth_date`'), 'birthDate'],
                    [sequelize.literal('`staffs->person`.`gender`'), 'gender'],
                    'post',
                    'joinDate',
                    'salary',
                    'shift',
                    [sequelize.literal('specialty'), 'specialty'],
                ]
            },
            {
                model: Ward,
                attributes: [ 'id', 'name', 'capacity' ]
            }
        ],
        attributes: [
            'id',
            [sequelize.literal("CONCAT(`person`.`first_name`, ' ', `person`.`last_name`)"), 'fullName'],
            [sequelize.literal('`person`.`cnic`'), 'cnic'],
            [sequelize.literal('`person`.`phone`'), 'phone'],
            [sequelize.literal('`person`.`birth_date`'), 'birthDate'],
            [sequelize.literal('`person`.`gender`'), 'gender'],
            ['admit_date', 'admitDate'],
            ['release_date', 'releaseDate'],
            'sickness',
            'medication'
        ],
        nest: true
    });

    let patient = patientInstance.map(instance => instance.get({ plain: true }));
    patient = patient.map(instance => {
        instance.allergies = instance.allergies.map(allergyInstance => allergyInstance.name);
        instance.assignedStaffs = instance.staffs.map(staffInstance => {
            let id
            if(staffInstance.post === 'Doctor') {
                id = staffInstance.doctor.id;
                delete staffInstance.doctor;
                delete staffInstance.nurse;
            } else if (staffInstance.post === 'Nurse') {
                id = staffInstance.nurse.id;
                delete staffInstance.doctor;
                delete staffInstance.specialty;
                delete staffInstance.nurse;
            }
            return { id, ...staffInstance };
        });
        delete instance.staffs
        return instance;
    });

    res.send(patient);
});

module.exports = router;