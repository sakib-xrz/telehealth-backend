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
const jwt = require('jsonwebtoken');

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
    const { name, email, password, contactNumber, address } =
        req.body;
    const file = req.file;

    let profilePhoto;

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
    );

    // Prepare user and patient data
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
        address
    };

    // Perform only database-related operations inside the transaction
    const result = await prisma.$transaction(
        async transactionClient => {
            // Create user in the database
            const user = await transactionClient.user.create({
                data: userData
            });

            // Create patient record in the database
            const patient = await transactionClient.patient.create({
                data: patientData
            });

            return {
                userId: user.id,
                patientId: patient.id,
                name: patient.name,
                email: user.email,
                contactNumber: patient.contactNumber,
                role: user.role,
                status: user.status,
                needPasswordChange: user.needPasswordChange,
                address: patient.address
            };
        },
        { timeout: 10000 }
    ); // Increase the timeout to 10 seconds

    // Handle profile photo upload separately, outside the transaction
    if (file) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileType = file.mimetype.split('/').pop();

        const cloudinaryResponse =
            await handelFile.uploadToCloudinary(file, {
                folder: 'user/patient',
                filename_override: fileName,
                format: fileType,
                public_id: result.userId,
                overwrite: true,
                invalidate: true
            });

        profilePhoto = cloudinaryResponse?.secure_url;

        // Update the patient record with the profile photo URL after the upload
        await prisma.patient.update({
            where: { id: result.patientId },
            data: { profilePhoto }
        });
    }

    // Generate JWT access and refresh tokens
    const payload = {
        id: result.userId,
        email: result.email,
        role: result.role
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expires_in
    });

    const refreshToken = jwt.sign(
        payload,
        config.jwt.refresh_secret,
        {
            expiresIn: config.jwt.refresh_expires_in
        }
    );

    // Set refresh token in cookies
    res.cookie('REFRESH_TOKEN', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite:
            config.node_env === 'development' ? 'Strict' : 'None'
    });

    // Send response
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Account created successfully!',
        data: {
            accessToken,
            needPasswordChange: result.needPasswordChange
        }
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

const updateProfile = catchAsync(async (req, res) => {
    const user = req.user;
    const file = req.file;

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

    if (file) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileType = file.mimetype.split('/').pop();

        const cloudinaryResponse =
            await handelFile.uploadToCloudinary(file, {
                folder: `user/${userInfo.role.toLowerCase()}`,
                filename_override: fileName,
                format: fileType,
                public_id: userInfo.id,
                overwrite: true,
                invalidate: true
            });

        req.body.profilePhoto = cloudinaryResponse?.secure_url;
    }

    const roleSpecificFields = {
        [UserRole.SUPER_ADMIN]: [
            'name',
            'profilePhoto',
            'contactNumber'
        ],
        [UserRole.ADMIN]: ['name', 'profilePhoto', 'contactNumber'],
        [UserRole.DOCTOR]: [
            'name',
            'profilePhoto',
            'contactNumber',
            'address',
            'registrationNumber',
            'experience',
            'gender',
            'appointmentFee',
            'qualification',
            'currentWorkingPlace',
            'designation'
        ],
        [UserRole.PATIENT]: [
            'name',
            'profilePhoto',
            'contactNumber',
            'address'
        ]
    };

    const allowedFields = roleSpecificFields[userInfo.role];

    // Check if there are any disallowed fields in the request body
    const invalidFields = Object.keys(req.body).filter(
        key => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Invalid fields: ${invalidFields.join(', ')} for role ${userInfo.role.toLowerCase()}`
        );
    }

    const filteredData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

    let updatedProfile;

    switch (userInfo.role) {
        case UserRole.SUPER_ADMIN:
        case UserRole.ADMIN:
            updatedProfile = await prisma.admin.update({
                where: {
                    email: user.email
                },
                data: filteredData
            });
            break;
        case UserRole.DOCTOR:
            updatedProfile = await prisma.doctor.update({
                where: {
                    email: user.email
                },
                data: filteredData
            });
            break;
        case UserRole.PATIENT:
            updatedProfile = await prisma.patient.update({
                where: {
                    email: user.email
                },
                data: filteredData
            });
            break;
        default:
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Invalid role'
            );
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
    });
});

const UserController = {
    getAllUsers,
    getMyProfile,
    createAdmin,
    createDoctor,
    createPatient,
    changeUserStatus,
    updateProfile
};

module.exports = UserController;
