const { Router } = require('express');
const multer     = require('multer');
const svc        = require('./attachment.service');
const response   = require('../../shared/utils/response');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

// GET  /core/attachments?targetId=xxx&targetType=task
router.get('/', async (req, res, next) => {
  try {
    const { targetId, targetType } = req.query;
    return response.ok(res, await svc.getAttachments(targetId, targetType));
  } catch (e) { next(e); }
});

// GET /core/attachments/storage — PHẢI đứng trước /:id tránh Express match 'storage' vào :id
router.get('/storage', async (req, res, next) => {
  try {
    const used = await svc.getWorkspaceStorageUsed(req.user.workspaceId);
    return response.ok(res, { usedBytes: used });
  } catch (e) { next(e); }
});

// POST /core/attachments
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    return response.created(res, await svc.uploadAttachment(req.user, req.file, req.body));
  } catch (e) { next(e); }
});

// DELETE /core/attachments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteAttachment(req.user, req.params.id);
    return response.ok(res, null, 'Attachment deleted');
  } catch (e) { next(e); }
});

module.exports = router;
