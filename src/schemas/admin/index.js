const { z } = require('zod');

const createSchema = z.object({
    name: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    }),
    email: z
        .string({
            required_error: 'Email is required'
        })
        .email({
            message: 'Invalid email format'
        }),
    password: z
        .string({
            required_error: 'Password is required'
        })
        .min(6, 'Password must be at least 6 characters long'),
    contactNumber: z.string({
        required_error: 'Contact number is required'
    })
});

const updateSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        contactNumber: z.string().optional()
    })
});

const AdminValidation = {
    updateSchema,
    createSchema
};

module.exports = AdminValidation;
