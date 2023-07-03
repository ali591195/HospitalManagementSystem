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
        admitDate: Joi.string().regex(/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
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