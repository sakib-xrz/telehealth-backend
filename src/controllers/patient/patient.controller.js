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
    patientFilterableFields,
    patientSearchAbleFields
} = require('../../constants/patient.constant.js');

const getPatients = catchAsync(async (req, res) => {
    const filters = pick(req.query, patientFilterableFields);
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
            patientSearchAbleFields,
            extraConditions
        );

    const result = await prisma.patient.findMany({
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

    const total = await prisma.patient.count({
        where: whereConditions
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patients data retrieved successfully',
        meta: {
            total,
            page,
            limit
        },
        data: result
    });
});

const getPatient = catchAsync(async (req, res) => {
    const patientId = req.params.id;

    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
            isDeleted: false
        }
    });

    if (!patient) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient data retrieved successfully',
        data: patient
    });
});

const updatePatient = catchAsync(async (req, res) => {
    const patientId = req.params.id;
    const data = req.body;

    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
            isDeleted: false
        }
    });

    if (!patient) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    const updatedPatient = await prisma.patient.update({
        where: {
            id: patientId
        },
        data
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient data updated successfully',
        data: updatedPatient
    });
});

const deletePatient = catchAsync(async (req, res) => {
    const patientId = req.params.id;

    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (!patient) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    await prisma.$transaction(async transactionClient => {
        await transactionClient.patient.delete({
            where: {
                id: patientId
            }
        });

        await transactionClient.user.update({
            where: {
                id: patient.user.id
            }
        });

        await handelFile.deleteFile([
            `user/patient/${patient.user.id}`
        ]);

        return;
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient deleted successfully'
    });
});

const softDeletePatient = catchAsync(async (req, res) => {
    const patientId = req.params.id;

    const patient = await prisma.patient.findUnique({
        where: {
            id: patientId,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (!patient) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    await prisma.$transaction(async transactionClient => {
        await transactionClient.patient.update({
            where: {
                id: patientId
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                id: patient.user.id
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
        message: 'Patient deleted successfully'
    });
});

const PatientController = {
    getPatients,
    getPatient,
    updatePatient,
    deletePatient,
    softDeletePatient
};

module.exports = PatientController;
