const { Gender } = require('@prisma/client');
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
    address: z.string().optional(),
    registrationNumber: z.string({
        required_error: 'Registration number is required'
    }),
    experience: z
        .number({
            invalid_type_error: 'Experience must be a number'
        })
        .optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE], {
        required_error:
            "Gender is required and must be either 'MALE' or 'FEMALE'"
    }),
    appointmentFee: z.number({
        required_error: 'Appointment Fee is required',
        invalid_type_error: 'Appointment Fee must be a number'
    }),
    qualification: z.string({
        required_error: 'Qualification is required',
        invalid_type_error: 'Qualification must be a string'
    }),
    currentWorkingPlace: z
        .string({
            invalid_type_error:
                'Current Working Place must be a string'
        })
        .optional(),
    designation: z
        .string({
            invalid_type_error: 'Designation must be a string'
        })
        .optional()
});

const updateSchema = z.object({
    body: z.object({
        name: z
            .string({
                invalid_type_error: 'Name must be a string'
            })
            .optional(),
        contactNumber: z
            .string({
                invalid_type_error: 'Contact number must be a string'
            })
            .optional(),
        address: z
            .string({
                invalid_type_error: 'Address must be a string'
            })
            .optional(),
        experience: z
            .number({
                invalid_type_error: 'Experience must be a number'
            })
            .optional(),
        appointmentFee: z
            .number({
                invalid_type_error: 'Appointment Fee must be a number'
            })
            .optional(),
        qualification: z
            .string({
                invalid_type_error: 'Qualification must be a string'
            })
            .optional(),
        currentWorkingPlace: z
            .string({
                invalid_type_error:
                    'Current Working Place must be a string'
            })
            .optional(),
        designation: z
            .string({
                invalid_type_error: 'Designation must be a string'
            })
            .optional()
    })
});

const DoctorValidation = {
    createSchema,
    updateSchema
};

module.exports = DoctorValidation;
