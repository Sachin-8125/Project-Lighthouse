const httpStatus = require('http-status').default;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../../../prisma/generated/prisma');
const { ApiResponse } = require('../../utils/apiResponse');
const config = require('../../config');

const prisma = new PrismaClient();

const register = async (req, res, next) => {
    console.log('=== REGISTER CONTROLLER CALLED ===');
    console.log('Request body:', req.body);
    try {
        const { email, password, name, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json(new ApiResponse(400, 'User already exists with this email.'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role
            },
        });
        
        // Exclude password from the response
        const userResponse = { ...user };
        delete userResponse.password;

        res.status(201).json(new ApiResponse(201, 'User registered successfully', userResponse));
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json(new ApiResponse(401, 'Incorrect email or password'));
        }

        const token = jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
            expiresIn: `${config.jwt.accessExpirationMinutes}m`,
        });

        const userResponse = { ...user };
        delete userResponse.password;

        res.status(200).json(new ApiResponse(200, 'Login successful', { user: userResponse, token }));
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.sub; // JWT standard 'sub' claim contains user ID
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        
        if (!user) {
            return res.status(404).json(new ApiResponse(404, 'User not found'));
        }
        
        res.status(200).json(new ApiResponse(200, 'Profile retrieved successfully', user));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
};
