const { PrismaClient } = require('../../../prisma/generated/prisma');
const { ApiResponse } = require('../../utils/apiResponse');

const prisma = new PrismaClient();

const getCourses = async (req, res, next) => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: {
                title: 'asc',
            },
        });
        res.status(200).json(new ApiResponse(200, 'Courses fetched successfully', courses));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCourses,
};
