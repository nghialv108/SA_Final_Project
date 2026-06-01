require('dotenv').config();

const env = {
  PORT:     process.env.PORT     || 3003,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Secret dùng để xác thực request đến từ gateway
  // BFF KHÔNG có JWT secret — chỉ verify internal secret này
  INTERNAL_SECRET: process.env.INTERNAL_SECRET || 'dev_internal_secret',

  IAM_SERVICE_URL:  process.env.IAM_SERVICE_URL  || 'http://localhost:3001',
  CORE_SERVICE_URL: process.env.CORE_SERVICE_URL || 'http://localhost:3002',

  HTTP_TIMEOUT_MS: Number(process.env.HTTP_TIMEOUT_MS) || 8000,
};

module.exports = env;
