const { Router } = require('express');

const ReportController = require('../../controllers/report/report.controller.js');
const authGuard = require('../../middlewares/authGuard.js');
const { UserRole } = require('@prisma/client');
const validateRequest = require('../../middlewares/validateRequest.js');
const ReportSchema = require('../../schemas/report/index.js');

const router = Router();

router
    .route('/')
    .post(
        authGuard(UserRole.PATIENT),
        validateRequest(ReportSchema.createSchema),
        ReportController.createReport
    )
    .get(authGuard(UserRole.PATIENT), ReportController.getAllReports);

router
    .route('/:id')
    .patch(
        authGuard(UserRole.PATIENT),
        validateRequest(ReportSchema.updateSchema),
        ReportController.updateReport
    )
    .delete(
        authGuard(UserRole.PATIENT),
        ReportController.deleteReport
    );

module.exports = router;
