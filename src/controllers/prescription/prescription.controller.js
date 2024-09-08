const {
    PaymentStatus,
    AppointmentStatus
} = require('@prisma/client');
const catchAsync = require('../../shared/catchAsync');
const sendResponse = require('../../shared/sendResponse');
const ApiError = require('../../error/ApiError');
const httpStatus = require('http-status');
const {
    generatePrescriptionHtml,
    generatePdfPrescription
} = require('../../shared/prescriptionCreator');
const prisma = require('../../shared/prisma');
const path = require('path');
const fs = require('fs');
const { format } = require('date-fns');
const sendMail = require('../../shared/mailer');

const createPrescription = catchAsync(async (req, res) => {
    const user = req.user;
    const { appointmentId, medicines, tests, followUpDate } =
        req.body;

    // Fetch appointment details and check for valid status and prescription existence in one query
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            paymentStatus: PaymentStatus.PAID,
            OR: [
                { status: AppointmentStatus.COMPLETED },
                { status: AppointmentStatus.INPROGRESS }
            ],
            prescription: null
        },
        include: {
            doctor: true,
            schedule: true,
            patient: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    patientHealthData: {
                        select: {
                            dateOfBirth: true
                        }
                    }
                }
            }
        }
    });

    // Error handling if appointment is not found or conditions aren't met
    if (!appointment) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Appointment is not ready for prescription or prescription already exists'
        );
    }

    // Check if the logged-in doctor is authorized for this appointment
    if (appointment.doctor.email !== user.email) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You are not authorized to create a prescription for this appointment'
        );
    }

    // Create prescription
    const prescription = await prisma.prescription.create({
        data: {
            appointmentId: appointmentId,
            doctorId: appointment.doctor.id,
            patientId: appointment.patient.id,
            medicines: medicines || [],
            tests: tests || [],
            followUpDate: followUpDate || null
        }
    });

    // Generate prescription data for PDF
    const prescriptionData = {
        patientName: appointment.patient.name,
        patientAge: appointment.patient.patientHealthData.dateOfBirth
            ? new Date().getFullYear() -
              new Date(
                  appointment.patient.patientHealthData.dateOfBirth
              ).getFullYear()
            : 'N/A',
        appointmentDate: format(
            appointment.schedule.startDateTime,
            'PP'
        ),
        doctorName: appointment.doctor.name,
        doctorContact: appointment.doctor.contactNumber,
        medicines: medicines || [],
        tests: tests || [],
        followUpDate: followUpDate || null
    };

    // Generate prescription HTML and PDF
    const prescriptionHtml =
        generatePrescriptionHtml(prescriptionData);
    const prescriptionPath = path.join(
        __dirname,
        '../../../prescriptions/prescription.pdf'
    );
    await generatePdfPrescription(prescriptionHtml, prescriptionPath);

    // Prepare email
    const emailBody = `
        <p>Dear ${appointment.patient.name},</p>
        <p>Your prescription is ready. Please find the attached prescription.</p>
    `;
    await sendMail(
        appointment.patient.email,
        'Prescription Ready',
        emailBody,
        prescriptionPath
    );

    // Delete the temporary PDF file asynchronously
    fs.unlink(prescriptionPath, err => {
        if (err) console.error('Error deleting the PDF file:', err);
    });

    // Send response
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Prescription created successfully',
        data: { prescription }
    });
});

const PrescriptionController = {
    createPrescription
};

module.exports = PrescriptionController;
