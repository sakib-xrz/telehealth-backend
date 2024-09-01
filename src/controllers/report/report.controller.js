const ApiError = require('../../error/ApiError');
const catchAsync = require('../../shared/catchAsync');
const prisma = require('../../shared/prisma');

const createReport = catchAsync(async (req, res) => {
    const { user, body } = req;

    const patientInfo = await prisma.patient.findUnique({
        where: {
            id: user.id
        },
        include: {
            patient: true
        }
    });

    if (!patientInfo) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    const report = await prisma.medicalReport.create({
        data: {
            ...body,
            patientId: user.patient.id
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Report created successfully',
        data: report
    });
});

const getAllReports = catchAsync(async (req, res) => {
    const { user } = req;

    const patientInfo = await prisma.patient.findUnique({
        where: {
            id: user.id
        },
        include: {
            patient: true
        }
    });

    if (!patientInfo) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    const reports = await prisma.medicalReport.findMany({
        where: {
            patientId: user.patient.id
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reports fetched successfully',
        data: reports
    });
});

const updateReport = catchAsync(async (req, res) => {
    const { user, body, params } = req;

    const patientInfo = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        include: {
            patient: true
        }
    });

    if (!patientInfo) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    const report = await prisma.medicalReport.findUnique({
        where: {
            id: params.id,
            patientId: user.patient.id
        }
    });

    if (!report) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Report not found'
        });
    }

    const updatedReport = await prisma.medicalReport.update({
        where: {
            id: report.id
        },
        data: {
            ...body
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report updated successfully',
        data: updatedReport
    });
});

const deleteReport = catchAsync(async (req, res) => {
    const { user, params } = req;

    const patientInfo = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        include: {
            patient: true
        }
    });

    if (!patientInfo) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Patient not found'
        });
    }

    const report = await prisma.medicalReport.findUnique({
        where: {
            id: params.id,
            patientId: user.patient.id
        }
    });

    if (!report) {
        throw new ApiError({
            statusCode: httpStatus.NOT_FOUND,
            message: 'Report not found'
        });
    }

    await prisma.medicalReport.delete({
        where: {
            id: report.id
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report deleted successfully'
    });
});

const ReportController = {
    createReport,
    getAllReports,
    updateReport,
    deleteReport
};

module.exports = ReportController;
