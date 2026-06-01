const rateLimit = require('express-rate-limit');
const env       = require('../config/environment');

/**
 * Rate Limiter mặc định — áp dụng cho toàn bộ API
 */
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max:      env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/**
 * Rate Limiter chặt hơn — dành riêng cho auth endpoints
 * Giới hạn 10 lần / phút để chống brute force
 */
const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.',
  },
});

module.exports = { globalLimiter, authLimiter };
