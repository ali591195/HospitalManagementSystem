const { body } = require('express-validator');
const Joi = require('joi');

exports.postValidator = function(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).regex(/^([a-z]+)$/i).required(),
        patients: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/))
    });

    return schema.validate(obj).error;
};
exports.putValidator = function(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).regex(/^([a-z]+)$/i),
        patients: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/))
    });

    return schema.validate(obj).error;
};
exports.expressPostValidator = [
    body('name')
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-z]+$/i),
    body('patients')
        .optional()
        .isArray()
        .custom(value => {
        for (let patientId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId)) 
                throw new Error('Invalid patient ID format.');
        return true;
        }),
];
exports.expressPutValidator = [
    body('name')
        .optional()
        .isString()
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-z]+$/i)
        .escape(),
    body('patients')
        .optional()
        .isArray()
        .custom(value => {
        for (let patientId of value) 
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId)) 
                throw new Error('Invalid patient ID format.');
        return true;
        }),
];
