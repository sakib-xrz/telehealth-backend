const { Router } = require('express');

const userRoutes = require('../apis/user/index.js');
const adminRoutes = require('../apis/admin/index.js');
const authRoutes = require('../apis/auth/index.js');
const doctorsRoutes = require('../apis/doctor/index.js');
const patientsRoutes = require('../apis/patient/index.js');
const specialtiesRoutes = require('../apis/specialties/index.js');
const reportRoutes = require('../apis/report/index.js');
const scheduleRoutes = require('../apis/schedule/index.js');
const doctorScheduleRoutes = require('../apis/doctor_schedule/index.js');
const appointmentRoutes = require('../apis/appointment/index.js');
const paymentRoutes = require('../apis/payment/index.js');
const prescriptionRoutes = require('../apis/prescription/index.js');

const router = Router();

const routes = [
    {
        path: '/users',
        route: userRoutes
    },
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/admins',
        route: adminRoutes
    },
    {
        path: '/doctors',
        route: doctorsRoutes
    },
    {
        path: '/patients',
        route: patientsRoutes
    },
    {
        path: '/specialties',
        route: specialtiesRoutes
    },
    {
        path: '/reports',
        route: reportRoutes
    },
    {
        path: '/schedules',
        route: scheduleRoutes
    },
    {
        path: '/doctor-schedules',
        route: doctorScheduleRoutes
    },
    {
        path: '/appointments',
        route: appointmentRoutes
    },
    {
        path: '/payments',
        route: paymentRoutes
    },
    {
        path: '/prescriptions',
        route: prescriptionRoutes
    }
];

routes.forEach(route => {
    router.use(route.path, route.route);
});

module.exports = router;
