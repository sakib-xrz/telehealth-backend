const { Router } = require('express');

const router = Router();

const PaymentController = require('../../controllers/payment/payment.controller.js');
const authGuard = require('../../middlewares/authGuard.js');
const { UserRole } = require('@prisma/client');

router
    .route('/initiate-payment/:appointmentId')
    .post(
        authGuard(UserRole.PATIENT),
        PaymentController.initiatePayment
    );

router.route('/ipn_listener').get(PaymentController.ipnListener);

module.exports = router;
