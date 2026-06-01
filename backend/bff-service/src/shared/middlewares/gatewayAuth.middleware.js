const env = require('../config/environment');
const AppError = require('../utils/AppError');

/**
 * gatewayAuth middleware — BFF Trust Gate
 *
 * BFF không có JWT secret key, không verify token.
 * Thay vào đó, BFF xác nhận request đến từ gateway bằng cách:
 *   1. So sánh header x-internal-secret với INTERNAL_SECRET trong env
 *   2. Đọc x-user-id, x-user-role, x-workspace-id do gateway inject sau khi verify JWT
 *
 * Nếu một trong hai điều kiện trên không thỏa → từ chối ngay.
 *
 * Trong production: kết hợp thêm network policy (VPC/private subnet)
 * để chỉ gateway mới TCP-connect được vào port của BFF.
 */
const gatewayAuth = (req, res, next) => {
  // ── 1. Verify internal secret ───────────────────────────────────────────────
  const incomingSecret = req.headers['x-internal-secret'];

  if (!incomingSecret || incomingSecret !== env.INTERNAL_SECRET) {
    return next(new AppError('Forbidden: Invalid internal secret', 403));
  }

  // ── 2. Extract user context từ header do gateway inject ────────────────────
  const userId = req.headers['x-user-id'];

  if (!userId || userId.trim() === '') {
    return next(new AppError('Forbidden: Missing user context', 403));
  }

  req.user = {
    userId: userId.trim(),
    role: (req.headers['x-user-role'] || 'member').trim(),
    workspaceId: (req.headers['x-workspace-id'] || null),
  };


  next();
};

module.exports = gatewayAuth;
