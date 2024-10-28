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
    adminFilterableFields,
    adminSearchAbleFields
} = require('../../constants/admin.constant.js');

const getAdmins = catchAsync(async (req, res) => {
    const filters = pick(req.query, adminFilterableFields);
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
            adminSearchAbleFields,
            extraConditions
        );

    const result = await prisma.admin.findMany({
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

    const total = await prisma.admin.count({
        where: whereConditions
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admins data retrieved successfully',
        meta: {
            total,
            page,
            limit
        },
        data: result
    });
});

const getAdmin = catchAsync(async (req, res) => {
    const adminId = req.params.id;

    const result = await prisma.admin.findUnique({
        where: {
            id: adminId,
            isDeleted: false
        }
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin data retrieved successfully',
        data: result
    });
});

const updateAdmin = catchAsync(async (req, res) => {
    const adminId = req.params.id;
    const data = req.body;

    const isAdminExists = await prisma.admin.findUnique({
        where: {
            id: adminId,
            isDeleted: false
        }
    });

    if (!isAdminExists) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }

    const result = await prisma.admin.update({
        where: {
            id: adminId
        },
        data
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin data updated successfully',
        data: result
    });
});

const deleteAdmin = catchAsync(async (req, res) => {
    const adminId = req.params.id;
    const { id, role } = req.user;

    const isAdminExists = await prisma.admin.findUnique({
        where: {
            id: adminId
        },
        include: {
            user: true
        }
    });

    if (!isAdminExists) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }

    if (isAdminExists.user.id === id) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You cannot delete yourself'
        );
    }

    if (isAdminExists.user.role === role) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You cannot delete a super admin'
        );
    }

    await prisma.$transaction(async transactionClient => {
        await transactionClient.admin.delete({
            where: {
                id: adminId
            }
        });

        await transactionClient.user.delete({
            where: {
                id: isAdminExists.user.id
            }
        });

        await handelFile.deleteFromCloudinary([
            `user/admin/${isAdminExists.user.id}`
        ]);

        return;
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin deleted successfully',
        data: null
    });
});

const softDeleteAdmin = catchAsync(async (req, res) => {
    const adminId = req.params.id;

    const isAdminExists = await prisma.admin.findUnique({
        where: {
            id: adminId,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (!isAdminExists) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }

    await prisma.$transaction(async transactionClient => {
        await transactionClient.admin.update({
            where: {
                id: adminId
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                id: isAdminExists.user.id
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
        message: 'Admin deleted successfully',
        data: null
    });
});

const AdminController = {
    getAdmins,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    softDeleteAdmin
};

module.exports = AdminController;
