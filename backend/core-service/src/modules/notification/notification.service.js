const repo     = require('./notification.repository');
const { NOTIFICATION_CHANNEL } = require('../../shared/interfaces/enums');

/**
 * Notification service chỉ quản lý notification records.
 * Không gọi service khác, không có business logic phức tạp.
 * Toàn bộ notification được tạo bởi notification.events.js
 * khi nhận event từ các module khác.
 */

const getMyNotifications = ({ userId }, filters = {}) =>
  repo.findByRecipient(userId, filters);

const getUnreadCount = ({ userId }) =>
  repo.countUnread(userId);

const markAsRead = ({ userId }, notificationId) =>
  repo.markAsRead(notificationId, userId);

const markAllAsRead = ({ userId }) =>
  repo.markAllAsRead(userId);

/**
 * Hàm nội bộ - chỉ gọi từ notification.events.js
 * Tạo notification và gửi qua các channel tương ứng.
 */
const _createAndSend = async ({ recipientId, workspaceId, type, title, body, channels, refType, refId }) => {
  const notification = await repo.create({
    recipientId, workspaceId, type, title, body,
    channels: channels || [NOTIFICATION_CHANNEL.IN_APP],
    refType, refId,
  });

  // In-app: lưu DB là đủ (frontend poll hoặc WebSocket)
  // Email / Push: gọi provider tương ứng ở đây (stub)
  if (channels?.includes(NOTIFICATION_CHANNEL.EMAIL)) {
    console.log(`[notification] send email to user ${recipientId}: ${title}`);
  }
  if (channels?.includes(NOTIFICATION_CHANNEL.PUSH)) {
    console.log(`[notification] send push to user ${recipientId}: ${title}`);
  }

  return notification;
};

module.exports = {
  getMyNotifications, getUnreadCount,
  markAsRead, markAllAsRead,
  _createAndSend,
};
