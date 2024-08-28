const config = require('../../config/index.js');
const prisma = require('../../shared/prisma.js');
const bcrypt = require('bcrypt');
const catchAsync = require('../../shared/catchAsync.js');
const sendResponse = require('../../shared/sendResponse.js');
const httpStatus = require('http-status');
const { UserStatus, UserRole } = require('@prisma/client');
const ApiError = require('../../error/ApiError.js');
const jwt = require('jsonwebtoken');
const sendMail = require('../../shared/mailer.js');

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const isUserExists = await prisma.user.findUnique({
        where: {
            email,
            status: UserStatus.ACTIVE
        }
    });

    if (!isUserExists) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        isUserExists.password
    );

    if (!isPasswordMatched) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'Invalid email or password'
        );
    }

    const accessToken = jwt.sign(
        {
            id: isUserExists.id,
            email: isUserExists.email,
            role: isUserExists.role
        },
        config.jwt.secret,
        {
            expiresIn: config.jwt.expires_in
        }
    );

    const refreshToken = jwt.sign(
        {
            id: isUserExists.id,
            email: isUserExists.email,
            role: isUserExists.role
        },
        config.jwt.refresh_secret,
        {
            expiresIn: config.jwt.refresh_expires_in
        }
    );

    res.cookie('refreshToken', refreshToken, {
        secure: false,
        httpOnly: true
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Login successful',
        data: {
            accessToken,
            needPasswordChange: isUserExists.needPasswordChange
        }
    });
});

const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Refresh token is required'
        );
    }

    let payload = null;

    try {
        payload = jwt.verify(refreshToken, config.jwt.refresh_secret);
    } catch (error) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized'
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        config.jwt.secret,
        {
            expiresIn: config.jwt.expires_in
        }
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
            accessToken,
            needPasswordChange: user.needPasswordChange
        }
    });
});

const changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { email } = req.user;

    const user = await prisma.user.findUnique({
        where: {
            email,
            status: UserStatus.ACTIVE
        }
    });

    const isPasswordMatched = await bcrypt.compare(
        oldPassword,
        user.password
    );

    if (!isPasswordMatched) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'Password is incorrect'
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds)
    );

    await prisma.user.update({
        where: {
            email
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password changed successfully'
    });
});

const logout = catchAsync(async (_req, res) => {
    res.clearCookie('refreshToken');

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Logout successful'
    });
});

const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email,
            status: UserStatus.ACTIVE
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const resetPasswordToken = jwt.sign(
        {
            email: user.email,
            role: user.role
        },
        config.jwt.reset_password_secret,
        {
            expiresIn: config.jwt.reset_password_expires_in
        }
    );

    const resetPassLink =
        config.reset_pass_link +
        `?userId=${user.id}&token=${resetPasswordToken}`;

    const mailBody = `<!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Password Reset</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f7f7f7;
                                    margin: 0;
                                    padding: 0;
                                }

                                .email-container {
                                    max-width: 600px;
                                    margin: 40px auto;
                                    background-color: #ffffff !important;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
                                    overflow: hidden;
                                    border: 1px solid #f2f2f2 !important;
                                }

                                .email-header {
                                    background-color: #4a90e2;
                                    color: #ffffff;
                                    text-align: center;
                                    padding: 20px;
                                    font-size: 24px;
                                    font-weight: bold;
                                }

                                .email-body {
                                    padding: 30px;
                                    color: #333333;
                                    line-height: 1.6;
                                }

                                .email-body p {
                                    margin: 0 0 16px;
                                }

                                .reset-button {
                                    display: block;
                                    width: 200px;
                                    margin: 20px auto;
                                    padding: 12px 0;
                                    background-color: #4a90e2;
                                    color: #ffffff !important;
                                    text-align: center;
                                    text-decoration: none;
                                    border-radius: 33px;
                                    font-size: 18px;
                                    font-weight: bold;
                                }

                                .reset-button:hover {
                                    background-color: #357ABD;
                                }

                                .email-footer {
                                    text-align: center;
                                    padding: 20px;
                                    background-color: #f2f2f2;
                                    color: #888888;
                                    font-size: 14px;
                                }

                                .email-footer a {
                                    color: #4a90e2;
                                    text-decoration: none;
                                }

                                .email-footer a:hover {
                                    text-decoration: underline;
                                }
                            </style>
                        </head>

                        <body>
                            <div class="email-container">
                                <div class="email-header">
                                    Password Reset
                                </div>
                                <div class="email-body">
                                    <p>Hi,</p>
                                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                                    <a href=${resetPassLink} class="reset-button">Reset Password</a>
                                    <p>If you didn’t request a password reset, you can ignore this email. Your password won’t change until you access the link above and create a new one.</p>
                                    <p>Thank you!</p>
                                </div>
                                <div class="email-footer">
                                    <p>If you have any questions, feel free to <a href="mailto:sakibxrz21@example.com">contact our support team</a>.</p>
                                </div>
                            </div>
                        </body>

                        </html>`;

    await sendMail(user.email, 'Telehealth Password Reset', mailBody);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password reset link sent to your email'
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const { userId, newPassword } = req.body;
    const token = req.headers?.authorization || '';

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
            status: UserStatus.ACTIVE
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const payload = jwt.verify(
        token,
        config.jwt.reset_password_secret
    );

    if (payload.email !== user.email) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized'
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds)
    );

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password reset successful'
    });
});

const AuthController = {
    login,
    refreshToken,
    changePassword,
    logout,
    forgotPassword,
    resetPassword
};

module.exports = AuthController;
