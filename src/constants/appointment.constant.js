const { z } = require('zod');

const createSchema = z.object({
    body: z.object({
        doctorId: z.string({
            required_error: 'DoctorId is required',
            invalid_type_error: 'DoctorId must be a string'
        }),
        scheduleId: z.string({
            required_error: 'ScheduleId is required',
            invalid_type_error: 'ScheduleId must be a string'
        })
    })
});

const AppointmentValidation = {
    createSchema
};

module.exports = AppointmentValidation;
