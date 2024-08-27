const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const prisma = require('../../shared/prisma.js');
const pick = require('../../shared/pick.js');
const {
    adminFilterableFields,
    adminSearchAbleFields
} = require('../../constants/admin.constant.js');
const buildQueryConditions = require('../../helpers/buildQueryConditions.js');

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

const AdminController = {
    getAdmins
};

module.exports = AdminController;
