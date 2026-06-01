/**
 * Tất cả tên event nội bộ của core-service.
 * Dùng constant thay vì string để tránh typo và dễ refactor.
 *
 * Convention: {MODULE}_{ACTION}
 */
const EVENTS = {
  // ── Task events ──────────────────────────────────────────────────
  TASK_CREATED:         'task.created',
  TASK_UPDATED:         'task.updated',
  TASK_DELETED:         'task.deleted',
  TASK_ASSIGNED:        'task.assigned',        // Gán assignee
  TASK_STATUS_CHANGED:  'task.status_changed',  // Đổi trạng thái
  TASK_COMMENT_ADDED:   'task.comment_added',   // Có comment mới

  // ── Project events ───────────────────────────────────────────────
  PROJECT_CREATED:      'project.created',
  PROJECT_UPDATED:      'project.updated',
  PROJECT_DELETED:      'project.deleted',
  PROJECT_MEMBER_ADDED: 'project.member_added',
  PROJECT_MEMBER_REMOVED: 'project.member_removed',

  // ── Collaboration events ─────────────────────────────────────────
  COMMENT_CREATED:      'collaboration.comment_created',
  REACTION_ADDED:       'collaboration.reaction_added',
  MENTION_CREATED:      'collaboration.mention_created',

  // ── Attachment events ────────────────────────────────────────────
  ATTACHMENT_UPLOADED:  'attachment.uploaded',
  ATTACHMENT_DELETED:   'attachment.deleted',
};

module.exports = EVENTS;
