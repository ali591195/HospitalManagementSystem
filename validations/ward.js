const Joi = require('joi');

exports.postValidator = function(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        capacity: Joi.number().integer().max(1000).required(),
        assignedStaffs: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/))
    });

    return schema.validate(obj).error;
};
exports.putValidator = function(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50),
        capacity: Joi.number().integer().max(1000),
        assignedStaffs: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/))
    });

    return schema.validate(obj).error;
};