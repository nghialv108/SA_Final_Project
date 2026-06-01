const { z }    = require('zod');
const { Router } = require('express');
const svc      = require('./collaboration.service');
const response = require('../../shared/utils/response');
const validate = require('../../shared/middlewares/validate.middleware');

// ── Schemas ───────────────────────────────────────────────────────────────────
const commentSchema = z.object({
  content:    z.string().min(1).max(5000),
  targetType: z.enum(['task', 'project']),
  targetId:   z.string().min(1),
});
const updateCommentSchema = z.object({ content: z.string().min(1).max(5000) });
const reactionSchema      = z.object({ emoji: z.string().min(1).max(10) });

// ── Controller ────────────────────────────────────────────────────────────────
const createComment      = async (req, res, next) => { try { return response.created(res, await svc.createComment(req.user, req.body)); } catch (e) { next(e); } };
const getComments        = async (req, res, next) => { try { return response.ok(res, await svc.getComments(req.query.targetId, req.query.targetType)); } catch (e) { next(e); } };
const updateComment      = async (req, res, next) => { try { return response.ok(res, await svc.updateComment(req.user, req.params.id, req.body.content), 'Comment updated'); } catch (e) { next(e); } };
const deleteComment      = async (req, res, next) => { try { await svc.deleteComment(req.user, req.params.id); return response.ok(res, null, 'Comment deleted'); } catch (e) { next(e); } };
const addReaction        = async (req, res, next) => { try { return response.ok(res, await svc.addReaction(req.user, req.params.id, req.body.emoji)); } catch (e) { next(e); } };
const removeReaction     = async (req, res, next) => { try { return response.ok(res, await svc.removeReaction(req.user, req.params.id, req.params.emoji)); } catch (e) { next(e); } };
const getActivityByTarget= async (req, res, next) => { try { return response.ok(res, await svc.getActivityByTarget(req.query.targetId, req.query.targetType)); } catch (e) { next(e); } };
const getActivityByProject  = async (req, res, next) => { try { return response.ok(res, await svc.getActivityByProject(req.params.projectId)); } catch (e) { next(e); } };
const getActivityByWorkspace= async (req, res, next) => { try { return response.ok(res, await svc.getActivityByWorkspace(req.user)); } catch (e) { next(e); } };

// ── Routes ────────────────────────────────────────────────────────────────────
const router = Router();

router.get('/comments',          getComments);                                      // ?targetId&targetType
router.post('/comments',         validate(commentSchema),       createComment);
router.put('/comments/:id',      validate(updateCommentSchema), updateComment);
router.delete('/comments/:id',                                  deleteComment);

router.post('/comments/:id/reactions',      validate(reactionSchema), addReaction);
router.delete('/comments/:id/reactions/:emoji',                       removeReaction);

router.get('/activities',                   getActivityByTarget);                   // ?targetId&targetType
router.get('/activities/workspace',         getActivityByWorkspace);
router.get('/activities/project/:projectId',getActivityByProject);

module.exports = router;
