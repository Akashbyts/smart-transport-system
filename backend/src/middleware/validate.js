const { errorResponse } = require('../utils/response');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context.key,
        message: d.message.replace(/['"]/g, '')
      }));
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    req.body = value;
    next();
  };
}

module.exports = { validate };