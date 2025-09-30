const httpStatus = require('http-status');
const { PrismaClient } = require('../../../prisma/generated/prisma');
const { ApiResponse } = require('../../utils/apiResponse');

const prisma = new PrismaClient();

const getAlerts = async (req, res, next) => {
    try {
        const alerts = await prisma.alert.findMany({
            where: {
                status: 'OPEN',
            },
            include: {
                student: true,
            },
            orderBy: {
                riskScore: 'desc',
            },
        });
        res.status(200).json(new ApiResponse(200, 'Open alerts retrieved successfully', alerts));
    } catch (error) {
        next(error);
    }
};

const updateAlertStatus = async (req, res, next) => {
    try {
        const { alertId } = req.params;
        const { status } = req.body;
        const userId = req.user.sub;

        const updatedAlert = await prisma.alert.update({
            where: { id: alertId },
            data: {
                status: status,
                resolvedBy: status === 'RESOLVED' || status === 'DISMISSED' ? userId : null,
                resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? new Date() : null,
            },
        });

        res.status(200).json(new ApiResponse(200, 'Alert status updated successfully', updatedAlert));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAlerts,
    updateAlertStatus,
};