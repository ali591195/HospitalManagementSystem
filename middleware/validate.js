// A general middleware for validating request's body. It takes a function which contains validation logic and also return the error if validation fails otherwise send a falsy value
// It takes the return value and if it is an error, it send status of 400. Otherwise call the next middleware.
module.exports = (validator) => {
    return async (req, res, next) => {
        const error = await validator(req.body)
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);
        next();
    }
};