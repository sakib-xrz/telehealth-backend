const { UserStatus } = require('@prisma/client');
const { z } = require('zod');

const updateStatusSchema = z.object({
    body: z.object({
        status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED], {
            required_error:
                "Status is required and must be either 'ACTIVE' or 'BLOCKED'"
        })
    })
});

const updateProfileSchema = z.object({
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
});

const UserValidation = {
    updateStatusSchema,
    updateProfileSchema
};

module.exports = UserValidation;
