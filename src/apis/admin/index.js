const { Router } = require('express');
const AdminController = require('../../controllers/admin/admin.controller.js');

const AdminValidation = require('../../schemas/admin/index.js');
const validateRequest = require('../../middlewares/validateRequest.js');
const authGuard = require('../../middlewares/authGuard.js');
const { UserRole } = require('@prisma/client');

const router = Router();

router
    .route('/')
    .get(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        AdminController.getAdmins
    );

router
    .route('/:id')
    .get(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        AdminController.getAdmin
    )
    .patch(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        validateRequest(AdminValidation.updateSchema),
        AdminController.updateAdmin
    )
    .delete(
        authGuard(UserRole.SUPER_ADMIN),
        AdminController.deleteAdmin
    );

router
    .route('/soft-delete/:id')
    .delete(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        AdminController.softDeleteAdmin
    );

module.exports = router;
