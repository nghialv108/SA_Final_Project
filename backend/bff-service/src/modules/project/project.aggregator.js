const { settleAll, requireAll } = require('../../clients/http/parallel.helper');
const coreClient                = require('../../clients/services/core.client');
const iamClient                 = require('../../clients/services/iam.client');

// ── Transformers ──────────────────────────────────────────────────────────────
const transformList = (projects) =>
  (projects || []).map((p) => ({
    projectId:   p._id,
    name:        p.name,
    description: p.description,
    visibility:  p.visibility,
    memberCount: p.members?.length ?? 0,
    isArchived:  p.isArchived,
    createdAt:   p.createdAt,
  }));

const transformDetail = (raw) => {
  const p = raw.project?.data;
  if (!p) return null;
  return {
    projectId:    p._id,
    name:         p.name,
    description:  p.description,
    visibility:   p.visibility,
    ownerId:      p.ownerId,
    members:      p.members || [],
    milestones:   (p.milestones || []).map((m) => ({
      milestoneId: m._id,
      title:       m.title,
      dueDate:     m.dueDate,
      isCompleted: m.isCompleted,
    })),
    taskSummary: buildTaskSummary(raw.tasks?.data || []),
    recentActivity: (raw.activity?.data || []).slice(0, 10).map((a) => ({
      action:    a.action,
      actorId:   a.actorId,
      meta:      a.meta,
      createdAt: a.createdAt,
    })),
    createdAt:    p.createdAt,
  };
};

const buildTaskSummary = (tasks) => ({
  total:      tasks.length,
  todo:       tasks.filter((t) => t.status === 'todo').length,
  inProgress: tasks.filter((t) => t.status === 'in_progress').length,
  done:       tasks.filter((t) => t.status === 'done').length,
});

// ── Aggregators ───────────────────────────────────────────────────────────────
const aggregateList = async (user) => {
  const result = await coreClient.getProjects(user);
  return transformList(result?.data || []);
};

const aggregateDetail = async (user, projectId) => {
  const raw = await settleAll({
    project:  coreClient.getProjectById(projectId, user),
    tasks:    coreClient.getTasksByProject(projectId, user),
    activity: coreClient.getActivityByProject(projectId, user),
  });
  return transformDetail(raw);
};

// ── Routes ────────────────────────────────────────────────────────────────────
const { Router } = require('express');
const response   = require('../../shared/utils/response');
const router     = Router();

/**
 * GET /bff/projects         — danh sách project (card view)
 * GET /bff/projects/:id     — project detail + tasks + activity
 */
router.get('/', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateList(req.user));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateDetail(req.user, req.params.id));
  } catch (e) { next(e); }
});

module.exports = router;
