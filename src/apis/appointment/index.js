const { Router } = require('express');
const AppointmentController = require('../../controllers/appointment/appointment.controller');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');
const validateRequest = require('../../middlewares/validateRequest');
const AppointmentValidation = require('../../constants/appointment.constant');

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

module.exports = router;
