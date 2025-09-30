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

module.exports = { createStudent };