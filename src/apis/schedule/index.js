const { Router } = require('express');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');
const ScheduleController = require('../../controllers/schedule/schedule.controller');

const router = Router();

router
    .route('/')
    .get(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR
        ),
        ScheduleController.getSchedules
    )
    .post(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        ScheduleController.createSchedule
    );

router
    .route('/:id')
    .get(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR
        ),
        ScheduleController.getSchedule
    )
    .delete(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        ScheduleController.deleteSchedule
    );

module.exports = router;
