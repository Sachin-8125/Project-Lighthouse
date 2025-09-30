const {z} = require('zod');

const createStudent = {
    body: z.object({
    studentId: z.string({
      required_error: 'Student ID is required.',
    }).min(1, { message: 'Student ID cannot be empty.' }),
    
    name: z.string({
      required_error: 'Name is required.',
    }).min(1, { message: 'Name cannot be empty.' }),
    
    email: z.string({
      required_error: 'Email is required.',
    }).email({ message: 'Invalid email address.' }),
    
    enrollmentDate: z.string({
      required_error: 'Enrollment date is required.',
    }).datetime({ message: "Enrollment date must be a valid ISO 8601 date string." }), // Validates ISO string
  }),
};

const addScore = {
  body: z.object({
    assignmentId: z.string().optional(),
    // Fields to create a new assignment when assignmentId is not provided
    courseId: z.string().optional(),
    courseCode: z.string().optional(),
    title: z.string().optional(),
    dueDate: z.string().datetime({ message: 'dueDate must be an ISO 8601 date string.' }).optional(),
    maxScore: z.number().int().positive().optional(),

    // Submission fields
    submittedAt: z.string({ required_error: 'submittedAt is required.' }).datetime({ message: 'submittedAt must be an ISO 8601 date string.' }),
    grade: z.number().int().min(0).nullable().optional(),
  }).refine((data) => {
    if (data.assignmentId) return true;
    const hasCourseRef = !!(data.courseId || (data.courseCode && data.courseCode.trim()));
    return !!(hasCourseRef && data.title && data.dueDate && typeof data.maxScore === 'number');
  }, {
    message: 'Provide assignmentId or (courseId/courseCode, title, dueDate, and maxScore) to create a new assignment.',
    path: ['assignmentId'],
  }),
};

module.exports = { createStudent, addScore };