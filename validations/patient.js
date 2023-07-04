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
        wardId: Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/).required(),
        admitDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/).required(),
        releaseDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
        sickness: Joi.string().min(3).max(255).required(),
        medication: Joi.string().min(3).max(255),
        allergies: Joi.array().items(Joi.string().min(3).max(50)),
        assignedStaffs: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
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
        wardId: Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/),
        admitDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
        releaseDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
        sickness: Joi.string().min(3).max(255),
        medication: Joi.string().min(3).max(255),
        allergies: Joi.array().items(Joi.string().min(3).max(50)),
        assignedStaffs: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)),
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
    body('wardId')
        .isString()
        .notEmpty()
        .trim()
        .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/),
    body('admitDate')
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('releaseDate')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('sickness')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 255 }),
    body('medication')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 255 }),
    body('allergies')
        .optional()
        .isArray()
        .custom(value => {
            for(let allergies of value)
                if(!((typeof allergies === 'string') && allergies.length >= 3 && allergies.length <= 50))
                    throw new Error('Invalid allergy name');
            return true;
        }),
    body('assignedStaffs')
        .optional()
        .isArray()
        .custom(value => {
            for (let patientId of value) 
                if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId)) 
                    throw new Error('Invalid patient ID format.');
            return true;
        })
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
    body('wardId')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/),
    body('admitDate')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('releaseDate')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .matches(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    body('sickness')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 255 }),
    body('medication')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 255 }),
    body('allergies')
        .optional()
        .isArray()
        .custom(value => {
            for(let allergies of value)
                if(!((typeof allergies === 'string') && allergies.length >= 3 && allergies.length <= 50))
                    throw new Error('Invalid allergy name');
            return true;
        }),
    body('assignedStaffs')
        .optional()
        .isArray()
        .custom(value => {
        for (let patientId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId)) 
                throw new Error('Invalid patient ID format.');
        return true;
        })
];