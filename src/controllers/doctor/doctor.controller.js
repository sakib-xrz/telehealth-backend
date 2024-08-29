const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const prisma = require('../../shared/prisma.js');
const pick = require('../../shared/pick.js');
const buildQueryConditions = require('../../helpers/buildQueryConditions.js');
const ApiError = require('../../error/ApiError.js');
const handelFile = require('../../helpers/handelFile.js');
const { UserStatus } = require('@prisma/client');
const {
    doctorFilterableFields,
    doctorSearchAbleFields
} = require('../../constants/doctor.constant.js');

const getDoctors = catchAsync(async (req, res) => {
    const filters = pick(req.query, doctorFilterableFields);
    const options = pick(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);

    // Extra conditions, e.g., to exclude deleted records
    const extraConditions = [{ isDeleted: false }];

    // Use the utility function to get query conditions
    const { whereConditions, page, limit, skip } =
        buildQueryConditions(
            filters,
            options,
            doctorSearchAbleFields,
            extraConditions
        );

    const result = await prisma.doctor.findMany({
        where: whereConditions,
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

    const total = await prisma.doctor.count({
        where: whereConditions
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctors data retrieved successfully',
        meta: {
            total,
            page,
            limit
        },
        data: result
    });
});

const getDoctor = catchAsync(async (req, res) => {
    const doctor = await prisma.doctor.findUnique({
        where: {
            id: parseInt(req.params.id),
            isDeleted: false
        }
    });

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor data retrieved successfully',
        data: doctor
    });
});

const updateDoctor = catchAsync(async (req, res) => {
    const doctorId = req.params.id;
    const data = req.body;

    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId,
            isDeleted: false
        }
    });

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    const updatedDoctor = await prisma.doctor.update({
        where: {
            id: doctorId
        },
        data
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor updated successfully',
        data: updatedDoctor
    });
});

const deleteDoctor = catchAsync(async (req, res) => {
    const doctorId = req.params.id;

    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    await prisma.$transaction(async transactionClient => {
        await transactionClient.doctor.delete({
            where: {
                id: doctorId
            }
        });

        await transactionClient.user.delete({
            where: {
                id: doctor.user.id
            }
        });

        await handelFile.deleteFile([
            `user/doctor/${doctor.user.id}`
        ]);

        return;
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor deleted successfully'
    });
});

const softDeleteDoctor = catchAsync(async (req, res) => {
    const doctorId = req.params.id;

    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    await prisma.$transaction(async transactionClient => {
        await transactionClient.doctor.update({
            where: {
                id: doctorId
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                id: doctor.user.id
            },
            data: {
                status: UserStatus.DELETED
            }
        });

        return;
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor deleted successfully'
    });
});

const DoctorController = {
    getDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor,
    softDeleteDoctor
};

module.exports = DoctorController;
