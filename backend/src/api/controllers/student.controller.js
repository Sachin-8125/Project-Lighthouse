const httpStatus = require('http-status');
const { PrismaClient } = require('../../../prisma/generated/prisma');
const { ApiResponse } = require('../../utils/apiResponse');
const { calculateRiskScore } = require('../../services/riskAnalysis.service');

const prisma = new PrismaClient();

const createStudent = async (req, res, next) => {
    try {
        const student = await prisma.student.create({
            data: req.body
        });
        res.status(201).json(new ApiResponse(201, 'Student created successfully', student));
    } catch (error) {
        // Handle unique constraint violation (e.g., duplicate studentId or email)
        if (error.code === 'P2002') {
             return res.status(400).json(new ApiResponse(400, `A student with this ${error.meta.target.join(', ')} already exists.`));
        }
        next(error);
    }
};

const getStudents = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                alerts: true,
            }
        });
        
        const studentsWithDerived = students.map(student => {
            const openAlerts = (student.alerts || []).filter(a => a.status === 'OPEN').length;
            return {
                ...student,
                openAlerts,
                riskLevel: student.riskLevel || 'Low',
                riskScore: typeof student.riskScore === 'number' ? student.riskScore : 0,
            }
        });

        res.status(200).json(new ApiResponse(200, 'Students retrieved successfully', studentsWithDerived));
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
                    }
                },
                alerts: true
            }
        });

        if (!student) {
            return res.status(404).json(new ApiResponse(404, 'Student not found'));
        }
        
        const riskStats = calculateRiskScore(student);

        const gradedSubmissions = (student.submissions || []).filter(
            (s) => s.grade !== null && s.assignment && typeof s.assignment.maxScore === 'number'
        );
        let averageGrade = 0;
        if (gradedSubmissions.length > 0) {
            const totalPct = gradedSubmissions.reduce((acc, s) => acc + (s.grade / s.assignment.maxScore), 0);
            averageGrade = Math.round((totalPct / gradedSubmissions.length) * 100);
        }
        const lateSubmissions = (student.submissions || []).filter((s) => {
            const due = s.assignment?.dueDate ? new Date(s.assignment.dueDate) : null;
            const submitted = s.submittedAt ? new Date(s.submittedAt) : null;
            return due && submitted && submitted > due;
        }).length;
        const missingAssignments = 0;

        let riskLevel = 'Low';
        if (riskStats.score >= 0.7) riskLevel = 'High';
        else if (riskStats.score >= 0.4) riskLevel = 'Medium';

        const enriched = {
            ...student,
            riskProfile: {
                riskLevel,
                riskScore: riskStats.score,
                averageGrade,
                lateSubmissions,
                missingAssignments,
            },
        };

        res.status(200).json(new ApiResponse(200, 'Student retrieved successfully', enriched));
    } catch (error) {
        next(error);
    }
};

const addScore = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { assignmentId, courseId, courseCode, title, dueDate, maxScore, submittedAt, grade } = req.body;

        // Ensure the student exists
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json(new ApiResponse(404, 'Student not found'));
        }

        // Validate submittedAt
        const submittedAtDate = new Date(submittedAt);
        if (Number.isNaN(submittedAtDate.getTime())) {
            return res.status(400).json(new ApiResponse(400, 'Invalid submittedAt datetime'));
        }

        let assignment; // the resolved assignment for validation

        if (assignmentId) {
            // Validate ObjectId-like format for Mongo
            if (typeof assignmentId !== 'string' || !/^[a-fA-F0-9]{24}$/.test(assignmentId)) {
                return res.status(400).json(new ApiResponse(400, 'Invalid assignmentId format'));
            }
            assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
            if (!assignment) {
                return res.status(404).json(new ApiResponse(404, 'Assignment not found'));
            }
        } else {
            // Creating new assignment: resolve course by id or code
            let course = null;
            if (courseId) {
                if (typeof courseId !== 'string' || !/^[a-fA-F0-9]{24}$/.test(courseId)) {
                    return res.status(400).json(new ApiResponse(400, 'Invalid courseId format'));
                }
                course = await prisma.course.findUnique({ where: { id: courseId } });
            } else if (courseCode) {
                course = await prisma.course.findUnique({ where: { courseCode } });
            }
            if (!course) {
                return res.status(404).json(new ApiResponse(404, 'Course not found'));
            }

            const dueDateObj = new Date(dueDate);
            if (Number.isNaN(dueDateObj.getTime())) {
                return res.status(400).json(new ApiResponse(400, 'Invalid dueDate datetime'));
            }
            if (typeof maxScore !== 'number' || !Number.isFinite(maxScore) || maxScore <= 0) {
                return res.status(400).json(new ApiResponse(400, 'maxScore must be a positive number'));
            }
            if (!title || typeof title !== 'string' || !title.trim()) {
                return res.status(400).json(new ApiResponse(400, 'title is required'));
            }

            assignment = await prisma.assignment.create({
                data: {
                    title: title.trim(),
                    dueDate: dueDateObj,
                    maxScore,
                    courseId: course.id,
                },
            });
        }

        // Validate grade
        let normalizedGrade = null;
        if (typeof grade === 'number') {
            if (grade < 0) {
                return res.status(400).json(new ApiResponse(400, 'grade cannot be negative'));
            }
            if (typeof assignment.maxScore === 'number' && grade > assignment.maxScore) {
                return res.status(400).json(new ApiResponse(400, `grade cannot exceed assignment maxScore (${assignment.maxScore})`));
            }
            normalizedGrade = grade;
        }

        const submission = await prisma.submission.create({
            data: {
                studentId,
                assignmentId: assignment.id,
                submittedAt: submittedAtDate,
                grade: normalizedGrade,
            },
            include: {
                assignment: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        // After adding the score, recalculate risk and create alert if needed
        const updatedStudent = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                submissions: { include: { assignment: true } },
                alerts: { where: { status: 'OPEN' } },
            },
        });

        const riskProfile = calculateRiskScore(updatedStudent);

        if (riskProfile.score >= 0.7) {
            const reason = `High risk score detected: ${riskProfile.summary}`;
            // Avoid creating duplicate open alerts for the same high-level reason
            const existingAlert = updatedStudent.alerts.find(a => a.reason.startsWith('High risk score detected'));

            if (!existingAlert) {
                await prisma.alert.create({
                    data: {
                        studentId: studentId,
                        riskScore: riskProfile.score,
                        reason: reason,
                        status: 'OPEN',
                    },
                });
            }
        }

        return res.status(201).json(new ApiResponse(201, 'Score added successfully', submission));
    } catch (error) {
        // Convert known Prisma errors into 400s where appropriate
        if (error && error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
            return res.status(400).json(new ApiResponse(400, error.message));
        }
        next(error);
    }
};

module.exports = {
    createStudent,
    getStudents,
    getStudent,
    addScore,
};