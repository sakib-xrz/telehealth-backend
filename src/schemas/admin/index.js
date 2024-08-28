const { z } = require('zod');

const updateSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        contactNumber: z.string().optional()
    })
});

const AdminValidation = {
    updateSchema
};

module.exports = AdminValidation;
