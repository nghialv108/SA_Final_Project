const { Router } = require('express');
const { createServiceProxy } = require('../proxy/proxy.handler');
const { getService } = require('../proxy/serviceRegistry');
const { breakers } = require('../proxy/circuitBreaker');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = Router();
const { url } = getService('iam');
const breaker = breakers.iam.middleware();

/**
 * /api/iam/auth/*   — Public, rate limit chặt
 * /api/iam/users/*  — Protected
 * /api/iam/workspaces/* — Protected
 */
router.use('/auth', authLimiter, breaker, createServiceProxy(url, '/iam/auth'));
router.use('/users', breaker, createServiceProxy(url, '/iam/users'));
router.use('/workspaces', breaker, createServiceProxy(url, '/iam/workspaces'));

module.exports = router;
