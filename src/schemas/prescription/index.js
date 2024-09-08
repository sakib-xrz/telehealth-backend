const { z } = require('zod');

const createSchema = z.object({
    body: z.object({
        appointmentId: z.string({
            required_error: 'Appointment ID is required',
            invalid_type_error: 'Appointment ID must be a string'
        }),
        instructions: z.string({
            required_error: 'Instructions are required',
            invalid_type_error: 'Instructions must be a string'
        }),
        followUpDate: z.string().datetime().optional()
    })
});

const updateSchema = z.object({
    body: z.object({
        instructions: z
            .string({
                invalid_type_error: 'Instructions must be a string'
            })
            .optional(),
        followUpDate: z.string().datetime().optional()
    })
});

const PrescriptionValidation = {
    createPrescription: createSchema,
    updatePrescription: updateSchema
};

module.exports = PrescriptionValidation;
