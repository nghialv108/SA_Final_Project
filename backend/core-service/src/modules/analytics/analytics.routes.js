const TaskSnapshot = require('./analytics.model');
const mongoose     = require('mongoose');
const AppError     = require('../../shared/utils/AppError');
const Project      = require('../project/project.model');
const toOid        = (id) => new mongoose.Types.ObjectId(id);

// ── Repository ────────────────────────────────────────────────────────────────
const upsertSnapshot = (taskId, data) =>
  TaskSnapshot.findOneAndUpdate(
    { taskId },
    { $set: { ...data, taskId } },
    { upsert: true, new: true }
  );

const deleteSnapshot  = (taskId)    => TaskSnapshot.findOneAndDelete({ taskId });

const tasksByStatus   = (projectId) =>
  TaskSnapshot.aggregate([
    { $match: { projectId: toOid(projectId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

const tasksByAssignee = (projectId) =>
  TaskSnapshot.aggregate([
    { $match: { projectId: toOid(projectId) } },
    { $group: {
      _id:   '$assigneeId',
      total: { $sum: 1 },
      done:  { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
    }},
  ]);

const overdueByWorkspace = (workspaceId) =>
  TaskSnapshot.find({ workspaceId: toOid(workspaceId), isOverdue: true });

const burndown = (projectId, from, to) =>
  TaskSnapshot.aggregate([
    { $match: { projectId: toOid(projectId), createdAt: { $gte: new Date(from), $lte: new Date(to) } } },
    { $group: {
      _id:       { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      created:   { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
    }},
    { $sort: { _id: 1 } },
  ]);

const repo = { upsertSnapshot, deleteSnapshot, tasksByStatus, tasksByAssignee, overdueByWorkspace, burndown };

// ── Helpers ───────────────────────────────────────────────────────────────────
// Đảm bảo projectId thuộc workspace của user — tránh data leak
const assertProjectOwnership = async (projectId, workspaceId) => {
  if (!projectId) throw new AppError('projectId is required', 400);
  const project = await Project.findById(projectId);
  if (!project || String(project.workspaceId) !== String(workspaceId))
    throw new AppError('Project not found', 404);
  return project;
};

// ── Service ───────────────────────────────────────────────────────────────────
const svc = {
  getTasksByStatus:   (projectId, workspaceId) =>
    assertProjectOwnership(projectId, workspaceId).then(() => repo.tasksByStatus(projectId)),

  getTasksByAssignee: (projectId, workspaceId) =>
    assertProjectOwnership(projectId, workspaceId).then(() => repo.tasksByAssignee(projectId)),

  getOverdueTasks:    ({ workspaceId })        => repo.overdueByWorkspace(workspaceId),

  getBurndown:        (projectId, from, to, workspaceId) =>
    assertProjectOwnership(projectId, workspaceId).then(() => repo.burndown(projectId, from, to)),
};

// ── Events ────────────────────────────────────────────────────────────────────
const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');

const registerEvents = () => {
  const snap = (data) =>
    repo.upsertSnapshot(data.taskId, data)
      .catch((e) => console.error('[analytics.events] upsert error:', e.message));

  eventBus.on(EVENTS.TASK_CREATED, ({ taskId, projectId, workspaceId, assigneeId, status, priority, createdAt, dueDate, estimatedMinutes }) =>
    snap({ taskId, projectId, workspaceId, assigneeId, status: status || 'todo', priority: priority || 'medium', createdAt: createdAt || new Date(), dueDate, estimatedMinutes }));

  eventBus.on(EVENTS.TASK_STATUS_CHANGED, ({ taskId, newStatus }) =>
    TaskSnapshot.findOneAndUpdate(
      { taskId },
      { $set: { status: newStatus, ...(newStatus === 'done' ? { completedAt: new Date() } : { completedAt: null }) } }
    ).catch(() => {}));

  eventBus.on(EVENTS.TASK_ASSIGNED, ({ taskId, assigneeId }) =>
    TaskSnapshot.findOneAndUpdate({ taskId }, { $set: { assigneeId } }).catch(() => {}));

  eventBus.on(EVENTS.TASK_DELETED, ({ taskId }) =>
    repo.deleteSnapshot(taskId).catch(() => {}));

  console.log('[analytics.events] registered');
};

// ── Routes ────────────────────────────────────────────────────────────────────
const { Router } = require('express');
const response   = require('../../shared/utils/response');
const router     = Router();

router.get('/tasks/by-status',   async (req, res, next) => {
  try { return response.ok(res, await svc.getTasksByStatus(req.query.projectId, req.user.workspaceId)); }
  catch (e) { next(e); }
});

router.get('/tasks/by-assignee', async (req, res, next) => {
  try { return response.ok(res, await svc.getTasksByAssignee(req.query.projectId, req.user.workspaceId)); }
  catch (e) { next(e); }
});

router.get('/tasks/overdue',     async (req, res, next) => {
  try { return response.ok(res, await svc.getOverdueTasks(req.user)); }
  catch (e) { next(e); }
});

router.get('/burndown',          async (req, res, next) => {
  try { return response.ok(res, await svc.getBurndown(req.query.projectId, req.query.from, req.query.to, req.user.workspaceId)); }
  catch (e) { next(e); }
});

module.exports = { router, registerEvents };
