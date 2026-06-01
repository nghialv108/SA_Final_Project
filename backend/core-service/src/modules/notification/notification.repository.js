const Notification = require('./notification.model');

const create         = (data) => Notification.create(data);
const createMany     = (docs) => Notification.insertMany(docs);
const findByRecipient= (recipientId, filters = {}) =>
  Notification.find({ recipientId, ...filters }).sort({ createdAt: -1 });
const countUnread    = (recipientId) =>
  Notification.countDocuments({ recipientId, isRead: false });
const markAsRead     = (id, recipientId) =>
  Notification.findOneAndUpdate(
    { _id: id, recipientId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
const markAllAsRead  = (recipientId) =>
  Notification.updateMany(
    { recipientId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
const deleteOld = (days = 30) =>
  Notification.deleteMany({
    createdAt: { $lt: new Date(Date.now() - days * 86400_000) },
    isRead: true,
  });

module.exports = {
  create, createMany, findByRecipient,
  countUnread, markAsRead, markAllAsRead, deleteOld,
};
