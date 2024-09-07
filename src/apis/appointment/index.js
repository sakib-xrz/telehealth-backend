const { Router } = require('express');
const AppointmentController = require('../../controllers/appointment/appointment.controller');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');
const validateRequest = require('../../middlewares/validateRequest');
const AppointmentValidation = require('../../schemas/appointment');

const router = Router();

router
    .route('/')
    .post(
        authGuard(UserRole.PATIENT),
        validateRequest(AppointmentValidation.createSchema),
        AppointmentController.createAppointment
    );

router
    .route('/my-appointments')
    .get(
        authGuard(UserRole.PATIENT, UserRole.DOCTOR),
        AppointmentController.getMyAppointments
    );

router
    .route('/my-appointments/:appointmentId')
    .get(
        authGuard(UserRole.PATIENT, UserRole.DOCTOR),
        AppointmentController.getAppointmentById
    );

router
    .route('/:appointmentId/status')
    .patch(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR
        ),
        validateRequest(AppointmentValidation.updateStatusSchema),
        AppointmentController.updateAppointmentStatus
    );

module.exports = router;
