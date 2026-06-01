const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');
const repo     = require('./collaboration.repository');
const { ACTIVITY_ACTION } = require('../../shared/interfaces/enums');

/**
 * Collaboration module lắng nghe event từ Task & Project
 * để ghi Activity Log tập trung.
 * KHÔNG import service/repository của module khác.
 */
const register = () => {
  const log = (action, actorId, targetType, targetId, workspaceId, projectId, meta = {}) =>
    repo.createActivity({ action, actorId, targetType, targetId, workspaceId, projectId, meta })
      .catch((err) => console.error('[collaboration.events] log error:', err.message));

  // Task events
  eventBus.on(EVENTS.TASK_CREATED, ({ taskId, createdBy, projectId, workspaceId, title }) =>
    log(ACTIVITY_ACTION.CREATED, createdBy, 'task', taskId, workspaceId, projectId, { title }));

  eventBus.on(EVENTS.TASK_UPDATED, ({ taskId, updatedBy, projectId, workspaceId, changes }) =>
    log(ACTIVITY_ACTION.UPDATED, updatedBy, 'task', taskId, workspaceId, projectId, { changes }));

  eventBus.on(EVENTS.TASK_STATUS_CHANGED, ({ taskId, changedBy, projectId, workspaceId, oldStatus, newStatus }) =>
    log(ACTIVITY_ACTION.STATUS_CHANGED, changedBy, 'task', taskId, workspaceId, projectId, { oldStatus, newStatus }));

  eventBus.on(EVENTS.TASK_ASSIGNED, ({ taskId, assignedBy, projectId, workspaceId, assigneeId }) =>
    log(ACTIVITY_ACTION.ASSIGNED, assignedBy, 'task', taskId, workspaceId, projectId, { assigneeId }));

  eventBus.on(EVENTS.TASK_DELETED, ({ taskId, deletedBy, workspaceId }) =>
    log(ACTIVITY_ACTION.DELETED, deletedBy, 'task', taskId, workspaceId, null));

  // Project events
  eventBus.on(EVENTS.PROJECT_CREATED, ({ projectId, createdBy, workspaceId, name }) =>
    log(ACTIVITY_ACTION.CREATED, createdBy, 'project', projectId, workspaceId, projectId, { name }));

  eventBus.on(EVENTS.PROJECT_UPDATED, ({ projectId, updatedBy, workspaceId, changes }) =>
    log(ACTIVITY_ACTION.UPDATED, updatedBy, 'project', projectId, workspaceId, projectId, { changes }));

  eventBus.on(EVENTS.PROJECT_MEMBER_ADDED, ({ projectId, addedBy, workspaceId, memberId }) =>
    log(ACTIVITY_ACTION.ASSIGNED, addedBy, 'project', projectId, workspaceId, projectId, { memberId }));

  // Comment events
  eventBus.on(EVENTS.COMMENT_CREATED, ({ commentId, authorId, targetType, targetId }) =>
    log(ACTIVITY_ACTION.COMMENTED, authorId, targetType, targetId, null, null, { commentId }));

  console.log('[collaboration.events] registered');
};

module.exports = { register };
