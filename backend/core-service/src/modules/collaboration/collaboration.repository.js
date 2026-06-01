const { Comment, Activity } = require('./collaboration.model');

// ── Comments ──────────────────────────────────────────────────────────────────
const createComment = (data)       => Comment.create(data);
const findCommentById = (id)       => Comment.findById(id);
const findCommentsByTarget = (targetId, targetType) =>
  Comment.find({ targetId, targetType, isDeleted: false }).sort({ createdAt: 1 });

const updateComment = (id, data)   =>
  Comment.findByIdAndUpdate(id, { ...data, isEdited: true }, { new: true });
const softDeleteComment = (id)     =>
  Comment.findByIdAndUpdate(id, { isDeleted: true, content: '[deleted]' }, { new: true });

const addReaction = (id, emoji, userId) =>
  Comment.findByIdAndUpdate(
    id,
    { $addToSet: { reactions: { emoji, userId } } },
    { new: true }
  );
const removeReaction = (id, emoji, userId) =>
  Comment.findByIdAndUpdate(
    id,
    { $pull: { reactions: { emoji, userId: userId.toString() } } },
    { new: true }
  );

// ── Activity ──────────────────────────────────────────────────────────────────
const createActivity = (data) => Activity.create(data);
const findActivitiesByTarget = (targetId, targetType, limit = 50) =>
  Activity.find({ targetId, targetType })
    .sort({ createdAt: -1 })
    .limit(limit);
const findActivitiesByProject = (projectId, limit = 100) =>
  Activity.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(limit);
const findActivitiesByWorkspace = (workspaceId, limit = 100) =>
  Activity.find({ workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit);

module.exports = {
  createComment, findCommentById, findCommentsByTarget,
  updateComment, softDeleteComment,
  addReaction, removeReaction,
  createActivity, findActivitiesByTarget,
  findActivitiesByProject, findActivitiesByWorkspace,
};
