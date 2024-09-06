const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = require('./routers/index.js');
const globalErrorHandler = require('./middlewares/globalErrorHandler.js');

const app = express();

// Whitelisted IPs and Ports
const WHITELISTED_IPS = [
    '103.26.139.87',
    '103.26.139.148',
    '104.161.43.62',
    'localhost'
]; // Example IPs from SSLCommerz
const WHITELISTED_PORTS = ['80', '443', '5000', '8000']; // Ports for HTTP and HTTPS

// Middleware to whitelist IP and port
app.use((req, res, next) => {
    const clientIp = req.connection.remoteAddress.replace(/^.*:/, ''); // Extract IPv4 from IPv6 notation
    const clientPort = req.connection.remotePort.toString();

    if (
        WHITELISTED_IPS.includes(clientIp) &&
        WHITELISTED_PORTS.includes(clientPort)
    ) {
        next(); // Continue if IP and port are whitelisted
    } else {
        res.status(403).json({
            success: false,
            message:
                'Access Denied: Your IP or port is not whitelisted',
            errorMessages: [
                {
                    path: req.originalUrl,
                    message: 'Your IP or port is not allowed'
                }
            ]
        });
    }
});

// middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// routes
app.use('/api/v1', router);

// global error handler
app.use(globalErrorHandler);

// handle not found routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Not Found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'API not found'
            }
        ]
    });
    next();
});

module.exports = app;
