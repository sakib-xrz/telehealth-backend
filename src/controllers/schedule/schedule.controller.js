const httpStatus = require('http-status');
const catchAsync = require('../../shared/catchAsync');
const sendResponse = require('../../shared/sendResponse');
const prisma = require('../../shared/prisma');

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

const ScheduleController = {
    createSchedule
};

module.exports = ScheduleController;
