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

module.exports = router;
