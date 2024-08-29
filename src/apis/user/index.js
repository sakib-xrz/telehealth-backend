const { Router } = require('express');
const { upload } = require('../../helpers/handelFile.js');
const UserController = require('../../controllers/user/user.controller.js');
const AdminValidation = require('../../schemas/admin/index.js');

const router = Router();

router
    .route('/create-admin')
    .post(upload.single('file'), (req, res, next) => {
        req.body = AdminValidation.createSchema.parse(
            JSON.parse(req.body.data)
        );
        return UserController.createAdmin(req, res, next);
    });

module.exports = router;
