const { settleAll }     = require('../../clients/http/parallel.helper');
const iamClient         = require('../../clients/services/iam.client');
const coreClient        = require('../../clients/services/core.client');

// ── Transformer ───────────────────────────────────────────────────────────────
/**
 * Reshape dữ liệu thô từ nhiều service thành shape gọn nhẹ cho Mobile.
 * Mỗi field đều có fallback an toàn để tránh crash khi 1 service trả null.
 */
const transform = (raw) => ({
  profile: raw.profile?.data
    ? {
        userId:    raw.profile.data._id,
        fullName:  raw.profile.data.fullName,
        avatarUrl: raw.profile.data.avatarUrl  || null,
        role:      raw.profile.data.role,
      }
    : null,

  workspace: raw.workspace?.data
    ? {
        workspaceId: raw.workspace.data._id,
        name:        raw.workspace.data.name,
        slug:        raw.workspace.data.slug,
      }
    : null,

  // Chỉ lấy 5 project gần nhất, chỉ giữ field cần thiết
  recentProjects: (raw.projects?.data || []).slice(0, 5).map((p) => ({
    projectId: p._id,
    name:      p.name,
    visibility:p.visibility,
  })),

  // Task summary: đếm theo trạng thái
  taskSummary: buildTaskSummary(raw.myTasks?.data || []),

  // Notification badge
  unreadCount: raw.unreadCount?.data?.count ?? 0,

  // Activity feed: 5 hoạt động gần nhất
  recentActivity: (raw.activity?.data || []).slice(0, 5).map((a) => ({
    action:     a.action,
    targetType: a.targetType,
    targetId:   a.targetId,
    actorId:    a.actorId,
    createdAt:  a.createdAt,
    meta:       a.meta || {},
  })),
});

const buildTaskSummary = (tasks) => ({
  total:      tasks.length,
  todo:       tasks.filter((t) => t.status === 'todo').length,
  inProgress: tasks.filter((t) => t.status === 'in_progress').length,
  inReview:   tasks.filter((t) => t.status === 'in_review').length,
  done:       tasks.filter((t) => t.status === 'done').length,
});

// ── Aggregator ────────────────────────────────────────────────────────────────
/**
 * Dashboard aggregator — gọi 6 service song song, partial failure safe.
 * Mobile home screen nhận đủ data trong 1 request thay vì 6 request riêng.
 */
const aggregate = async (user) => {
  const raw = await settleAll({
    profile:     iamClient.getProfile(user),
    workspace:   iamClient.getMyWorkspace(user),
    projects:    coreClient.getProjects(user),
    myTasks:     coreClient.getMyTasks(user),
    unreadCount: coreClient.getUnreadCount(user),
    activity:    coreClient.getActivityByWorkspace(user),
  });

  return transform(raw);
};

// ── Routes ────────────────────────────────────────────────────────────────────
const { Router } = require('express');
const response   = require('../../shared/utils/response');
const router     = Router();

/**
 * GET /bff/dashboard
 * Mobile home screen — profile + workspace + projects + tasks + notifications + activity
 */
router.get('/', async (req, res, next) => {
  try {
    return response.ok(res, await aggregate(req.user));
  } catch (e) { next(e); }
});

module.exports = router;
