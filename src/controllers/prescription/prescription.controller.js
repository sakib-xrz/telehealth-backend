const catchAsync = require('../../shared/catchAsync');
const sendResponse = require('../../shared/sendResponse');

const createPrescription = catchAsync(async (req, res) => {
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Prescription created successfully',
        data: {}
    });
});

const PrescriptionController = {
    createPrescription
};

module.exports = PrescriptionController;
