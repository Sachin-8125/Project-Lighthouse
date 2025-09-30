const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const httpStatus = require('http-status');
const apiRoutes = require('./api/routes');
const { errorConverter, errorHandler } = require('./api/middlewares/error.middleware');
const { ApiResponse } = require('./utils/apiResponse');
const config = require('./config');

const app = express();

// Set logging based on environment
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cors
app.use(cors());
app.options('*', cors());

// Health check endpoint
app.get('/', (req, res) => {
    res.status(httpStatus.OK).send('AcadiaPulse Backend is running.');
});

// API routes
app.use('/api', apiRoutes);

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
    res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, 'Not Found'));
});

// Convert error to ApiResponse, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

module.exports = app;