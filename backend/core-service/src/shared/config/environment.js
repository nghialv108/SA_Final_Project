require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',

  INTERNAL_SECRET: process.env.INTERNAL_SECRET || 'dev_internal_secret',

  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/core_service',

  // Hosts được phép gọi vào core-service (gateway + bff)
  TRUSTED_HOSTS: (process.env.TRUSTED_HOSTS || 'localhost,api-gateway,bff-service')
    .split(',')
    .map((h) => h.trim()),

};

module.exports = env;
