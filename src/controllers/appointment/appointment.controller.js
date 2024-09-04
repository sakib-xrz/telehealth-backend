const httpStatus = require('http-status');
const ApiError = require('../../error/ApiError');
const catchAsync = require('../../shared/catchAsync');
const prisma = require('../../shared/prisma');
const { v4: uuidv4 } = require('uuid');
const sendResponse = require('../../shared/sendResponse');

const createAppointment = catchAsync(async (req, res) => {
    const user = req.user;
    const { doctorId, scheduleId } = req.body;

    const userInfo = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        include: {
            patient: true
        }
    });

    if (!userInfo.patient) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'User is not a patient'
        );
    }

    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId
        }
    });

    if (!doctor) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Doctor not found'
        );
    }

    const schedule = await prisma.doctorSchedules.findFirst({
        where: {
            doctorId: doctorId,
            scheduleId: scheduleId,
            isBooked: false
        }
    });

    if (!schedule) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Schedule not found'
        );
    }

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(
        async transactionClient => {
            const appointment =
                await transactionClient.appointment.create({
                    data: {
                        patientId: userInfo.patient.id,
                        doctorId: doctorId,
                        scheduleId: scheduleId,
                        videoCallingId
                    }
                });

            await transactionClient.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: doctorId,
                        scheduleId: scheduleId
                    }
                },
                data: {
                    isBooked: true,
                    appointmentId: appointment.id
                }
            });

            return appointment;
        }
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Appointment created successfully',
        data: result
    });
});

const AppointmentController = {
    createAppointment
};

module.exports = AppointmentController;
