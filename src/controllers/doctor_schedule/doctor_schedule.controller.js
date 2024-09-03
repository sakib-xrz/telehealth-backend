const { UserStatus } = require('@prisma/client');
const catchAsync = require('../../shared/catchAsync');
const ApiError = require('../../error/ApiError');
const httpStatus = require('http-status');
const sendResponse = require('../../shared/sendResponse');
const prisma = require('../../shared/prisma');
const {
    doctorScheduleFilterableFields
} = require('../../constants/doctor_schedule.constant');
const pick = require('../../shared/pick');
const calculatePagination = require('../../helpers/calculatePagination');

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

const getDoctorSelectedSchedule = catchAsync(async (req, res) => {
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

    const filters = pick(req.query, doctorScheduleFilterableFields);
    const options = pick(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);

    const { limit, page, skip } = calculatePagination(options);
    const { startDate, endDate, ...filterData } = filters;

    const andConditions = [];

    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    schedule: {
                        startDateTime: {
                            gte: startDate
                        }
                    }
                },
                {
                    schedule: {
                        endDateTime: {
                            lte: endDate
                        }
                    }
                }
            ]
        });
    }

    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string') {
            if (filterData.isBooked === 'false') {
                filterData.isBooked = false;
            } else if (filterData.isBooked === 'true') {
                filterData.isBooked = true;
            }
        }

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

    andConditions.push({
        doctorId: doctorInfo.doctor.id
    });

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctorSchedules.findMany({
        where: whereConditions,
        include: {
            schedule: {
                select: {
                    id: true,
                    startDateTime: true,
                    endDateTime: true
                }
            }
        },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {}
    });

    const total = await prisma.doctorSchedules.count({
        where: whereConditions
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor schedule fetched successfully',
        meta: {
            limit,
            page,
            total
        },
        data: result
    });
});

const DoctorScheduleController = {
    createDoctorSchedule,
    getDoctorSelectedSchedule
};

module.exports = DoctorScheduleController;
