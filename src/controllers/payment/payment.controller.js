const httpStatus = require('http-status');
const catchAsync = require('../../shared/catchAsync');
const { format } = require('date-fns');
const SSLCommerzPayment = require('sslcommerz-lts');
const config = require('../../config');
const prisma = require('../../shared/prisma');
const { PaymentStatus } = require('@prisma/client');
const ApiError = require('../../error/ApiError');
const {
    generateInvoiceHtml,
    generatePdfInvoice
} = require('../../shared/invoiceCreator');
const path = require('path');
const fs = require('fs');
const sendResponse = require('../../shared/sendResponse');
const sendMail = require('../../shared/mailer');

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

    if (!paymentInfo) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Payment data not found'
        );
    }

    const data = {
        total_amount: paymentInfo.amount,
        currency: 'BDT',
        tran_id: paymentInfo.transactionId,
        success_url: `${config.backend_base_url}/payments/ipn_listener`,
        fail_url: `${config.backend_base_url}/payments/ipn_listener`,
        cancel_url: `${config.backend_base_url}/payments/ipn_listener`,
        ipn_url: `${config.backend_base_url}/payments/ipn_listener`,
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
        data: {
            paymentURL: sslResponse.GatewayPageURL
        }
    });
});

const ipnListener = catchAsync(async (req, res) => {
    const payload = req.body;

    if (!payload.val_id || payload.status !== 'VALID') {
        console.log('Invalid IPN request');
        console.log({
            val_id: payload.val_id,
            status: payload.status
        });

        if (payload.status === 'FAILED') {
            return res.redirect(
                `${config.frontend_base_url}/${config.payment.fail_url}`
            );
        }

        if (payload.status === 'CANCELLED') {
            return res.redirect(
                `${config.frontend_base_url}/${config.payment.cancel_url}`
            );
        }

        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Invalid IPN request'
        });
    }

    const sslcz = new SSLCommerzPayment(
        store_id,
        store_passwd,
        is_live
    );

    const response = await sslcz.validate({
        val_id: payload.val_id
    });

    if (response.status !== 'VALID') {
        console.log('Payment validation failed');

        return res.redirect(
            `${config.frontend_base_url}/${config.payment.fail_url}`
        );
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

    const paymentInfo = await prisma.payment.findFirst({
        where: {
            transactionId: response.tran_id
        },
        include: {
            appointment: {
                include: {
                    schedule: true,
                    patient: true,
                    doctor: true
                }
            }
        }
    });

    const invoiceData = {
        patientName: paymentInfo.appointment.patient?.name,
        patientEmail: paymentInfo.appointment.patient.email,
        patientAddress: paymentInfo.appointment.patient?.address,
        transactionId: paymentInfo.transactionId,
        doctorName: paymentInfo.appointment.doctor?.name,
        appointmentDate: format(
            paymentInfo.appointment.schedule.startDateTime,
            'PPP'
        ),
        amount: parseFloat(paymentInfo.amount).toFixed(2)
    };

    const invoiceHtml = generateInvoiceHtml(invoiceData);

    const invoicePath = path.join(__dirname, 'invoice.pdf');

    await generatePdfInvoice(invoiceHtml, invoicePath);

    const emailBody =
        '<p>Thank you for your payment. Please find your invoice attached.</p>';

    await sendMail(
        paymentInfo.appointment.patient.email,
        'Invoice for your payment',
        emailBody,
        invoicePath
    );

    fs.unlinkSync(invoicePath);

    res.redirect(
        `${config.frontend_base_url}/${config.payment.success_url}`
    );
});

const PaymentController = {
    initiatePayment,
    ipnListener
};

module.exports = PaymentController;
