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
    }),
    address: z.string().optional()
});

const updateSchema = z.object({
    body: z.object({
        name: z
            .string({
                invalid_type_error: 'Name must be a string'
            })
            .optional(),
        contactNumber: z.string().optional(),
        address: z.string().optional()
    })
});

const PatientValidation = {
    createSchema,
    updateSchema
};

module.exports = PatientValidation;
