const { Router } = require('express');
const AuthController = require('../../controllers/auth/auth.controller');
const authGuard = require('../../middlewares/authGuard');
const { UserRole } = require('@prisma/client');

const router = Router();

router.route('/login').post(AuthController.login);

router.route('/refresh-token').post(AuthController.refreshToken);

router.route('/logout').post(AuthController.logout);

router
    .route('/change-password')
    .post(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.PATIENT
        ),
        AuthController.changePassword
    );

router.route('/forgot-password').post(AuthController.forgotPassword);

router.route('/reset-password').post(AuthController.resetPassword);

module.exports = router;
