const httpStatus = require('http-status');
const { PrismaClient } = require('@prisma/client');
const { ApiResponse } = require('../../utils/apiResponse');
const { calculateRiskScore } = require('../../services/riskAnalysis.service');

const prisma = new PrismaClient();

const createStudent = async (req, res, next) => {
    try {
        const student = await prisma.student.create({
            data: req.body
        });
        res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'Student created successfully', student));
    } catch (error) {
        // Handle unique constraint violation (e.g., duplicate studentId or email)
        if (error.code === 'P2002') {
             return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, `A student with this ${error.meta.target.join(', ')} already exists.`));
        }
        next(error);
    }
};

const getStudents = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                alerts: {
                    where: { status: 'OPEN' }
                },
            }
        });
        
        const studentsWithRiskScores = students.map(student => {
            return {
                ...student,
                openAlertsCount: student.alerts.length
            }
        });

        res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Students retrieved successfully', studentsWithRiskScores));
    } catch (error) {
        next(error);
    }
};

const getStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                courses: true,
                submissions: {
                    include: {
                        assignment: {
                            include: {
                                course: true
                            }
                        }
                    },
                    orderBy: {
                        submittedAt: 'desc'
                    }
                },
                alerts: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!student) {
            return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, 'Student not found'));
        }
        
        const riskProfile = calculateRiskScore(student);

        res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Student retrieved successfully', { student, riskProfile }));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStudent,
    getStudents,
    getStudent,
};