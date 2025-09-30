const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { ApiResponse } = require('../../utils/apiResponse');
const config = require('../../config');

const prisma = new PrismaClient();

const register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, 'User already exists with this email.'));
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

        res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, 'User registered successfully', userResponse));
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(httpStatus.UNAUTHORIZED).json(new ApiResponse(httpStatus.UNAUTHORIZED, 'Incorrect email or password'));
        }

        const token = jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
            expiresIn: `${config.jwt.accessExpirationMinutes}m`,
        });

        const userResponse = { ...user };
        delete userResponse.password;

        res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Login successful', { user: userResponse, token }));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
};