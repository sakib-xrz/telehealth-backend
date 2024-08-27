const { Router } = require('express');
const { upload } = require('../../helpers/handelFile.js');
const UserController = require('../../controllers/user/user.controller.js');

const router = Router();

router
    .route('/create-admin')
    .post(upload.single('file'), UserController.createAdmin);

module.exports = router;
