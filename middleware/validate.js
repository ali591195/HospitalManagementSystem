module.exports = (validator) => {
    return async (req, res, next) => {
        const error = await validator(req.body)
        if(error) return res.status(400).send(`Encounter the following error: ${error.details[0].message}`);
        next();
    }
};