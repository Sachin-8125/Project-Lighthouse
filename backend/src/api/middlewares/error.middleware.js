const httpStatus = require('http-status');
const config = require('../../config');
const { ApiResponse } = require('../../utils/apiResponse');

const errorConverter = (err, req, res, next) => {
  let error = err;
  // You can add more specific error type conversions here if needed
  if (!(error instanceof ApiResponse)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiResponse(statusCode, message, null, config.env === 'development' ? err.stack : undefined);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, stack } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: stack }),
  });
};

module.exports = {
  errorConverter,
  errorHandler,
};
