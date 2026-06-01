const redis  = require('redis');
const env    = require('../config/environment');

// ─── Redis client ─────────────────────────────────────────────────────────────
let client;

const getClient = () => {
  if (!client) {
    client = redis.createClient({ url: env.REDIS_URL });
    client.on('error', (err) => console.error('[Redis] Client error:', err));
    client.connect().catch((err) => console.error('[Redis] Connect error:', err));
  }
  return client;
};

// ─── Key helpers ──────────────────────────────────────────────────────────────
// Key theo cặp userId:workspaceId để support multi-workspace
const key = (userId, workspaceId) => `member:${userId}:${workspaceId}`;

const TTL_SECONDS = env.MEMBER_CACHE_TTL_SECONDS || 300; // default 5 phút

// ─── Cache operations ─────────────────────────────────────────────────────────

/**
 * Lấy membership context từ cache.
 * @returns {{ role, workspaceId, joinedAt } | null}
 */
const get = async (userId, workspaceId) => {
  try {
    const raw = await getClient().get(key(userId, workspaceId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // Cache miss — caller sẽ fallback sang IAM
  }
};

/**
 * Lưu membership context vào cache.
 */
const set = async (userId, workspaceId, ctx) => {
  try {
    await getClient().setEx(key(userId, workspaceId), TTL_SECONDS, JSON.stringify(ctx));
  } catch {
    // Cache write failure không block request
  }
};

/**
 * Xóa cache cho cặp userId:workspaceId cụ thể.
 * Được gọi khi IAM thông báo membership thay đổi.
 */
const del = async (userId, workspaceId) => {
  try {
    await getClient().del(key(userId, workspaceId));
  } catch {
    // Ignore
  }
};

module.exports = { get, set, del };
