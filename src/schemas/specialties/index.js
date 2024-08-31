const { z } = require('zod');

const createSchema = z.object({
    title: z.string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string'
    })
});

const updateSchema = z.object({
    title: z
        .string({
            invalid_type_error: 'Title must be a string'
        })
        .optional()
});

const SpecialtiesValidation = {
    createSchema,
    updateSchema
};

module.exports = SpecialtiesValidation;
