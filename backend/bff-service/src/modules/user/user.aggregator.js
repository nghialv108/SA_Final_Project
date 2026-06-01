const { settleAll } = require('../../clients/http/parallel.helper');
const iamClient     = require('../../clients/services/iam.client');
const coreClient    = require('../../clients/services/core.client');

// ── Transformer ───────────────────────────────────────────────────────────────
const transformProfile = (raw) => {
  const u = raw.profile?.data;
  const w = raw.workspace?.data;
  if (!u) return null;
  return {
    userId:      u._id,
    fullName:    u.fullName,
    email:       u.email,
    avatarUrl:   u.avatarUrl  || null,
    role:        u.role,
    isVerified:  u.isVerified,
    lastLoginAt: u.lastLoginAt || null,
    workspace: w
      ? { workspaceId: w._id, name: w.name, slug: w.slug }
      : null,
    taskSummary: buildTaskSummary(raw.myTasks?.data || []),
  };
};

const buildTaskSummary = (tasks) => ({
  total:      tasks.length,
  inProgress: tasks.filter((t) => t.status === 'in_progress').length,
  overdue:    tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
});

const transformMemberList = (members) =>
  (members || []).map((m) => ({
    userId:    m._id,
    fullName:  m.fullName,
    avatarUrl: m.avatarUrl || null,
    role:      m.role,
  }));

// ── Aggregators ───────────────────────────────────────────────────────────────
const aggregateMe = async (user) => {
  const raw = await settleAll({
    profile:   iamClient.getProfile(user),
    workspace: iamClient.getMyWorkspace(user),
    myTasks:   coreClient.getMyTasks(user),
  });
  return transformProfile(raw);
};

const aggregateMembers = async (user) => {
  const result = await iamClient.getWorkspaceMembers(user.workspaceId, user);
  return transformMemberList(result?.data || []);
};

// ── Routes ────────────────────────────────────────────────────────────────────
const { Router } = require('express');
const response   = require('../../shared/utils/response');
const router     = Router();

/**
 * GET /bff/users/me          — full profile + workspace + task summary
 * GET /bff/users/members     — workspace member list (for assignee picker)
 */
router.get('/me', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateMe(req.user));
  } catch (e) { next(e); }
});

router.get('/members', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateMembers(req.user));
  } catch (e) { next(e); }
});

module.exports = router;
