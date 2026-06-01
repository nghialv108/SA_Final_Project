const notificationClient = require('../../clients/services/notification.client');

// ── Transformer ───────────────────────────────────────────────────────────────
/**
 * Mobile notification list — chỉ giữ field cần render notification item
 */
const transformList = (notifications) =>
  (notifications || []).map((n) => ({
    notificationId: n._id,
    type:           n.type,
    title:          n.title,
    body:           n.body   || '',
    isRead:         n.isRead,
    readAt:         n.readAt || null,
    ref: n.refId
      ? { type: n.refType, id: n.refId }
      : null,
    createdAt: n.createdAt,
  }));

// ── Aggregators ───────────────────────────────────────────────────────────────
const aggregateInbox = async (user) => {
  const result = await notificationClient.getNotifications(user);
  const items  = transformList(result?.data || []);
  const unread = items.filter((n) => !n.isRead).length;
  return { unreadCount: unread, items };
};

// ── Routes ────────────────────────────────────────────────────────────────────
const { Router } = require('express');
const response   = require('../../shared/utils/response');
const router     = Router();

/**
 * GET   /bff/notifications          — inbox với unreadCount + list
 * PATCH /bff/notifications/:id/read — đánh dấu đã đọc
 * PATCH /bff/notifications/read-all — đánh dấu tất cả đã đọc
 */
router.get('/', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateInbox(req.user));
  } catch (e) { next(e); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await notificationClient.markAllAsRead(req.user);
    return response.ok(res, null, 'All marked as read');
  } catch (e) { next(e); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await notificationClient.markAsRead(req.params.id, req.user);
    return response.ok(res, null, 'Marked as read');
  } catch (e) { next(e); }
});

module.exports = router;
