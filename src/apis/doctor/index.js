const { Router } = require('express');

const validateRequest = require('../../middlewares/validateRequest.js');
const DoctorValidation = require('../../schemas/doctor/index.js');

const router = Router();

// router.route('/').get(DoctorController.getDoctors);

// router
//     .route('/:id')
//     .get(DoctorController.getDoctor)
//     .patch(
//         validateRequest(DoctorValidation.updateSchema),
//         DoctorController.updateDoctor
//     )
//     .delete(DoctorController.deleteDoctor);

// router
//     .route('/soft-delete/:id')
//     .delete(DoctorController.softDeleteDoctor);

module.exports = router;
