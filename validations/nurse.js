const { body } = require('express-validator');
const Joi = require('joi');

exports.postValidator = function(obj) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).regex(/^([a-z]+)$/i).required(),
        lastName: Joi.string().min(3).max(50).regex(/^([a-z]+)$/i).required(),
        gender: Joi.string().min(1).max(6).regex(/^(Male|Female|M|F)$/i).required(),
        cnic: Joi.string().min(15).max(15).regex(/^[0-9]{5}-[0-9]{7}-[0-9]$/).required(),
        phone: Joi.string().min(12).max(12).regex(/^[0-9]{4}-[0-9]{7}$/).required(),
        birthDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/).required(),
        joinDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
        salary: Joi.number(),
        shift: Joi.string().min(1).max(8).regex(/^(Morning|M|Day|D|Evening|E|Night|N|Midnight|MD)$/i),
        assignedPatients: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
        assignedDoctors: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
        assignedWards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
    });

    return schema.validate(obj).error;
};
exports.putValidator = function(obj) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).regex(/^([a-z]+)$/i),
        lastName: Joi.string().min(3).max(50).regex(/^([a-z]+)$/i),
        gender: Joi.string().min(1).max(6).regex(/^(Male|Female|M|F)$/i),
        cnic: Joi.string().min(15).max(15).regex(/^[0-9]{5}-[0-9]{7}-[0-9]$/),
        phone: Joi.string().min(12).max(12).regex(/^[0-9]{4}-[0-9]{7}$/),
        birthDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
        joinDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
        salary: Joi.number(),
        shift: Joi.string().min(1).max(8).regex(/^(Morning|M|Day|D|Evening|E|Night|N|Midnight|MD)$/i),
        assignedPatients: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
        assignedDoctors: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
        assignedWards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
    });

    return schema.validate(obj).error;
};

exports.expressPostValidator = [
    body('firstName')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .matches(/^([a-z]+)$/i),
    body('lastName')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .matches(/^([a-z]+)$/i),
    body('gender')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 6 })
        .matches(/^(Male|Female|M|F)$/i),
    body('cnic')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 15, max: 15 })
        .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/),
    body('phone')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 12, max: 12 })
        .matches(/^[0-9]{4}-[0-9]{7}$/),
    body('birthDate')
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('joinDate')
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('salary').isNumeric(),
    body('shift')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 8 })
        .matches(/^(Morning|M|Day|D|Evening|E|Night|N|Midnight|MD)$/i),
    body('assignedPatients')
        .optional()
        .isArray()
        .custom(value => {
        for (let patientId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId)) 
                throw new Error('Invalid patient ID format.');
        return true;
        }),
    body('assignedNurses')
        .optional()
        .isArray()
        .custom(value => {
        for (let nurseId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(nurseId)) 
                throw new Error('Invalid nurse ID format.');
        return true;
        }),
    body('assignedWards')
        .optional()
        .isArray()
        .custom(value => {
        for (let wardId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(wardId)) 
                throw new Error('Invalid ward ID format.');
        return true;
        }),
];
exports.expressPutValidator = [
    body('firstName')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .matches(/^([a-z]+)$/i),
    body('lastName')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .matches(/^([a-z]+)$/i),
    body('gender')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 6 })
        .matches(/^(Male|Female|M|F)$/i),
    body('cnic')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 15, max: 15 })
        .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/),
    body('phone')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 12, max: 12 })
        .matches(/^[0-9]{4}-[0-9]{7}$/),
    body('birthDate')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('joinDate')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('salary')
        .optional()
        .isNumeric(),
    body('shift')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 8 })
        .matches(/^(Morning|M|Day|D|Evening|E|Night|N|Midnight|MD)$/i),
    body('assignedPatients')
        .optional()
        .isArray()
        .custom(value => {
        for (let patientId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId)) 
                throw new Error('Invalid patient ID format.');
        return true;
        }),
    body('assignedNurses')
        .optional()
        .isArray()
        .custom(value => {
        for (let nurseId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(nurseId)) 
                throw new Error('Invalid nurse ID format.');
        return true;
        }),
    body('assignedWards')
        .optional()
        .isArray()
        .custom(value => {
        for (let wardId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(wardId)) 
                throw new Error('Invalid ward ID format.');
        return true;
        }),
];