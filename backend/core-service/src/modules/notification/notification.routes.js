const { Router } = require('express');
const svc        = require('./notification.service');
const response   = require('../../shared/utils/response');

const router = Router();

router.get('/',             async (req, res, next) => { try { return response.ok(res, await svc.getMyNotifications(req.user)); } catch (e) { next(e); } });
router.get('/unread-count', async (req, res, next) => { try { return response.ok(res, { count: await svc.getUnreadCount(req.user) }); } catch (e) { next(e); } });

// /read-all PHẢI đứng trước /:id/read — tránh Express match 'read-all' vào :id
router.patch('/read-all',   async (req, res, next) => { try { await svc.markAllAsRead(req.user); return response.ok(res, null, 'All marked as read'); } catch (e) { next(e); } });
router.patch('/:id/read',   async (req, res, next) => { try { return response.ok(res, await svc.markAsRead(req.user, req.params.id), 'Marked as read'); } catch (e) { next(e); } });

module.exports = router;
