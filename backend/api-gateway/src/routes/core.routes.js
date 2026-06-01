const { Router } = require('express');
const { createServiceProxy } = require('../proxy/proxy.handler');
const { getService } = require('../proxy/serviceRegistry');
const { breakers } = require('../proxy/circuitBreaker');

const router = Router();
const { url, pathRewrite } = getService('core');
const proxy = createServiceProxy(url, pathRewrite);

/**
 * /api/core/**  — Tất cả đều yêu cầu auth (đã xử lý global ở app.js)
 *
 * Bao gồm:
 *   /api/core/projects/**
 *   /api/core/tasks/**
 *   /api/core/collaboration/**
 *   /api/core/attachments/**
 *   /api/core/notifications/**
 *   /api/core/analytics/**
 *
 * pathRewrite: /api/core/projects/123 → /core/projects/123
 */
router.use('/', breakers.core.middleware(), proxy);

module.exports = router;
