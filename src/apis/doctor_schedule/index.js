const { Router } = require('express');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');
const DoctorScheduleController = require('../../controllers/doctor_schedule/doctor_schedule.controller');

const router = Router();

router
    .route('/')
    .post(
        authGuard(UserRole.DOCTOR),
        DoctorScheduleController.createDoctorSchedule
    );

router
    .route('/selected')
    .get(
        authGuard(UserRole.DOCTOR),
        DoctorScheduleController.getDoctorSelectedSchedule
    );

module.exports = router;
