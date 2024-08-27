const { Router } = require('express');

const userRoutes = require('../apis/user/index.js');
const adminRoutes = require('../apis/admin/index.js');

const router = Router();

const routes = [
    {
        path: '/users',
        route: userRoutes
    },
    {
        path: '/admins',
        route: adminRoutes
    }
];

routes.forEach(route => {
    router.use(route.path, route.route);
});

module.exports = router;
