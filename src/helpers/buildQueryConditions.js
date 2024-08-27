const calculatePagination = require('./calculatePagination.js');

const buildQueryConditions = (
    filters,
    options,
    searchableFields,
    extraConditions = []
) => {
    const { page, limit, skip } = calculatePagination(options);

    const { search, ...filterData } = filters;

    const andConditions = [];

    // Handle search conditions
    if (search) {
        andConditions.push({
            OR: searchableFields.map(field => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive'
                }
            }))
        });
    }

    // Handle filter conditions
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key]
                }
            }))
        });
    }

    // Merge extra conditions passed from outside the function
    andConditions.push(...extraConditions);

    const whereConditions = {
        AND: andConditions
    };

    return { whereConditions, page, limit, skip };
};

module.exports = buildQueryConditions;
