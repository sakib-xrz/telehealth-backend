const validateRequest = schema => async (req, _res, next) => {
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
