const Joi = require('joi');

exports.postValidator = function(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        capacity: Joi.number().integer().max(1000).required()
    });

    return schema.validate(obj).error;
};
exports.putValidator = function(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50),
        capacity: Joi.number().integer().max(1000)
    });

    return schema.validate(obj).error;
};