const { Router } = require('express');
const AuthController = require('../../controllers/auth/auth.controller');

const router = Router();

router.route('/login').post(AuthController.login);

router.route('/refresh-token').post(AuthController.refreshToken);

router.route('/logout').post(AuthController.logout);

router.route('/forgot-password').post(AuthController.forgotPassword);

router.route('/reset-password').post(AuthController.resetPassword);

module.exports = router;
