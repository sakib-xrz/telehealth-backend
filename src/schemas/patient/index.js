const { Gender, MaritalStatus } = require('@prisma/client');
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
        address: z.string().optional(),
        patientHealthData: z
            .object({
                gender: z
                    .enum([Gender.MALE, Gender.FEMALE])
                    .optional(),
                dateOfBirth: z.string().optional(),
                bloodGroup: z.string().optional(),
                hasAllergies: z.boolean().optional(),
                hasDiabetes: z.boolean().optional(),
                height: z.string().optional(),
                weight: z.string().optional(),
                smokingStatus: z.boolean().optional(),
                dietaryPreferences: z.string().optional(),
                pregnancyStatus: z.boolean().optional(),
                mentalHealthHistory: z.string().optional(),
                immunizationStatus: z.string().optional(),
                hasPastSurgeries: z.boolean().optional(),
                recentAnxiety: z.boolean().optional(),
                recentDepression: z.boolean().optional(),
                maritalStatus: z
                    .enum([
                        MaritalStatus.MARRIED,
                        MaritalStatus.UNMARRIED
                    ])
                    .optional()
            })
            .optional()
    })
});

const PatientValidation = {
    createSchema,
    updateSchema
};

module.exports = PatientValidation;
