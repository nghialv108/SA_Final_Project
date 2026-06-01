const env = require('../config/environment');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : 'Internal server error';

  if (env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path}`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
