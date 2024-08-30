const bcrypt = require('bcrypt');
const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const { UserRole } = require('@prisma/client');
const handelFile = require('../../helpers/handelFile.js');
const config = require('../../config/index.js');
const prisma = require('../../shared/prisma.js');
const {
    userFilterableFields,
    userSearchAbleFields
} = require('../../constants/user.constant.js');
const pick = require('../../shared/pick.js');
const buildQueryConditions = require('../../helpers/buildQueryConditions.js');
const ApiError = require('../../error/ApiError.js');

const getAllUsers = catchAsync(async (req, res) => {
    const filters = pick(req.query, userFilterableFields);
    const options = pick(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);

    // Use the utility function to get query conditions
    const { whereConditions, page, limit, skip } =
        buildQueryConditions(filters, options, userSearchAbleFields);

    const result = await prisma.user.findMany({
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
                  },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            admin: true,
            patient: true,
            doctor: true,
            createdAt: true,
            updatedAt: true
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users data retrieved successfully',
        meta: {
            total,
            page,
            limit
        },
        data: result
    });
});

const getMyProfile = catchAsync(async (req, res) => {
    const user = req.user;

    const userInfo = await prisma.user.findUnique({
        where: {
            id: user.id,
            email: user.email,
            status: UserRole.ACTIVE
        }
    });

    if (!userInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    let profileInfo;

    switch (userInfo.role) {
        case UserRole.SUPER_ADMIN:
            profileInfo = await prisma.admin.findUnique({
                where: {
                    email: user.email
                }
            });
            break;
        case UserRole.ADMIN:
            profileInfo = await prisma.admin.findUnique({
                where: {
                    email: user.email
                }
            });
            break;
        case UserRole.DOCTOR:
            profileInfo = await prisma.doctor.findUnique({
                where: {
                    email: user.email
                }
            });
            break;
        case UserRole.PATIENT:
            profileInfo = await prisma.patient.findUnique({
                where: {
                    email: user.email
                }
            });
            break;

        default:
            break;
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile data retrieved successfully',
        data: {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            needPasswordChange: userInfo.needPasswordChange,
            status: userInfo.status,
            ...profileInfo
        }
    });
});

const createAdmin = catchAsync(async (req, res) => {
    const { name, email, password, contactNumber } = req.body;

    let profilePhoto;

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
    );

    const file = req.file;

    const userData = {
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        needPasswordChange: true
    };

    let adminData = {
        name,
        email,
        contactNumber
    };

    const result = await prisma.$transaction(
        async transactionClient => {
            const user = await transactionClient.user.create({
                data: userData
            });

            if (file) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const fileType = file.mimetype.split('/').pop();

                const cloudinaryResponse =
                    await handelFile.uploadToCloudinary(file, {
                        folder: 'user/admin',
                        filename_override: fileName,
                        format: fileType,
                        public_id: user.id,
                        overwrite: true,
                        invalidate: true
                    });

                profilePhoto = cloudinaryResponse?.secure_url;
            }

            const admin = await transactionClient.admin.create({
                data: {
                    ...adminData,
                    profilePhoto
                }
            });

            return {
                id: admin.id,
                userId: user.id,
                name: admin.name,
                email: user.email,
                contactNumber: admin.contactNumber,
                profilePhoto: admin.profilePhoto,
                role: user.role,
                status: user.status,
                needPasswordChange: user.needPasswordChange
            };
        }
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Admin Created successfully!',
        data: result
    });
});

const createDoctor = catchAsync(async (req, res) => {
    const {
        name,
        email,
        password,
        contactNumber,
        registrationNumber,
        experience,
        gender,
        appointmentFee,
        qualification
    } = req.body;

    let profilePhoto;

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
    );

    const file = req.file;

    const userData = {
        email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
        needPasswordChange: true
    };

    let doctorData = {
        name,
        email,
        contactNumber,
        address: req.body?.address,
        registrationNumber,
        experience,
        gender,
        appointmentFee,
        qualification,
        currentWorkingPlace: req.body?.currentWorkingPlace,
        designation: req.body?.designation
    };

    const result = await prisma.$transaction(
        async transactionClient => {
            const user = await transactionClient.user.create({
                data: userData
            });

            if (file) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const fileType = file.mimetype.split('/').pop();

                const cloudinaryResponse =
                    await handelFile.uploadToCloudinary(file, {
                        folder: 'user/doctor',
                        filename_override: fileName,
                        format: fileType,
                        public_id: user.id,
                        overwrite: true,
                        invalidate: true
                    });

                profilePhoto = cloudinaryResponse?.secure_url;
            }

            const doctor = await transactionClient.doctor.create({
                data: {
                    ...doctorData,
                    profilePhoto
                }
            });

            return {
                id: doctor.id,
                userId: user.id,
                name: doctor.name,
                email: user.email,
                contactNumber: doctor.contactNumber,
                profilePhoto: doctor.profilePhoto,
                role: user.role,
                status: user.status,
                needPasswordChange: user.needPasswordChange,
                address: doctor.address,
                registrationNumber: doctor.registrationNumber,
                experience: doctor.experience,
                gender: doctor.gender,
                appointmentFee: doctor.appointmentFee,
                qualification: doctor.qualification,
                currentWorkingPlace: doctor.currentWorkingPlace,
                designation: doctor.designation
            };
        }
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Doctor Created successfully!',
        data: result
    });
});

const createPatient = catchAsync(async (req, res) => {
    const { name, email, password, contactNumber } = req.body;

    let profilePhoto;

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
    );

    const file = req.file;

    const userData = {
        email,
        password: hashedPassword,
        role: UserRole.PATIENT,
        needPasswordChange: false
    };

    let patientData = {
        name,
        email,
        contactNumber,
        address: req.body?.address
    };

    const result = await prisma.$transaction(
        async transactionClient => {
            const user = await transactionClient.user.create({
                data: userData
            });

            if (file) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const fileType = file.mimetype.split('/').pop();

                const cloudinaryResponse =
                    await handelFile.uploadToCloudinary(file, {
                        folder: 'user/patient',
                        filename_override: fileName,
                        format: fileType,
                        public_id: user.id,
                        overwrite: true,
                        invalidate: true
                    });

                profilePhoto = cloudinaryResponse?.secure_url;
            }

            const patient = await transactionClient.patient.create({
                data: {
                    ...patientData,
                    profilePhoto
                }
            });

            return {
                id: patient.id,
                userId: user.id,
                name: patient.name,
                email: user.email,
                contactNumber: patient.contactNumber,
                profilePhoto: patient.profilePhoto,
                role: user.role,
                status: user.status,
                needPasswordChange: user.needPasswordChange,
                address: patient.address
            };
        }
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Patient Created successfully!',
        data: result
    });
});

const changeUserStatus = catchAsync(async (req, res) => {
    const requestedUser = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (requestedUser.id === id) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'You are not allowed to change your own status'
        );
    }

    if (requestedUser.role === UserRole.ADMIN) {
        if (user.role === UserRole.ADMIN) {
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                'Admins are not allowed to change their own status'
            );
        }
    }

    const updatedUser = await prisma.user.update({
        where: {
            id
        },
        data: {
            status
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User status updated successfully',
        data: updatedUser
    });
});

const UserController = {
    getAllUsers,
    getMyProfile,
    createAdmin,
    createDoctor,
    createPatient,
    changeUserStatus
};

module.exports = UserController;
