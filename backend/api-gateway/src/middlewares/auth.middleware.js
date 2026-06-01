const jwt = require('jsonwebtoken');
const axios = require('axios');
const env = require('../config/environment');
const memberCache = require('../cache/memberCache');

const PUBLIC_PATHS = [
  '/health',
  '/health/all',
  '/api/iam/auth/register',
  '/api/iam/auth/login',
  '/api/iam/auth/refresh-token',
  '/api/iam/auth/forgot-password',
  '/api/iam/auth/reset-password',
];

const isPublicPath = (path) =>
  PUBLIC_PATHS.some((pub) => path.startsWith(pub));

/**
 * Auth Middleware — merged best of V1 + V2
 *
 * 1. Skip public paths (thêm /health, /health/all từ V2)
 * 2. Verify JWT → lấy userId + email (payload đầy đủ từ V2)
 * 3. Nếu request có x-workspace-id header:
 *    a. Check Redis cache (userId:workspaceId)  ← từ V1
 *    b. Cache miss → query IAM → lưu vào cache  ← từ V1
 *    c. Inject x-user-role + x-workspace-id vào downstream
 * 4. Inject x-user-id + x-internal-secret cho mọi request
 * 5. req.user đầy đủ hơn: { userId, email, workspaceId, role }  ← từ V2
 */
const authMiddleware = async (req, res, next) => {
  if (isPublicPath(req.path)) return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid Authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError'
        ? 'Unauthorized: Token has expired'
        : 'Unauthorized: Invalid token',
    });
  }

  const userId = String(payload.userId);
  const email = payload.email || '';   // từ V2: JWT chứa cả email

  // Headers luôn inject cho mọi downstream service
  req.headers['x-user-id'] = userId;
  req.headers['x-internal-secret'] = env.INTERNAL_SECRET;

  // Resolve workspace role nếu client gửi x-workspace-id
  const workspaceId = req.headers['x-workspace-id'];
  let role = '';

  if (workspaceId) {
    // 1. Check Redis cache trước (từ V1)
    let ctx = await memberCache.get(userId, workspaceId);

    if (!ctx) {
      // 2. Cache miss — query IAM
      try {
        const { data } = await axios.get(
          `${env.IAM_SERVICE_URL}/iam/workspaces/internal/member-context`,
          {
            params: { userId, workspaceId },
            headers: { 'x-internal-secret': env.INTERNAL_SECRET },
            timeout: 3000,
          }
        );

        if (data?.data) {
          ctx = data.data;
          // 3. Lưu vào cache — requests tiếp theo không cần query IAM (từ V1)
          await memberCache.set(userId, workspaceId, ctx);
        }
      } catch (err) {
        console.warn('[Gateway] IAM member-context unavailable:', err.message);
        // IAM không phản hồi → cho qua, downstream tự guard
      }
    }

    if (ctx) {
      req.headers['x-workspace-id'] = String(ctx.workspaceId);
      role = String(ctx.role);
    } else {
      req.headers['x-user-role'] = '';
    }
  }

  req.headers['x-user-role'] = role;

  // req.user đầy đủ context (từ V2: thêm email, role)
  req.user = { userId, email, workspaceId: workspaceId || '', role };

  return next();
};

module.exports = authMiddleware;
