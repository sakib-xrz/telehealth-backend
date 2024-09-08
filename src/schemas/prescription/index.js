const { z } = require('zod');

const PrescriptionValidation = {
    createPrescription: z.object({
        body: z.object({
            appointmentId: z.string({
                required_error: 'Appointment ID is required',
                invalid_type_error: 'Appointment ID must be a string'
            }),
            medicines: z.array(
                z.object({
                    medicine: z.string({
                        required_error: 'Medicine name is required',
                        invalid_type_error:
                            'Medicine must be a string'
                    }),
                    dosage: z
                        .string({
                            invalid_type_error:
                                'Dosage must be a string'
                        })
                        .optional(),
                    instructions: z
                        .string({
                            invalid_type_error:
                                'Instructions must be a string'
                        })
                        .optional()
                })
            ),
            tests: z.array(
                z.object({
                    test: z.string({
                        required_error: 'Test name is required',
                        invalid_type_error: 'Test must be a string'
                    }),
                    instructions: z
                        .string({
                            invalid_type_error:
                                'Test instructions must be a string'
                        })
                        .optional()
                })
            )
        })
    }),

    updatePrescription: z.object({
        body: z.object({
            appointmentId: z.string().optional(),
            medicines: z
                .array(
                    z.object({
                        medicine: z.string().optional(),
                        dosage: z.string().optional(),
                        instructions: z.string().optional()
                    })
                )
                .optional(),
            tests: z
                .array(
                    z.object({
                        test: z.string().optional(),
                        instructions: z.string().optional()
                    })
                )
                .optional()
        })
    })
};

module.exports = PrescriptionValidation;
