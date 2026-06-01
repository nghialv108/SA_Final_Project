const mongoose = require('mongoose');
const { NOTIFICATION_TYPE, NOTIFICATION_CHANNEL } = require('../../shared/interfaces/enums');

const notificationSchema = new mongoose.Schema(
  {
    recipientId:  { type: mongoose.Schema.Types.ObjectId, required: true },
    workspaceId:  { type: mongoose.Schema.Types.ObjectId, required: true },
    type:         { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    title:        { type: String, required: true },
    body:         { type: String, default: '' },
    channels:     [{ type: String, enum: Object.values(NOTIFICATION_CHANNEL) }],
    refType:      { type: String, enum: ['task', 'project', 'comment'], default: null },
    refId:        { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead:       { type: Boolean, default: false },
    readAt:       { type: Date,    default: null },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
