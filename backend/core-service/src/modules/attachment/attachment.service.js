const path     = require('path');
const repo     = require('./attachment.repository');
const AppError = require('../../shared/utils/AppError');
const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');

/**
 * Storage adapter (stub).
 * Thay thế bằng AWS S3 / GCS SDK thực tế trong production.
 */
const storageAdapter = {
  upload: async (file) => ({
    storageKey: `uploads/${Date.now()}_${file.originalname}`,
    storageUrl: `https://cdn.example.com/uploads/${Date.now()}_${file.originalname}`,
    previewUrl: file.mimetype.startsWith('image/')
      ? `https://cdn.example.com/previews/${Date.now()}_${file.originalname}`
      : null,
  }),
  delete: async (storageKey) => {
    // AWS: s3.deleteObject({ Bucket, Key: storageKey }).promise()
    console.log(`[storage] deleted ${storageKey}`);
  },
};

const uploadAttachment = async ({ userId, workspaceId }, file, body) => {
  if (!file) throw new AppError('No file provided', 400);

  const stored = await storageAdapter.upload(file);

  const attachment = await repo.create({
    filename:     stored.storageKey.split('/').pop(),
    originalName: file.originalname,
    mimeType:     file.mimetype,
    size:         file.size,
    storageKey:   stored.storageKey,
    storageUrl:   stored.storageUrl,
    previewUrl:   stored.previewUrl,
    uploadedBy:   userId,
    workspaceId,
    targetType:   body.targetType,
    targetId:     body.targetId,
  });

  eventBus.emit(EVENTS.ATTACHMENT_UPLOADED, {
    attachmentId: attachment._id,
    workspaceId, uploadedBy: userId,
    size: file.size,
    targetType: body.targetType, targetId: body.targetId,
  });

  return attachment;
};

const getAttachments = (targetId, targetType) =>
  repo.findByTarget(targetId, targetType);

const deleteAttachment = async ({ userId, role }, attachmentId) => {
  const att = await repo.findById(attachmentId);
  if (!att) throw new AppError('Attachment not found', 404);

  const isOwner = String(att.uploadedBy) === String(userId);
  if (!isOwner && role !== 'admin')
    throw new AppError('Forbidden', 403);

  await storageAdapter.delete(att.storageKey);
  await repo.deleteById(attachmentId);

  eventBus.emit(EVENTS.ATTACHMENT_DELETED, {
    attachmentId, workspaceId: att.workspaceId, size: att.size,
  });
};

const getWorkspaceStorageUsed = (workspaceId) =>
  repo.sumSizeByWorkspace(workspaceId);

module.exports = {
  uploadAttachment, getAttachments,
  deleteAttachment, getWorkspaceStorageUsed,
};
