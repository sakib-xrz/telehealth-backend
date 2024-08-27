const { Prisma } = require('@prisma/client');
const httpStatus = require('http-status');

const globalErrorHandler = (err, _req, res, _next) => {
    let statusCode =
        err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || 'Something went wrong!';
    let error = err;

    // Prisma specific error handling for developers (hidden from frontend users)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint failed
                statusCode = httpStatus.CONFLICT;
                message = `It looks like the "${getUniqueField(err.meta?.target)}" you provided is already in use.`;
                error = err.meta || {}; // Log technical details for debugging
                break;
            case 'P2025': // Record not found
                statusCode = httpStatus.NOT_FOUND;
                message =
                    'The item you are trying to access no longer exists or could not be found.';
                error = err.meta || err;
                break;
            default:
                message =
                    'An error occurred while processing your request.';
                error = err.meta || err;
                break;
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        message =
            'There seems to be an issue with the data you provided.';
        error = err.message;
    }

    // Log technical details for developers
    console.error('Detailed Error:', error);

    // Send user-friendly error to frontend
    res.status(statusCode).json({
        success,
        message,
        error:
            process.env.NODE_ENV === 'production' ? undefined : error, // Hide error details in production
        stack:
            process.env.NODE_ENV === 'development'
                ? err.stack
                : undefined // Show stack trace in development
    });
};

// Helper function to dynamically extract the name of the unique field from Prisma error metadata
const getUniqueField = target => {
    if (!target) return 'field';
    if (Array.isArray(target)) return target.join(', ');
    return target;
};

module.exports = globalErrorHandler;
