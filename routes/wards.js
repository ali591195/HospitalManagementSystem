const { postValidator, putValidator, expressPostValidator, expressPutValidator } = require('../validations/ward');
const { Ward, Staff, Person, Doctor, Nurse } = require('../startup/associations');
const { v4: uuidv4 } = require('uuid');

const sequelize = require('sequelize');

const express = require('express');
const router = express.Router();

router.put('/:id', expressPutValidator, async (req, res) => {
    const id = req.params.id;
    const obj  = req.body;

    let wardInstance = await Ward.findByPk(id);
    if (!wardInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const error = putValidator(req.body);
    if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

    await Ward.update({
        name: obj.name || wardInstance.name,
        capacity: obj.capacity || wardInstance.capacity,
    }, { where: { id: id } });

    if (obj.assignedStaffs) await wardInstance.addStaffs(id, obj.assignedStaffs);

    wardInstance = await Ward.findByPk(id, {
        include: {
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
            attributes: [
                ['id', 'staffId'],
                [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                'post',
                'joinDate',
                'salary',
                'shift',
                [sequelize.literal('specialty'), 'specialty'],
            ],
            nest: false,
            through: { attributes: [] },
            as: 'assignedStaffs'
        },
        attributes: { exclude: ['created_at', 'updated_at'] }, 
        nest: true,
    });

    const ward = wardInstance.get({ plain: true });
    ward.assignedStaffs = ward.assignedStaffs.map(staff => {
        if(staff.post === 'Doctor') {
            const id = staff.doctor.id;
            delete staff.doctor;
            delete staff.nurse;
            return {id, ...staff};
        }
        else if(staff.post === 'Nurse') {
            const id = staff.nurse.id;
            delete staff.doctor;
            delete staff.nurse;
            delete staff.specialty;
            return {id, ...staff};
        }
    });
    
    res.send(ward);
});
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const wardInstance = await Ward.findByPk(id, {
        include: {
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
            attributes: [
                ['id', 'staffId'],
                [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                'post',
                'joinDate',
                'salary',
                'shift',
                [sequelize.literal('specialty'), 'specialty'],
            ],
            nest: false,
            through: { attributes: [] },
            as: 'assignedStaffs'
        },
        attributes: { exclude: ['created_at', 'updated_at'] }, 
        nest: true,
    });
    if (!wardInstance) return res.status(404).send(`The id ${id} does not exist...`);

    await Ward.destroy({ where: { id: id } });

    const ward = wardInstance.get({ plain: true });
    ward.assignedStaffs = ward.assignedStaffs.map(staff => {
        if(staff.post === 'Doctor') {
            const id = staff.doctor.id;
            delete staff.doctor;
            delete staff.nurse;
            return {id, ...staff};
        }
        else if(staff.post === 'Nurse') {
            const id = staff.nurse.id;
            delete staff.doctor;
            delete staff.nurse;
            delete staff.specialty;
            return {id, ...staff};
        }
    });

    res.send(ward);
});
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const wardInstance = await Ward.findByPk(id, {
        include: {
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
            attributes: [
                ['id', 'staffId'],
                [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                'post',
                'joinDate',
                'salary',
                'shift',
                [sequelize.literal('specialty'), 'specialty'],
            ],
            nest: false,
            through: { attributes: [] },
            as: 'assignedStaffs'
        },
        attributes: { exclude: ['created_at', 'updated_at'] }, 
        nest: true,
    });
    if (!wardInstance) return res.status(404).send(`The id ${id} does not exist...`);

    const ward = wardInstance.get({ plain: true });
    ward.assignedStaffs = ward.assignedStaffs.map(staff => {
        if(staff.post === 'Doctor') {
            const id = staff.doctor.id;
            delete staff.doctor;
            delete staff.nurse;
            return {id, ...staff};
        }
        else if(staff.post === 'Nurse') {
            const id = staff.nurse.id;
            delete staff.doctor;
            delete staff.nurse;
            delete staff.specialty;
            return {id, ...staff};
        }
    });

    res.send(ward);
});

router.post('/', expressPostValidator, async (req, res) => {
    const obj = req.body;

    const error = postValidator(req.body);
    if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);

    let ward = await Ward.create({ id: uuidv4(), name: obj.name, capacity: obj.capacity });

    if (obj.assignedStaffs) await ward.addAssignedStaffs(obj.assignedStaffs);

    const wardInstance = await Ward.findByPk(ward.id, {
        include: {
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
            attributes: [
                ['id', 'staffId'],
                [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                'post',
                'joinDate',
                'salary',
                'shift',
                [sequelize.literal('specialty'), 'specialty'],
            ],
            nest: false,
            through: { attributes: [] },
            as: 'assignedStaffs'
        },
        attributes: { exclude: ['created_at', 'updated_at'] }, 
        nest: true,
    });

    ward = wardInstance.get({ plain: true });
    ward.assignedStaffs = ward.assignedStaffs.map(staff => {
        if(staff.post === 'Doctor') {
            const id = staff.doctor.id;
            delete staff.doctor;
            delete staff.nurse;
            return {id, ...staff};
        }
        else if(staff.post === 'Nurse') {
            const id = staff.nurse.id;
            delete staff.doctor;
            delete staff.nurse;
            delete staff.specialty;
            return {id, ...staff};
        }
    });

    res.send(ward);
});
router.get('/', async (req, res) => {
    const wardInstance = await Ward.findAll({
        include: {
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
            attributes: [
                ['id', 'staffId'],
                [sequelize.literal(`CONCAT(first_name, ' ', last_name)`), 'fullName'],
                [sequelize.literal('cnic'), 'cnic'],
                [sequelize.literal('phone'), 'phone'],
                [sequelize.literal('birth_date'), 'birthDate'],
                [sequelize.literal('gender'), 'gender'],
                'post',
                'joinDate',
                'salary',
                'shift',
                [sequelize.literal('specialty'), 'specialty'],
            ],
            nest: false,
            through: { attributes: [] },
            as: 'assignedStaffs'
        },
        attributes: { exclude: ['created_at', 'updated_at'] }, 
        nest: true,
    });

    let ward = wardInstance.map(instance => instance.get({ plain: true }));
    console.log(ward);
    ward = ward.map(instance => {
        instance.assignedStaffs = instance.assignedStaffs.map(staff => {
            if(staff.post === 'Doctor') {
                const id = staff.doctor.id;
                delete staff.doctor;
                delete staff.nurse;
                return {id, ...staff};
            }
            else if(staff.post === 'Nurse') {
                const id = staff.nurse.id;
                delete staff.doctor;
                delete staff.nurse;
                delete staff.specialty;
                return {id, ...staff};
            }
            return staff;
        });
        return instance
    });

    res.send(ward);
});

module.exports = router;