const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../../config');
const { ApiResponse } = require('../../utils/apiResponse');

const auth = () => async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(httpStatus.UNAUTHORIZED).json(new ApiResponse(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, config.jwt.secret);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json(new ApiResponse(httpStatus.UNAUTHORIZED, 'Invalid token'));
    }
};

module.exports = auth;
