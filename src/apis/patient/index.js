const { Router } = require('express');

const validateRequest = require('../../middlewares/validateRequest.js');
const { UserRole } = require('@prisma/client');
const authGuard = require('../../middlewares/authGuard.js');
const PatientController = require('../../controllers/patient/patient.controller.js');
const PatientValidation = require('../../schemas/patient/index.js');

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
        PatientController.getPatients
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
        PatientController.getPatient
    )
    .patch(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.PATIENT
        ),
        validateRequest(PatientValidation.updateSchema),
        PatientController.updatePatient
    )
    .delete(
        authGuard(UserRole.SUPER_ADMIN),
        PatientController.deletePatient
    );

router
    .route('/soft-delete/:id')
    .delete(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        PatientController.softDeletePatient
    );

module.exports = router;
