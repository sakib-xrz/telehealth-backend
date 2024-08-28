const validateRequest = schema => async (req, _res, next) => {
    console.log('Validating request');

    try {
        await schema.parseAsync({
            body: req.body
        });
        return next();
    } catch (err) {
        next(err);
    }
};

module.exports = validateRequest;
