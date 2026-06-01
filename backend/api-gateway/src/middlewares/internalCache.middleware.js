const memberCache = require('../cache/memberCache');
const env = require('../config/environment');

/**
 * POST /internal/cache/invalidate
 *
 * IAM gọi endpoint này (fire-and-forget) sau mỗi lần membership thay đổi:
 * addMember, removeMember, updateMemberRole, reactivateMember.
 *
 * Bảo vệ bằng x-internal-secret — chỉ IAM biết secret này.
 */
const invalidateCacheHandler = async (req, res) => {

  const secret = req.headers['x-internal-secret'];
  if (secret !== env.INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { userId, workspaceId } = req.body;
  if (!userId || !workspaceId) {
    return res.status(400).json({ success: false, message: 'userId and workspaceId required' });
  }

  await memberCache.del(userId, workspaceId);

  return res.json({ success: true, message: 'Cache invalidated' });
};

module.exports = { invalidateCacheHandler };
