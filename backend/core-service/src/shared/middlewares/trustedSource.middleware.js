const AppError = require('../utils/AppError');
const env = require('../config/environment');

/**
 * Middleware bảo vệ core-service khỏi request trực tiếp từ bên ngoài.
 *
 * Nguyên tắc:
 *   - core-service KHÔNG verify JWT (không có secret key)
 *   - core-service TIN TƯỞNG header x-user-id do gateway/bff inject SAU KHI verify JWT
 *   - Nếu request không có x-user-id → không đi qua gateway → từ chối
 *
 * Trong production: nên kết hợp thêm network policy (VPC/firewall)
 * để chỉ gateway & bff mới có thể TCP-connect vào port này.
 */
const trustedSource = (req, res, next) => {
  const incomingSecret = req.headers['x-internal-secret'];

  if (!incomingSecret || incomingSecret !== env.INTERNAL_SECRET) {
    return next(new AppError('Forbidden: Invalid internal secret', 403));
  }

  const userId = req.headers['x-user-id'];

  if (!userId || userId.trim() === '') {
    return next(new AppError('Forbidden: Missing user context', 403));
  }
  // Gắn thông tin user từ header vào req.user để các controller dùng
  req.user = {
    userId: userId.trim(),
    role: (req.headers['x-user-role'] || 'member').trim(),
    workspaceId: (req.headers['x-workspace-id'] || null),
  };

  next();
};

module.exports = trustedSource;
