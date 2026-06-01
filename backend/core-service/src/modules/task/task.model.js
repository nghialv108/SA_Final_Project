const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../../shared/interfaces/enums');

const timeEntrySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  startedAt: { type: Date, required: true },
  endedAt:   { type: Date, default: null },
  minutes:   { type: Number, default: 0 },
  note:      { type: String, default: '' },
}, { _id: true });

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    status:   { type: String, enum: Object.values(TASK_STATUS),   default: TASK_STATUS.TODO },
    priority: { type: String, enum: Object.values(TASK_PRIORITY), default: TASK_PRIORITY.MEDIUM },

    projectId:   { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, required: true },
    assigneeId:  { type: mongoose.Schema.Types.ObjectId, default: null },

    parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },

    dueDate:      { type: Date, default: null },
    startDate:    { type: Date, default: null },
    completedAt:  { type: Date, default: null },

    estimatedMinutes: { type: Number, default: 0 },
    timeEntries:      [timeEntrySchema],

    tags:        [{ type: String, trim: true }],
    isArchived:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assigneeId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, dueDate: 1 });
taskSchema.index({ parentTaskId: 1 });

module.exports = mongoose.model('Task', taskSchema);
