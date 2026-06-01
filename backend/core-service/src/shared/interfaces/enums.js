// ── Task Status ───────────────────────────────────────────────────────────────
const TASK_STATUS = {
  TODO:        'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW:   'in_review',
  DONE:        'done',
  CANCELLED:   'cancelled',
};

// ── Task Priority ─────────────────────────────────────────────────────────────
const TASK_PRIORITY = {
  LOW:    'low',
  MEDIUM: 'medium',
  HIGH:   'high',
  URGENT: 'urgent',
};

// ── Project Visibility ────────────────────────────────────────────────────────
const PROJECT_VISIBILITY = {
  PUBLIC:  'public',
  PRIVATE: 'private',
};

// ── Role (mirror từ IAM, dùng để check quyền trong core) ─────────────────────
const ROLE = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  MEMBER:  'member',
};

// ── Notification Type ─────────────────────────────────────────────────────────
const NOTIFICATION_TYPE = {
  TASK_ASSIGNED:       'task_assigned',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_DUE_SOON:       'task_due_soon',
  COMMENT_MENTION:     'comment_mention',
  PROJECT_INVITE:      'project_invite',
  GENERAL:             'general',
};

// ── Notification Channel ──────────────────────────────────────────────────────
const NOTIFICATION_CHANNEL = {
  IN_APP: 'in_app',
  EMAIL:  'email',
  PUSH:   'push',
};

// ── Activity Action ───────────────────────────────────────────────────────────
const ACTIVITY_ACTION = {
  CREATED:        'created',
  UPDATED:        'updated',
  DELETED:        'deleted',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED:       'assigned',
  COMMENTED:      'commented',
  MENTIONED:      'mentioned',
  UPLOADED:       'uploaded',
};

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  PROJECT_VISIBILITY,
  ROLE,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  ACTIVITY_ACTION,
};
