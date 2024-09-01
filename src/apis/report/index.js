const { Router } = require('express');

const ReportController = require('../../controllers/report/report.controller.js');
const authGuard = require('../../middlewares/authGuard.js');
const { UserRole } = require('@prisma/client');

const router = Router();

router
    .route('/')
    .post(authGuard(UserRole.PATIENT), ReportController.createReport)
    .get(authGuard(UserRole.PATIENT), ReportController.getAllReports);

router
    .route('/:id')
    .patch(authGuard(UserRole.PATIENT), ReportController.updateReport)
    .delete(
        authGuard(UserRole.PATIENT),
        ReportController.deleteReport
    );

module.exports = router;
