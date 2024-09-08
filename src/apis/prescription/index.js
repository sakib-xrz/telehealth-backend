const { Router } = require('express');
const PrescriptionController = require('../../controllers/prescription/prescription.controller');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');

const router = Router();

router
    .route('/')
    .post(
        authGuard(UserRole.DOCTOR),
        PrescriptionController.createPrescription
    );

module.exports = router;
