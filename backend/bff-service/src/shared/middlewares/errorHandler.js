const env    = require('../config/environment');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : 'Internal server error';

  logger.error(message, {
    method: req.method,
    path:   req.path,
    status: statusCode,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
