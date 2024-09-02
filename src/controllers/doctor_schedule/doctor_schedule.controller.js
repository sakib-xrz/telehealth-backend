const { UserStatus } = require('@prisma/client');
const catchAsync = require('../../shared/catchAsync');
const ApiError = require('../../error/ApiError');
const httpStatus = require('http-status');
const sendResponse = require('../../shared/sendResponse');
const prisma = require('../../shared/prisma');

const createDoctorSchedule = catchAsync(async (req, res) => {
    const user = req.user;

    const doctorInfo = await prisma.user.findUnique({
        where: {
            id: user.id,
            status: UserStatus.ACTIVE
        },
        include: {
            doctor: true
        }
    });

    if (!doctorInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    const { scheduleIds } = req.body;

    const doctorScheduleData = scheduleIds.map(scheduleId => {
        return {
            doctorId: doctorInfo.doctor.id,
            scheduleId
        };
    });

    const doctorSchedule = await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Doctor schedule created successfully',
        data: doctorSchedule
    });
});

const DoctorScheduleController = {
    createDoctorSchedule
};

module.exports = DoctorScheduleController;
