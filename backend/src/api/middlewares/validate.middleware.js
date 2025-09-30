const httpStatus = require('http-status').default;
const { ApiResponse } = require('../../utils/apiResponse');
const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    const schemaToValidate = {};
    if (schema.params) {
        schemaToValidate.params = schema.params;
        Object.assign(req, { params: schema.params.parse(req.params) });
    }
    if (schema.body) {
        schemaToValidate.body = schema.body;
        Object.assign(req, { body: schema.body.parse(req.body) });
    }
    if (schema.query) {
        schemaToValidate.query = schema.query;
        Object.assign(req, { query: schema.query.parse(req.query) });
    }
    
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.errors && Array.isArray(error.errors)
        ? error.errors.map((err) => `${err.path.join('.')} - ${err.message}`).join(', ')
        : 'Validation failed';
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, `Validation failed: ${errorMessage}`));
    }
    next(error);
  }
};

module.exports = validate;
