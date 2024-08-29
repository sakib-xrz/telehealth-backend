const { Router } = require('express');

const validateRequest = require('../../middlewares/validateRequest.js');
const DoctorValidation = require('../../schemas/doctor/index.js');
const DoctorController = require('../../controllers/doctor/doctor.controller.js');
const { UserRole } = require('@prisma/client');
const authGuard = require('../../middlewares/authGuard.js');

const router = Router();

router
    .route('/')
    .get(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.PATIENT
        ),
        DoctorController.getDoctors
    );

router
    .route('/:id')
    .get(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.PATIENT
        ),
        DoctorController.getDoctor
    )
    .patch(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR
        ),
        validateRequest(DoctorValidation.updateSchema),
        DoctorController.updateDoctor
    )
    .delete(
        authGuard(UserRole.SUPER_ADMIN),
        DoctorController.deleteDoctor
    );

router
    .route('/soft-delete/:id')
    .delete(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        DoctorController.softDeleteDoctor
    );

module.exports = router;
