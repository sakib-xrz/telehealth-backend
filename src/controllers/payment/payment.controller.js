const httpStatus = require('http-status');
const catchAsync = require('../../shared/catchAsync');
const sendResponse = require('../../shared/sendResponse');
const SSLCommerzPayment = require('sslcommerz-lts');
const config = require('../../config');
const prisma = require('../../shared/prisma');

const store_id = config.ssl.store_id;
const store_passwd = config.ssl.store_pass;
const is_live = false;

const initiatePayment = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const paymentInfo = await prisma.payment.findFirst({
        where: {
            appointmentId: appointmentId
        },
        include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    });

    const data = {
        total_amount: paymentInfo.amount,
        currency: 'BDT',
        tran_id: paymentInfo.transactionId,
        success_url: `${config.frontend_base_url}/${config.payment.success_url}`,
        fail_url: `${config.frontend_base_url}/${config.payment.fail_url}`,
        cancel_url: `${config.frontend_base_url}/${config.payment.cancel_url}`,
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'N/A',
        product_name: 'Appointment',
        product_category: 'N/A',
        product_profile: 'N/A',
        cus_name: paymentInfo.appointment.patient.name,
        cus_email: paymentInfo.appointment.patient.email,
        cus_add1: paymentInfo.appointment.patient.address,
        cus_add2: 'N/A',
        cus_city: 'N/A',
        cus_state: 'N/A',
        cus_postcode: 'N/A',
        cus_country: 'N/A',
        cus_phone: paymentInfo.appointment.patient.contactNumber,
        cus_fax: 'N/A',
        ship_name: 'N/A',
        ship_add1: 'N/A',
        ship_add2: 'N/A',
        ship_city: 'N/A',
        ship_state: 'N/A',
        ship_postcode: 'N/A',
        ship_country: 'N/A'
    };

    const sslcz = new SSLCommerzPayment(
        store_id,
        store_passwd,
        is_live
    );
    const sslResponse = await sslcz.init(data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment initiated successfully',
        data: { paymentUrl: sslResponse.GatewayPageURL }
    });
});

const ipnListener = catchAsync(async (req, _res) => {
    const payload = req.params;

    if (!payload.val_id || !payload.status === 'VALID') {
        console.log('Invalid IPN request');

        return {
            message: 'Invalid IPN request'
        };
    }

    const sslcz = new SSLCommerzPayment(
        store_id,
        store_passwd,
        is_live
    );

    const response = sslcz.validate({
        val_id: payload.val_id
    });

    if (response.status !== 'VALID') {
        console.log('Payment validation failed');
        return {
            message: 'Payment validation failed'
        };
    }

    await prisma.$transaction(async transactionClient => {
        const updatedPaymentData =
            await transactionClient.payment.update({
                where: {
                    transactionId: response.tran_id
                },
                data: {
                    status: PaymentStatus.PAID,
                    paymentGatewayData: response
                }
            });

        await transactionClient.appointment.update({
            where: {
                id: updatedPaymentData.appointmentId
            },
            data: {
                paymentStatus: PaymentStatus.PAID
            }
        });
    });

    return {
        message: 'Payment successful'
    };
});

const PaymentController = {
    initiatePayment,
    ipnListener
};

module.exports = PaymentController;
