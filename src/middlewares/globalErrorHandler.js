const { Prisma } = require('@prisma/client');
const httpStatus = require('http-status');

const globalErrorHandler = (err, _req, res, _next) => {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = 'An unexpected error occurred.';
    let errorDetails = err;

    // Prisma specific error handling for developers (hidden from frontend users)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint failed
                statusCode = httpStatus.CONFLICT;
                message = `It looks like the "${getUniqueField(err.meta?.target)}" you provided is already in use.`;
                errorDetails = err.meta || {}; // Log technical details for debugging
                break;
            case 'P2025': // Record not found
                statusCode = httpStatus.NOT_FOUND;
                message =
                    'The item you are trying to access no longer exists or could not be found.';
                errorDetails = err.meta || err;
                break;
            default:
                message =
                    'An error occurred while processing your request.';
                errorDetails = err.meta || err;
                break;
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        message =
            'There seems to be an issue with the data you provided.';
        errorDetails = err.message;
    } else if (
        err instanceof Prisma.PrismaClientInitializationError
    ) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = 'The service is currently unavailable.';
        errorDetails = err.message;
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = 'An unexpected system error occurred.';
        errorDetails = err.message;
    } else if (
        err instanceof Prisma.PrismaClientUnknownRequestError
    ) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message =
            'An unknown error occurred while processing your request.';
        errorDetails = err.message;
    }

    // Log technical details for developers
    console.error('Detailed Error:', errorDetails);

    // Send user-friendly error to frontend
    res.status(statusCode).json({
        success,
        message,
        error:
            process.env.NODE_ENV === 'production'
                ? undefined
                : errorDetails, // Hide error details in production
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
