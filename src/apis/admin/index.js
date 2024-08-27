const { Router } = require('express');
const AdminController = require('../../controllers/admin/admin.controller.js');

const router = Router();

router.route('/').get(AdminController.getAdmins);

module.exports = router;
