const http = require('../http/httpClient');
const env  = require('../../shared/config/environment');

const BASE = env.CORE_SERVICE_URL;

/**
 * Core Client — tất cả call đến core-service đi qua đây.
 * Path prefix /core/* khớp với route của core-service.
 */

// ── Projects ──────────────────────────────────────────────────────────────────
const getProjects   = (user)              => http.get(BASE, `/core/projects`, user);
const getProjectById= (projectId, user)   => http.get(BASE, `/core/projects/${projectId}`, user);

// ── Tasks ─────────────────────────────────────────────────────────────────────
const getTasksByProject = (projectId, user) =>
  http.get(BASE, `/core/tasks?projectId=${projectId}`, user);

const getTaskById   = (taskId, user)      => http.get(BASE, `/core/tasks/${taskId}`, user);
const getSubTasks   = (taskId, user)      => http.get(BASE, `/core/tasks/${taskId}/subtasks`, user);
const getMyTasks    = (user)              =>
  http.get(BASE, `/core/tasks?assigneeId=${user.userId}`, user);

// ── Collaboration ─────────────────────────────────────────────────────────────
const getComments = (targetId, targetType, user) =>
  http.get(BASE, `/core/collaboration/comments?targetId=${targetId}&targetType=${targetType}`, user);

const getActivityByProject = (projectId, user) =>
  http.get(BASE, `/core/collaboration/activities/project/${projectId}`, user);

const getActivityByWorkspace = (user) =>
  http.get(BASE, `/core/collaboration/activities/workspace`, user);

// ── Notifications ─────────────────────────────────────────────────────────────
const getNotifications = (user)  => http.get(BASE, `/core/notifications`, user);
const getUnreadCount   = (user)  => http.get(BASE, `/core/notifications/unread-count`, user);

// ── Analytics ─────────────────────────────────────────────────────────────────
const getTasksByStatus   = (projectId, user) =>
  http.get(BASE, `/core/analytics/tasks/by-status?projectId=${projectId}`, user);
const getTasksByAssignee = (projectId, user) =>
  http.get(BASE, `/core/analytics/tasks/by-assignee?projectId=${projectId}`, user);
const getOverdueTasks    = (user) =>
  http.get(BASE, `/core/analytics/tasks/overdue`, user);
const getBurndown        = (projectId, from, to, user) =>
  http.get(BASE, `/core/analytics/burndown?projectId=${projectId}&from=${from}&to=${to}`, user);

module.exports = {
  getProjects, getProjectById,
  getTasksByProject, getTaskById, getSubTasks, getMyTasks,
  getComments, getActivityByProject, getActivityByWorkspace,
  getNotifications, getUnreadCount,
  getTasksByStatus, getTasksByAssignee, getOverdueTasks, getBurndown,
};
