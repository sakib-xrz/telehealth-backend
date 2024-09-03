const httpStatus = require('http-status');
const catchAsync = require('../../shared/catchAsync');
const sendResponse = require('../../shared/sendResponse');
const prisma = require('../../shared/prisma');
const {
    scheduleFilterableFields
} = require('../../constants/schedule.constant');
const calculatePagination = require('../../helpers/calculatePagination');
const pick = require('../../shared/pick');
const ApiError = require('../../error/ApiError');

const createSchedule = catchAsync(async (req, res) => {
    const { startDate, endDate, startTime, endTime } = req.body;
    const intervalTime = 30;
    const schedules = [];

    const convertedStartDate = new Date(startDate);
    const convertedEndDate = new Date(endDate);

    while (convertedStartDate <= convertedEndDate) {
        let startDateTime = new Date(convertedStartDate);
        startDateTime.setHours(
            Number(startTime.split(':')[0]),
            Number(startTime.split(':')[1])
        );

        const endDateTime = new Date(convertedStartDate);
        endDateTime.setHours(
            Number(endTime.split(':')[0]),
            Number(endTime.split(':')[1])
        );

        while (startDateTime < endDateTime) {
            const s = new Date(startDateTime);
            const e = new Date(s.getTime() + intervalTime * 60000);

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: s,
                    endDateTime: e
                }
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: { startDateTime: s, endDateTime: e }
                });
                schedules.push(result);
            }

            startDateTime = e;
        }

        convertedStartDate.setDate(convertedStartDate.getDate() + 1);
    }

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Schedule created successfully',
        data: schedules
    });
});

const getSchedules = catchAsync(async (req, res) => {
    const user = req.user;

    const doctorInfo =
        (await prisma.doctor.findUnique({
            where: {
                email: user.email
            },
            include: {
                doctorSchedules: true
            }
        })) || {};

    const filters = pick(req.query, scheduleFilterableFields);
    const options = pick(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);

    const { limit, page, skip } = calculatePagination(options);
    const { startDate, endDate } = filters;

    const andConditions = [];

    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: startDate
                    }
                },
                {
                    endDateTime: {
                        lte: endDate
                    }
                }
            ]
        });
    }

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const doctorScheduleIds =
        doctorInfo.doctorSchedules &&
        doctorInfo.doctorSchedules.length > 0
            ? doctorInfo.doctorSchedules.map(
                  schedule => schedule.scheduleId
              )
            : [];

    const result = await prisma.schedule.findMany({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        },
        select: {
            id: true,
            startDateTime: true,
            endDateTime: true
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

    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Schedules fetched successfully',
        meta: {
            total,
            page,
            limit
        },
        data: result
    });
});

const getSchedule = catchAsync(async (req, res) => {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
        where: {
            id
        },
        include: {
            doctorSchedules: true
        }
    });

    if (!schedule) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Schedule not found'
        );
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Schedule fetched successfully',
        data: schedule
    });
});

const deleteSchedule = catchAsync(async (req, res) => {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
        where: {
            id
        }
    });

    if (!schedule) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Schedule not found'
        );
    }

    const doctorSchedule = await prisma.doctorSchedules.findFirst({
        where: {
            scheduleId: id
        }
    });

    if (doctorSchedule) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Schedule is associated with a doctor and cannot be deleted'
        );
    }

    await prisma.schedule.delete({
        where: {
            id
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Schedule deleted successfully'
    });
});

const ScheduleController = {
    createSchedule,
    getSchedules,
    getSchedule,
    deleteSchedule
};

module.exports = ScheduleController;
