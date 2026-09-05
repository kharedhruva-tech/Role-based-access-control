const errorHandler = (err, req, res, next) => {
  console.error('[API Gateway Error]', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'GATEWAY_ERROR'),
      message: err.message || 'An unexpected security gateway error occurred',
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
