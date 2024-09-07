const httpStatus = require('http-status');
const ApiError = require('../../error/ApiError');
const catchAsync = require('../../shared/catchAsync');
const prisma = require('../../shared/prisma');
const { v4: uuidv4 } = require('uuid');
const sendResponse = require('../../shared/sendResponse');
const pick = require('../../shared/pick');
const calculatePagination = require('../../helpers/calculatePagination');
const { UserRole } = require('@prisma/client');

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

            const transactionId = `TXN-${uuidv4()}`;

            await transactionClient.payment.create({
                data: {
                    appointmentId: appointment.id,
                    amount: doctor.appointmentFee,
                    transactionId
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

const getMyAppointments = catchAsync(async (req, res) => {
    const user = req.user;

    const filters = pick(req.query, ['status', 'paymentStatus']);
    const options = pick(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);

    const { limit, page, skip } = calculatePagination(options);
    const { ...filterData } = filters;

    const andConditions = [];

    if (user?.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user?.email
            }
        });
    } else if (user?.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user?.email
            }
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                return {
                    [key]: {
                        equals: filterData[key]
                    }
                };
            })
        });
    }

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const appointments = await prisma.appointment.findMany({
        where: whereConditions,
        include:
            user?.role === UserRole.PATIENT
                ? { doctor: true, schedule: true }
                : {
                      patient: {
                          include: {
                              medicalReport: true,
                              patientHealthData: true
                          }
                      },
                      schedule: true
                  },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options.sortBy]: options.sortOrder
                  }
                : {
                      createdAt: 'desc'
                  }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointments fetched successfully',
        data: appointments
    });
});

const getAppointmentById = catchAsync(async (req, res) => {
    const user = req.user;
    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
        where: {
            id: appointmentId
        },
        include:
            user?.role === UserRole.PATIENT
                ? { doctor: true, schedule: true }
                : {
                      patient: {
                          include: {
                              medicalReport: true,
                              patientHealthData: true
                          }
                      },
                      schedule: true
                  }
    });

    if (!appointment) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Appointment not found'
        );
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointment fetched successfully',
        data: appointment
    });
});

const updateAppointmentStatus = catchAsync(async (req, res) => {
    const user = req.user;

    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    });

    if (!appointment) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Appointment not found'
        );
    }

    if (
        user.role === UserRole.DOCTOR &&
        user.email !== appointment.doctor.email
    ) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You are not authorized to update this appointment'
        );
    }

    const { status } = req.body;

    const updatedAppointment = await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointment status updated successfully',
        data: updatedAppointment
    });
});

const removeAppointment = catchAsync(async (_req, _res) => {
    const currentTime = new Date();
    const thirtyMinutesBefore = new Date(
        currentTime.getTime() - 30 * 60000 // 30 minutes before
    );

    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinutesBefore
            },
            paymentStatus: PaymentStatus.UNPAID
        },
        include: {
            doctor: true,
            schedule: true
        }
    });

    const unpaidAppointmentIds = unpaidAppointments.map(
        appointment => appointment.id
    );

    await prisma.$transaction(async transactionClient => {
        await transactionClient.payment.deleteMany({
            where: {
                appointmentId: {
                    in: unpaidAppointmentIds
                }
            }
        });

        await transactionClient.appointment.deleteMany({
            where: {
                id: {
                    in: unpaidAppointmentIds
                }
            }
        });

        for (const unpaidAppointment of unpaidAppointments) {
            await transactionClient.doctorSchedules.updateMany({
                where: {
                    doctorId: unpaidAppointment.doctorId,
                    scheduleId: unpaidAppointment.scheduleId
                },
                data: {
                    isBooked: false,
                    appointmentId: null
                }
            });
        }
    });
});

const AppointmentController = {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    removeAppointment
};

module.exports = AppointmentController;
