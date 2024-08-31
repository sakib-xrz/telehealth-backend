const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const prisma = require('../../shared/prisma.js');
const ApiError = require('../../error/ApiError.js');
const handelFile = require('../../helpers/handelFile.js');

const getAllSpecialties = catchAsync(async (req, res) => {
    const { search } = req.query;

    const andConditions = [];

    if (search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        });
    }

    const whereConditions = {
        AND: andConditions
    };

    const specialties = await prisma.specialties.findMany({
        where: whereConditions
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialties fetched successfully',
        data: specialties
    });
});

const createSpecialties = catchAsync(async (req, res) => {
    const file = req.file;

    let specialties = await prisma.specialties.create({
        data: {
            title: req.body.title
        }
    });

    if (file) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileType = file.mimetype.split('/').pop();

        const cloudinaryResponse =
            await handelFile.uploadToCloudinary(file, {
                folder: 'specialties',
                filename_override: fileName,
                format: fileType,
                public_id: specialties.id,
                overwrite: true,
                invalidate: true
            });

        icon = cloudinaryResponse?.secure_url;

        specialties = await prisma.specialties.update({
            where: {
                id: specialties.id
            },
            data: {
                icon
            }
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Specialty created successfully',
        data: specialties
    });
});

const updateSpecialties = catchAsync(async (req, res) => {
    const specialtiesId = req.params.id;
    const file = req.file;

    let specialties = await prisma.specialties.findUnique({
        where: {
            id: specialtiesId
        }
    });

    if (!specialties) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Specialty not found'
        );
    }

    specialties = await prisma.specialties.update({
        where: {
            id: req.params.id
        },
        data: req.body
    });

    if (file) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileType = file.mimetype.split('/').pop();

        const cloudinaryResponse =
            await handelFile.uploadToCloudinary(file, {
                folder: 'specialties',
                filename_override: fileName,
                format: fileType,
                public_id: specialties.id,
                overwrite: true,
                invalidate: true
            });

        icon = cloudinaryResponse?.secure_url;

        specialties = await prisma.specialties.update({
            where: {
                id: specialties.id
            },
            data: {
                icon
            }
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialty updated successfully',
        data: specialties
    });
});

const SpecialtiesController = {
    getAllSpecialties,
    createSpecialties,
    updateSpecialties
};

module.exports = SpecialtiesController;
