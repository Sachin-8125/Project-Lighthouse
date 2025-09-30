const { z } = require('zod');
const { UserRole } = require('@prisma/client');

const register = {
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
      })
      .email({ message: 'Invalid email address.' }),

    password: z
      .string({
        required_error: 'Password is required.',
      })
      .min(8, { message: 'Password must be at least 8 characters long.' }),

    name: z
      .string({
        required_error: 'Name is required.',
      })
      .min(1, { message: 'Name cannot be empty.' }),
      
    role: z.nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Invalid user role specified.' })
    }).optional(),
  }),
};

const login = {
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
      })
      .email({ message: 'Invalid email address.' }),

    password: z
      .string({
        required_error: 'Password is required.',
      })
      .min(1, { message: 'Password cannot be empty.' }),
  }),
};

module.exports = {
  register,
  login,
};