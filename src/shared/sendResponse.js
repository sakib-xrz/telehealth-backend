const sendResponse = (res, jsonData) => {
    res.status(jsonData.statusCode).json({
        success: jsonData.success,
        message: jsonData.message,
        meta: jsonData.meta || null,
        data: jsonData.data || null
    });
};

module.exports = sendResponse;
