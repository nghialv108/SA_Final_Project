const mongoose = require('mongoose');

/**
 * Analytics dùng collection riêng (snapshot) thay vì query trực tiếp
 * vào Task/Project collection — tránh làm chậm hệ thống chính.
 * Dữ liệu được đồng bộ qua event, không phải query thời gian thực.
 */
const taskSnapshotSchema = new mongoose.Schema(
  {
    taskId:      { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    projectId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assigneeId:  { type: mongoose.Schema.Types.ObjectId, default: null },
    status:      { type: String, required: true },
    priority:    { type: String, required: true },
    createdAt:   { type: Date,   required: true },
    completedAt: { type: Date,   default: null },
    dueDate:     { type: Date,   default: null },
    estimatedMinutes: { type: Number, default: 0 },
    actualMinutes:    { type: Number, default: 0 },
    isOverdue:        { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

taskSnapshotSchema.index({ workspaceId: 1, status: 1 });
taskSnapshotSchema.index({ projectId: 1, status: 1 });
taskSnapshotSchema.index({ assigneeId: 1, status: 1 });
taskSnapshotSchema.index({ workspaceId: 1, dueDate: 1 });

module.exports = mongoose.model('TaskSnapshot', taskSnapshotSchema);
