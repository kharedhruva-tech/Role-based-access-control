const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input parameters',
        details: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
          value: err.value,
        })),
      },
    });
  }
  next();
};

module.exports = validate;
