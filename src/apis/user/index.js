const { Router } = require('express');
const { upload } = require('../../helpers/handelFile.js');
const UserController = require('../../controllers/user/user.controller.js');
const AdminValidation = require('../../schemas/admin/index.js');
const DoctorValidation = require('../../schemas/doctor/index.js');
const authGuard = require('../../middlewares/authGuard.js');
const { UserRole } = require('@prisma/client');
const PatientValidation = require('../../schemas/patient/index.js');
const validateRequest = require('../../middlewares/validateRequest.js');
const UserValidation = require('../../schemas/user/index.js');

const router = Router();

router
    .route('/')
    .get(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        UserController.getAllUsers
    );

router
    .route('/me')
    .get(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.PATIENT
        ),
        UserController.getMyProfile
    );

router
    .route('/create-admin')
    .post(
        authGuard(UserRole.SUPER_ADMIN),
        upload.single('file'),
        (req, res, next) => {
            req.body = AdminValidation.createSchema.parse(
                JSON.parse(req.body.data)
            );
            return UserController.createAdmin(req, res, next);
        }
    );

router
    .route('/create-doctor')
    .post(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        upload.single('file'),
        (req, res, next) => {
            req.body = DoctorValidation.createSchema.parse(
                JSON.parse(req.body.data)
            );
            return UserController.createDoctor(req, res, next);
        }
    );

router
    .route('/create-patient')
    .post(upload.single('file'), (req, res, next) => {
        req.body = PatientValidation.createSchema.parse(
            JSON.parse(req.body.data)
        );
        return UserController.createPatient(req, res, next);
    });

router
    .route('/:id/status')
    .patch(
        authGuard(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        validateRequest(UserValidation.updateStatusSchema),
        UserController.changeUserStatus
    );

router
    .route('update-profile')
    .patch(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.PATIENT
        ),
        upload.single('file'),
        (req, res, next) => {
            req.body = UserValidation.updateProfileSchema.parse(
                JSON.parse(req.body.data)
            );
            return UserController.updateProfile(req, res, next);
        }
    );

module.exports = router;
