const bcrypt = require('bcrypt');
const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const { UserRole } = require('@prisma/client');
const handelFile = require('../../helpers/handelFile.js');
const config = require('../../config/index.js');
const prisma = require('../../shared/prisma.js');

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

const UserController = {
    createAdmin,
    createDoctor,
    createPatient
};

module.exports = UserController;
