const jwt = require('jsonwebtoken');
const ApiError = require('../error/ApiError');
const httpStatus = require('http-status');
const config = require('../config');
const prisma = require('../shared/prisma');
const { UserRole, UserStatus } = require('@prisma/client');

const authGuard = (...requiredRoles) => {
    return async (req, _res, next) => {
        try {
            // Get token from request headers, ensuring 'Authorization' is present
            const bearerToken = req.headers.authorization;
            if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    'Invalid or missing authorization header'
                );
            }

            // Extract token from bearer token
            const token = bearerToken.split(' ')[1]; // Fix: Handle cases with extra spaces

            const secret = config.jwt.secret;

            // Verify token
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            const user = await prisma.user.findUnique({
                where: { id: decoded.id, email: decoded.email }
            });

            if (!user) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized to access this route'
                );
            }

            const isUserActive = user.status === UserStatus.ACTIVE;

            if (!isUserActive) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized to access this route'
                );
            }

            // Check if user has required roles to access route

            if (
                requiredRoles.length &&
                !requiredRoles.includes(user.role)
            ) {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    'You are not authorized to access this route'
                );
            }

            next();
        } catch (error) {
            next(error); // Pass error to error handling middleware
        }
    };
};

module.exports = authGuard;
