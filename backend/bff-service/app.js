const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const env           = require('./src/shared/config/environment');
const gatewayAuth   = require('./src/shared/middlewares/gatewayAuth.middleware');
const deviceInfo    = require('./src/shared/middlewares/deviceInfo.middleware');
const errorHandler  = require('./src/shared/middlewares/errorHandler');

// ── Module routers (mỗi file là aggregator + transformer + routes gộp lại) ───
const dashboardRoutes    = require('./src/modules/dashboard/dashboard.aggregator');
const projectRoutes      = require('./src/modules/project/project.aggregator');
const taskRoutes         = require('./src/modules/task/task.aggregator');
const userRoutes         = require('./src/modules/user/user.aggregator');
const notificationRoutes = require('./src/modules/notification/notification.aggregator');

const app = express();

// ── Security & Utility ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check (bypass auth — gateway cần ping) ─────────────────────────────
app.get('/health', (_, res) =>
  res.json({ success: true, service: 'bff-service', status: 'UP' })
);

// ── Trust Gate + Device Context ───────────────────────────────────────────────
// Áp dụng toàn bộ /bff/** :
//   1. gatewayAuth  → verify x-internal-secret, extract req.user từ headers
//   2. deviceInfo   → extract req.device từ headers (platform, appVersion)
app.use('/bff', gatewayAuth, deviceInfo);

// ── BFF Routes ────────────────────────────────────────────────────────────────
//
//  GET  /bff/dashboard                  ← home screen
//
//  GET  /bff/projects                   ← project list
//  GET  /bff/projects/:id               ← project detail + tasks + activity
//
//  GET  /bff/tasks?projectId=xxx        ← task board
//  GET  /bff/tasks/mine                 ← my tasks
//  GET  /bff/tasks/:id                  ← task detail + subtasks + comments
//
//  GET  /bff/users/me                   ← profile + workspace + task summary
//  GET  /bff/users/members              ← workspace members (assignee picker)
//
//  GET   /bff/notifications             ← inbox
//  PATCH /bff/notifications/:id/read    ← mark read
//  PATCH /bff/notifications/read-all    ← mark all read

app.use('/bff/dashboard',      dashboardRoutes);
app.use('/bff/projects',       projectRoutes);
app.use('/bff/tasks',          taskRoutes);
app.use('/bff/users',          userRoutes);
app.use('/bff/notifications',  notificationRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  })
);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
