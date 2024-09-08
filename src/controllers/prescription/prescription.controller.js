const {
    PaymentStatus,
    AppointmentStatus
} = require('@prisma/client');
const catchAsync = require('../../shared/catchAsync');
const sendResponse = require('../../shared/sendResponse');
const ApiError = require('../../error/ApiError');
const httpStatus = require('http-status');

const createPrescription = catchAsync(async (req, res) => {
    const user = req.user;

    const { appointmentId, instructions } = req.body;

    const isReadyForPrescription = await prisma.appointment.findFirst(
        {
            where: {
                id: appointmentId,
                doctorId: user.id,
                paymentStatus: PaymentStatus.PAID,
                OR: [
                    { status: AppointmentStatus.COMPLETED },
                    { status: AppointmentStatus.INPROGRESS }
                ]
            },
            include: {
                doctor: true,
                patient: true
            }
        }
    );

    if (!isReadyForPrescription) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Appointment is not ready for prescription'
        );
    }

    const isDoctorsPatient =
        isReadyForPrescription.doctorId === user.id;

    if (!isDoctorsPatient) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You are not authorized to create prescription for this appointment'
        );
    }

    const prescription = await prisma.prescription.create({
        data: {
            appointmentId,
            doctorId: isReadyForPrescription.doctorId,
            patientId: isReadyForPrescription.patientId,
            instructions,
            followUpDate: req.body?.followUpDate || null
        }
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Prescription created successfully',
        data: {
            prescription
        }
    });
});

const PrescriptionController = {
    createPrescription
};

module.exports = PrescriptionController;
