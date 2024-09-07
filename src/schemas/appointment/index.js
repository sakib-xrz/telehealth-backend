const { AppointmentStatus } = require('@prisma/client');
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

const updateStatusSchema = z.object({
    body: z.object({
        status: z.enum(
            [
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.INPROGRESS,
                AppointmentStatus.COMPLETED,
                AppointmentStatus.CANCELED
            ],
            {
                message:
                    "Appointment status must be one of 'SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELED'"
            }
        )
    })
});

const AppointmentValidation = {
    createSchema,
    updateStatusSchema
};

module.exports = AppointmentValidation;
