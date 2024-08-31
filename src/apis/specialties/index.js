const { Router } = require('express');

const specialtiesController = require('../../controllers/specialties/specialties.controller.js');
const SpecialtiesValidation = require('../../schemas/specialties/index.js');
const authGuard = require('../../middlewares/authGuard.js');
const { upload } = require('../../helpers/handelFile.js');
const { UserRole } = require('@prisma/client');

const router = Router();

router
    .route('/')
    .post(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR
        ),
        upload.single('file'),
        (req, res, next) => {
            req.body = SpecialtiesValidation.createSchema.parse(
                JSON.parse(req.body.data)
            );
            return specialtiesController.createSpecialties(
                req,
                res,
                next
            );
        }
    )
    .get(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.PATIENT
        ),
        specialtiesController.getAllSpecialties
    );

router
    .route('/:id')
    .patch(
        authGuard(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.DOCTOR
        ),
        upload.single('file'),
        (req, res, next) => {
            req.body = SpecialtiesValidation.updateSchema.parse(
                JSON.parse(req.body?.data || '{}')
            );
            return specialtiesController.updateSpecialties(
                req,
                res,
                next
            );
        }
    );

module.exports = router;
