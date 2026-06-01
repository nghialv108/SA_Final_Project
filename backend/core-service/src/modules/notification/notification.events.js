const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');
const { _createAndSend } = require('./notification.service');
const { NOTIFICATION_TYPE, NOTIFICATION_CHANNEL } = require('../../shared/interfaces/enums');

/**
 * Notification module là "người đưa tin" của core-service.
 * Lắng nghe event từ mọi module khác, quyết định có gửi thông báo không.
 * KHÔNG import service/repo của module khác.
 */
const register = () => {
  const send = (payload) =>
    _createAndSend(payload).catch((e) =>
      console.error('[notification.events] send error:', e.message)
    );

  // Task được gán cho user
  eventBus.on(EVENTS.TASK_ASSIGNED, ({ taskId, title, assigneeId, assignedBy, projectId }) => {
    if (String(assigneeId) === String(assignedBy)) return; // Tự gán thì không báo
    send({
      recipientId: assigneeId,
      workspaceId: null,       // sẽ được enrich nếu cần
      type:    NOTIFICATION_TYPE.TASK_ASSIGNED,
      title:   `You have been assigned to "${title}"`,
      body:    '',
      channels:[NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL],
      refType: 'task', refId: taskId,
    });
  });

  // Task đổi trạng thái → báo cho người tạo/assignee
  eventBus.on(EVENTS.TASK_STATUS_CHANGED, ({ taskId, title, changedBy, assigneeId, newStatus }) => {
    if (!assigneeId || String(assigneeId) === String(changedBy)) return;
    send({
      recipientId: assigneeId,
      workspaceId: null,
      type:    NOTIFICATION_TYPE.TASK_STATUS_CHANGED,
      title:   `Task "${title}" moved to ${newStatus}`,
      body:    '',
      channels:[NOTIFICATION_CHANNEL.IN_APP],
      refType: 'task', refId: taskId,
    });
  });

  // Ai đó @mention trong comment
  eventBus.on(EVENTS.MENTION_CREATED, ({ commentId, authorId, mentionedUserIds, targetType, targetId }) => {
    mentionedUserIds
      .filter((uid) => String(uid) !== String(authorId))
      .forEach((recipientId) =>
        send({
          recipientId,
          workspaceId: null,
          type:    NOTIFICATION_TYPE.COMMENT_MENTION,
          title:   'You were mentioned in a comment',
          body:    '',
          channels:[NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL],
          refType: targetType, refId: targetId,
        })
      );
  });

  // Project invite
  eventBus.on(EVENTS.PROJECT_MEMBER_ADDED, ({ projectId, memberId, addedBy }) => {
    if (String(memberId) === String(addedBy)) return;
    send({
      recipientId: memberId,
      workspaceId: null,
      type:    NOTIFICATION_TYPE.PROJECT_INVITE,
      title:   'You have been added to a project',
      channels:[NOTIFICATION_CHANNEL.IN_APP],
      refType: 'project', refId: projectId,
    });
  });

  console.log('[notification.events] registered');
};

module.exports = { register };
