const httpStatus = require('http-status').default;
const config = require('../../config');
const { ApiResponse } = require('../../utils/apiResponse');

console.log('=== SIMPLIFIED ERROR MIDDLEWARE LOADED ===');

const errorConverter = (err, req, res, next) => {
  console.log('ERROR CONVERTER:', err.message);
  let error = err;
  if (!(error instanceof ApiResponse)) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    error = new ApiResponse(statusCode, message, null, config.env === 'development' ? err.stack : undefined);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.log('ERROR HANDLER:', err.message);
  
  // Ensure we always have valid values
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  if (err && typeof err === 'object') {
    statusCode = err.statusCode || err.status || err.code || 500;
    message = err.message || 'Internal Server Error';
  }
  
  // Convert to number and validate
  statusCode = parseInt(statusCode) || 500;
  
  console.log('Final status:', statusCode, 'message:', message);
  
  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(config.env === 'development' && err.stack && { stack: err.stack }),
  });
};

module.exports = {
  errorConverter,
  errorHandler,
};
