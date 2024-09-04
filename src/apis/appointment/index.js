const { Router } = require('express');
const AppointmentController = require('../../controllers/appointment/appointment.controller');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');

const router = Router();

router
    .route('/')
    .post(
        authGuard(UserRole.PATIENT),
        AppointmentController.createAppointment
    );

module.exports = router;
