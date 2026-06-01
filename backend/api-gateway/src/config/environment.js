require('dotenv').config();

const env = {
  PORT:     process.env.PORT     || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  INTERNAL_SECRET: process.env.INTERNAL_SECRET || 'dev_internal_secret',
  JWT_SECRET:      process.env.JWT_SECRET       || 'dev_access_secret',

  IAM_SERVICE_URL:  process.env.IAM_SERVICE_URL  || 'http://localhost:3001',
  CORE_SERVICE_URL: process.env.CORE_SERVICE_URL || 'http://localhost:3002',
  BFF_SERVICE_URL:    process.env.BFF_SERVICE_URL    || 'http://localhost:3003',
  SEARCH_SERVICE_URL: process.env.SEARCH_SERVICE_URL || 'http://localhost:3004',
  REPORT_SERVICE_URL: process.env.REPORT_SERVICE_URL || 'http://localhost:3005',

  // CORS: split chuỗi thành array để dùng trong callback (từ V2)
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',').map((o) => o.trim()),

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  RATE_LIMIT_MAX:       Number(process.env.RATE_LIMIT_MAX)       || 100,

  // Redis — membership cache (từ V1)
  REDIS_URL:                process.env.REDIS_URL                || 'redis://localhost:6379',
  MEMBER_CACHE_TTL_SECONDS: Number(process.env.MEMBER_CACHE_TTL_SECONDS) || 300,
};

module.exports = env;
