// ══════════════════════════════════════════════════════════════════════════════
// attachment.model.js
// ══════════════════════════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    filename:     { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType:     { type: String, required: true },
    size:         { type: Number, required: true },           // bytes
    storageKey:   { type: String, required: true },           // S3 / GCS key
    storageUrl:   { type: String, required: true },           // public URL
    previewUrl:   { type: String, default: null },

    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType:  { type: String, enum: ['task', 'project', 'comment'], required: true },
    targetId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; delete ret.storageKey; return ret; } },
  }
);

attachmentSchema.index({ targetId: 1, targetType: 1 });
attachmentSchema.index({ workspaceId: 1 });

module.exports = mongoose.model('Attachment', attachmentSchema);
