const mongoose = require('mongoose');
const { ACTIVITY_ACTION } = require('../../shared/interfaces/enums');

// ── Comment ───────────────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    content:     { type: String, required: true, maxlength: 5000 },
    authorId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType:  { type: String, enum: ['task', 'project'], required: true },
    targetId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    mentions:    [{ type: mongoose.Schema.Types.ObjectId }],   // userId list
    reactions:   [{
      emoji:  { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    }],
    isEdited:  { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);
commentSchema.index({ targetId: 1, targetType: 1 });
commentSchema.index({ workspaceId: 1 });

// ── Activity Log ──────────────────────────────────────────────────────────────
const activitySchema = new mongoose.Schema(
  {
    action:      { type: String, enum: Object.values(ACTIVITY_ACTION), required: true },
    actorId:     { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType:  { type: String, enum: ['task', 'project'], required: true },
    targetId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    projectId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    meta:        { type: mongoose.Schema.Types.Mixed, default: {} }, // extra context
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);
activitySchema.index({ targetId: 1, targetType: 1 });
activitySchema.index({ workspaceId: 1, createdAt: -1 });
activitySchema.index({ projectId: 1, createdAt: -1 });

const Comment  = mongoose.model('Comment',  commentSchema);
const Activity = mongoose.model('Activity', activitySchema);

module.exports = { Comment, Activity };
