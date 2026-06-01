const repo     = require('./collaboration.repository');
const AppError = require('../../shared/utils/AppError');
const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');

// ── Comments ──────────────────────────────────────────────────────────────────
const createComment = async ({ userId, workspaceId }, body) => {
  // Parse @mentions: tìm chuỗi dạng @[userId]
  const mentions = [...(body.content.matchAll(/@\[([a-f0-9]{24})\]/g))]
    .map((m) => m[1]);

  const comment = await repo.createComment({
    ...body,
    authorId: userId,
    workspaceId,
    mentions,
  });

  eventBus.emit(EVENTS.COMMENT_CREATED, {
    commentId: comment._id,
    targetType: comment.targetType,
    targetId:  comment.targetId,
    authorId:  userId,
    mentions,
  });

  if (mentions.length > 0) {
    eventBus.emit(EVENTS.MENTION_CREATED, {
      commentId: comment._id, authorId: userId,
      mentionedUserIds: mentions,
      targetType: comment.targetType, targetId: comment.targetId,
    });
  }

  return comment;
};

const getComments = async (targetId, targetType) =>
  repo.findCommentsByTarget(targetId, targetType);

const updateComment = async ({ userId }, commentId, content) => {
  const comment = await repo.findCommentById(commentId);
  if (!comment) throw new AppError('Comment not found', 404);
  if (String(comment.authorId) !== String(userId))
    throw new AppError('Forbidden: Cannot edit others comment', 403);
  return repo.updateComment(commentId, { content });
};

const deleteComment = async ({ userId, role }, commentId) => {
  const comment = await repo.findCommentById(commentId);
  if (!comment) throw new AppError('Comment not found', 404);
  const isAuthor = String(comment.authorId) === String(userId);
  if (!isAuthor && role !== 'admin')
    throw new AppError('Forbidden', 403);
  return repo.softDeleteComment(commentId);
};

const addReaction    = ({ userId }, commentId, emoji) => repo.addReaction(commentId, emoji, userId);
const removeReaction = ({ userId }, commentId, emoji) => repo.removeReaction(commentId, emoji, userId);

// ── Activity Log ──────────────────────────────────────────────────────────────
const getActivityByTarget    = (targetId, targetType) => repo.findActivitiesByTarget(targetId, targetType);
const getActivityByProject   = (projectId)            => repo.findActivitiesByProject(projectId);
const getActivityByWorkspace = ({ workspaceId })      => repo.findActivitiesByWorkspace(workspaceId);

module.exports = {
  createComment, getComments, updateComment, deleteComment,
  addReaction, removeReaction,
  getActivityByTarget, getActivityByProject, getActivityByWorkspace,
};
