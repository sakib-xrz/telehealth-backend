const calculatePagination = options => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (Number(page) - 1) * limit;

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    };
};

module.exports = {
    calculatePagination
};
