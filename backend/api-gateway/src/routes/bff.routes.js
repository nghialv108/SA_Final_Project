const { Router } = require('express');
const { createServiceProxy } = require('../proxy/proxy.handler');
const { getService } = require('../proxy/serviceRegistry');
const { breakers } = require('../proxy/circuitBreaker');

const router = Router();
const { url, pathRewrite } = getService('bff');
const proxy = createServiceProxy(url, pathRewrite);

/**
 * /api/bff/**  — Aggregation endpoints dành cho Mobile client
 *
 * Bao gồm:
 *   /api/bff/dashboard
 *   /api/bff/projects/:id
 *   /api/bff/tasks/:id
 *   /api/bff/users/:id
 *   /api/bff/notifications
 *
 * pathRewrite: /api/bff/dashboard → /bff/dashboard
 */
router.use('/', breakers.bff.middleware(), proxy);

module.exports = router;
