const { z } = require('zod');

const createSchema = z.object({
    body: z.object({
        reportName: z.string({
            required_error: 'Report name is required',
            invalid_type_error: 'Report name must be a string'
        }),
        reportLink: z.string({
            required_error: 'Report link is required',
            invalid_type_error: 'Report link must be a string'
        })
    })
});

const updateSchema = z.object({
    body: z.object({
        reportName: z
            .string({
                invalid_type_error: 'Report name must be a string'
            })
            .optional(),
        reportLink: z
            .string({
                invalid_type_error: 'Report link must be a string'
            })
            .optional()
    })
});

const ReportSchema = {
    createSchema,
    updateSchema
};

module.exports = ReportSchema;
