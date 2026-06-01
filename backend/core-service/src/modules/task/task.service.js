const taskRepo = require('./task.repository');
const AppError = require('../../shared/utils/AppError');
const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');
const { TASK_STATUS } = require('../../shared/interfaces/enums');

// Whitelist filter keys — ngăn NoSQL injection từ query params
const ALLOWED_FILTERS = ['status', 'priority', 'assigneeId', 'dueDate', 'parentTaskId'];

const sanitizeFilters = (raw = {}) =>
  Object.fromEntries(
    Object.entries(raw).filter(([k]) => ALLOWED_FILTERS.includes(k))
  );

// ── Helpers ───────────────────────────────────────────────────────────────────

const assertTaskAccess = async (taskId, workspaceId) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);
  if (String(task.workspaceId) !== String(workspaceId))
    throw new AppError('Task not found', 404);
  return task;
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

const createTask = async ({ userId, workspaceId }, body) => {
  const task = await taskRepo.create({ ...body, workspaceId, createdBy: userId });

  eventBus.emit(EVENTS.TASK_CREATED, {
    taskId: task._id, title: task.title,
    projectId: task.projectId, workspaceId,
    createdBy: userId,
  });

  if (task.assigneeId) {
    eventBus.emit(EVENTS.TASK_ASSIGNED, {
      taskId: task._id, title: task.title,
      assigneeId: task.assigneeId,
      assignedBy: userId, projectId: task.projectId,
    });
  }

  return task;
};

const getTasksByProject = async ({ workspaceId }, projectId, query = {}) => {
  if (!projectId) throw new AppError('projectId is required', 400);

  const filters = sanitizeFilters(query);

  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;

  return taskRepo.findByProject(projectId, { workspaceId, ...filters }, { skip, limit });
};

const getMyTasks = async ({ userId, workspaceId }, query = {}) => {
  const filters = sanitizeFilters(query);
  return taskRepo.findByAssignee(userId, { workspaceId, ...filters });
};

const getTaskById = async ({ workspaceId }, taskId) =>
  assertTaskAccess(taskId, workspaceId);

const getSubTasks = async ({ workspaceId }, parentTaskId) => {
  await assertTaskAccess(parentTaskId, workspaceId);
  return taskRepo.findSubTasks(parentTaskId);
};

const updateTask = async ({ userId, workspaceId }, taskId, body) => {
  await assertTaskAccess(taskId, workspaceId);
  const updated = await taskRepo.updateById(taskId, body);
  eventBus.emit(EVENTS.TASK_UPDATED, { taskId, updatedBy: userId, changes: body });
  return updated;
};

const changeStatus = async ({ userId, workspaceId }, taskId, newStatus) => {
  const task      = await assertTaskAccess(taskId, workspaceId);
  const oldStatus = task.status;

  // BUG FIX (từ backend_fixed):
  // updated: { completedAt: null } cho MỌI status → sai, xóa mất completedAt khi đang DONE
  // fixed:   chỉ reset completedAt khi task đang ở DONE và chuyển sang status khác
  let extra = {};
  if (newStatus === TASK_STATUS.DONE) {
    extra = { completedAt: new Date() };
  } else if (oldStatus === TASK_STATUS.DONE) {
    extra = { completedAt: null }; // Chỉ reset khi rời khỏi DONE
  }

  const updated = await taskRepo.updateById(taskId, { status: newStatus, ...extra });

  eventBus.emit(EVENTS.TASK_STATUS_CHANGED, {
    taskId, title: task.title,
    oldStatus, newStatus,
    changedBy: userId, projectId: task.projectId,
    assigneeId: task.assigneeId,
  });

  return updated;
};

const assignTask = async ({ userId, workspaceId }, taskId, assigneeId) => {
  const task    = await assertTaskAccess(taskId, workspaceId);
  const updated = await taskRepo.updateById(taskId, { assigneeId });

  eventBus.emit(EVENTS.TASK_ASSIGNED, {
    taskId, title: task.title,
    assigneeId, assignedBy: userId, projectId: task.projectId,
  });

  return updated;
};

const deleteTask = async ({ userId, workspaceId }, taskId) => {
  await assertTaskAccess(taskId, workspaceId);

  // Xóa subtask trước — tránh orphan records
  await taskRepo.deleteSubTasks(taskId);
  await taskRepo.deleteById(taskId);

  eventBus.emit(EVENTS.TASK_DELETED, { taskId, deletedBy: userId, workspaceId });
};

// ── Time Tracking ─────────────────────────────────────────────────────────────

const logTime = async ({ userId, workspaceId }, taskId, entry) => {
  await assertTaskAccess(taskId, workspaceId);
  return taskRepo.pushTimeEntry(taskId, { ...entry, userId });
};

module.exports = {
  createTask, getTasksByProject, getMyTasks, getTaskById, getSubTasks,
  updateTask, changeStatus, assignTask, deleteTask, logTime,
};
