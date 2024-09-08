const { Router } = require('express');
const PrescriptionController = require('../../controllers/prescription/prescription.controller');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');
const validateRequest = require('../../middlewares/validateRequest');
const PrescriptionValidation = require('../../schemas/prescription');

const router = Router();

router
    .route('/')
    .post(
        authGuard(UserRole.DOCTOR),
        validateRequest(PrescriptionValidation.createPrescription),
        PrescriptionController.createPrescription
    );

module.exports = router;
