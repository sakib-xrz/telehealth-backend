const { Router } = require('express');
const AdminController = require('../../controllers/admin/admin.controller.js');

const AdminValidation = require('../../schemas/admin/index.js');
const validateRequest = require('../../middlewares/validateRequest.js');

const router = Router();

router.route('/').get(AdminController.getAdmins);

router
    .route('/:id')
    .get(AdminController.getAdmin)
    .patch(
        validateRequest(AdminValidation.updateSchema),
        AdminController.updateAdmin
    )
    .delete(AdminController.deleteAdmin);

router
    .route('/soft-delete/:id')
    .delete(AdminController.softDeleteAdmin);

module.exports = router;
