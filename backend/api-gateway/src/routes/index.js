const { Router } = require('express');
const iamRoutes = require('./iam.routes');
const coreRoutes = require('./core.routes');
const bffRoutes = require('./bff.routes');
const searchRoutes = require('./search.routes');
const reportRoutes = require('./report.routes');

const router = Router();

/**
 * Route map:
 *
 *   /api/iam/**   → iam-service   (rewrite: /api/iam  → /iam)
 *   /api/core/**  → core-service  (rewrite: /api/core → /core)
 *   /api/bff/**     → bff-service
 *   /api/search/**  → search-service
 *   /api/reports/** → report-service
 */
router.use('/iam', iamRoutes);
router.use('/core', coreRoutes);
router.use('/bff', bffRoutes);
router.use('/search', searchRoutes);
router.use('/reports', reportRoutes);

module.exports = router;