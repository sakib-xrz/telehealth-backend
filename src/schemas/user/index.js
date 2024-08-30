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

const UserValidation = {
    updateStatusSchema
};

module.exports = UserValidation;
