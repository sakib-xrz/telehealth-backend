const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const prisma = require('../../shared/prisma.js');
const pick = require('../../shared/pick.js');
const ApiError = require('../../error/ApiError.js');
const handelFile = require('../../helpers/handelFile.js');
const { UserStatus } = require('@prisma/client');
const {
    doctorFilterableFields,
    doctorSearchAbleFields
} = require('../../constants/doctor.constant.js');
const calculatePagination = require('../../helpers/calculatePagination.js');

const getDoctors = catchAsync(async (req, res) => {
    const filters = pick(req.query, doctorFilterableFields);
    const options = pick(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);

    const { limit, page, skip } = calculatePagination(options);

    const { search, specialties, ...filterData } = filters;

    const andConditions = [];

    if (search) {
        andConditions.push({
            OR: doctorSearchAbleFields.map(field => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive'
                }
            }))
        });
    }

    if (specialties) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialties: {
                        title: {
                            contains: specialties,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key]
                }
            }))
        });
    }

    andConditions.push({
        isDeleted: false
    });

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            }
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
    const doctorId = req.params.id;

    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId,
            isDeleted: false
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            }
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
    const { specialties, ...doctorData } = req.body;

    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId,
            isDeleted: false
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            }
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
            data: doctorData
        });

        if (specialties && specialties.length > 0) {
            const deletedSpecialties = specialties.filter(
                specialty => specialty?.shouldRemove
            );
            for (const specialty of deletedSpecialties) {
                await transactionClient.doctorSpecialty.deleteMany({
                    where: {
                        doctorId,
                        specialtiesId: specialty.specialtiesId
                    }
                });
            }

            const existingSpecialtyIds = doctor.doctorSpecialties.map(
                ds => ds.specialtiesId
            );

            const newSpecialties = specialties.filter(
                specialty =>
                    !specialty?.shouldRemove &&
                    !existingSpecialtyIds.includes(
                        specialty.specialtiesId
                    )
            );

            for (const specialty of newSpecialties) {
                await transactionClient.doctorSpecialty.create({
                    data: {
                        doctorId,
                        specialtiesId: specialty.specialtiesId
                    }
                });
            }
        }
    });

    const updatedDoctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            }
        }
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
