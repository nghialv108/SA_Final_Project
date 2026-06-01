const { SERVICE_REGISTRY } = require('../config/proxy.config');

/**
 * Lấy config của một service theo tên.
 * Ném lỗi nếu service không tồn tại trong registry.
 *
 * @param {string} serviceName - 'iam' | 'core' | 'bff'
 * @returns {{ url: string, pathRewrite: object }}
 */
const getService = (serviceName) => {
  const service = SERVICE_REGISTRY[serviceName];
  if (!service) throw new Error(`Service "${serviceName}" not found in registry`);
  return service;
};

module.exports = { getService };
