const { settleAll }  = require('../../clients/http/parallel.helper');
const coreClient     = require('../../clients/services/core.client');

// ── Transformers ──────────────────────────────────────────────────────────────
/**
 * Mobile task list — chỉ field cần hiển thị trên card
 */
const transformList = (tasks) =>
  (tasks || []).map((t) => ({
    taskId:     t._id,
    title:      t.title,
    status:     t.status,
    priority:   t.priority,
    assigneeId: t.assigneeId || null,
    dueDate:    t.dueDate    || null,
    hasSubTasks: t.parentTaskId === null, // rough indicator
    createdAt:  t.createdAt,
  }));

/**
 * Mobile task detail — đầy đủ + comments + subtasks
 */
const transformDetail = (raw) => {
  const t = raw.task?.data;
  if (!t) return null;
  return {
    taskId:           t._id,
    title:            t.title,
    description:      t.description,
    status:           t.status,
    priority:         t.priority,
    projectId:        t.projectId,
    assigneeId:       t.assigneeId    || null,
    createdBy:        t.createdBy,
    dueDate:          t.dueDate       || null,
    startDate:        t.startDate     || null,
    completedAt:      t.completedAt   || null,
    estimatedMinutes: t.estimatedMinutes,
    totalLoggedMinutes: (t.timeEntries || []).reduce((sum, e) => sum + (e.minutes || 0), 0),
    tags:             t.tags || [],
    subTasks: (raw.subTasks?.data || []).map((s) => ({
      taskId:  s._id,
      title:   s.title,
      status:  s.status,
    })),
    comments: (raw.comments?.data || [])
      .filter((c) => !c.isDeleted)
      .map((c) => ({
        commentId: c._id,
        content:   c.content,
        authorId:  c.authorId,
        reactions: c.reactions || [],
        isEdited:  c.isEdited,
        createdAt: c.createdAt,
      })),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};

// ── Aggregators ───────────────────────────────────────────────────────────────
const aggregateByProject = async (user, projectId) => {
  const result = await coreClient.getTasksByProject(projectId, user);
  return transformList(result?.data || []);
};

const aggregateMyTasks = async (user) => {
  const result = await coreClient.getMyTasks(user);
  return transformList(result?.data || []);
};

const aggregateDetail = async (user, taskId) => {
  const raw = await settleAll({
    task:     coreClient.getTaskById(taskId, user),
    subTasks: coreClient.getSubTasks(taskId, user),
    comments: coreClient.getComments(taskId, 'task', user),
  });
  return transformDetail(raw);
};

// ── Routes ────────────────────────────────────────────────────────────────────
const { Router } = require('express');
const response   = require('../../shared/utils/response');
const router     = Router();

/**
 * GET /bff/tasks?projectId=xxx  — task list của project (board view)
 * GET /bff/tasks/mine           — task được assign cho mình
 * GET /bff/tasks/:id            — task detail + subtasks + comments
 */
router.get('/mine', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateMyTasks(req.user));
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.query;
    return response.ok(res, await aggregateByProject(req.user, projectId));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    return response.ok(res, await aggregateDetail(req.user, req.params.id));
  } catch (e) { next(e); }
});

module.exports = router;
