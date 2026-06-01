const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./src/shared/config/environment');
const trustedSource = require('./src/shared/middlewares/trustedSource.middleware');
const errorHandler = require('./src/shared/middlewares/errorHandler');

// ── Routes ────────────────────────────────────────────────────────────────────
const projectRoutes = require('./src/modules/project/project.routes');
const taskRoutes = require('./src/modules/task/task.routes');
const collaborationRoutes = require('./src/modules/collaboration/collaboration.routes');
const attachmentRoutes = require('./src/modules/attachment/attachment.routes');
const notificationRoutes = require('./src/modules/notification/notification.routes');
const { router: analyticsRoutes, registerEvents: registerAnalyticsEvents }
  = require('./src/modules/analytics/analytics.routes');

// ── Event Listeners ───────────────────────────────────────────────────────────
// Đăng ký tất cả event listener của các module
// Thứ tự không quan trọng — eventBus là async
const registerAllEvents = () => {
  require('./src/modules/project/project.events').register();
  require('./src/modules/task/task.events').register();
  require('./src/modules/collaboration/collaboration.events').register();
  require('./src/modules/attachment/attachment.events').register();
  require('./src/modules/notification/notification.events').register();
  registerAnalyticsEvents();
};

const createApp = () => {
  const app = express();

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health Check (bypass trustedSource) ────────────────────────────────────
  app.get('/health', (_, res) =>
    res.json({ success: true, service: 'core-service', status: 'UP' })
  );
  app.use('/', (req, res, next) =>
    console.log('Internal Secret:', req.headers['x-internal-secret']) ||
    console.log('User ID:', req.headers['x-user-id']) ||
    next()
  );
  // ── Trust Gate ─────────────────────────────────────────────────────────────
  // Mọi request vào /core/** đều phải có x-user-id từ gateway
  app.use('/core', trustedSource);

  // ── Module Routes — prefix /core/{module} ──────────────────────────────────
  //
  //  /core/projects/**
  //  /core/tasks/**
  //  /core/collaboration/**
  //  /core/attachments/**
  //  /core/notifications/**
  //  /core/analytics/**

  app.use('/core/projects', projectRoutes);
  app.use('/core/tasks', taskRoutes);
  app.use('/core/collaboration', collaborationRoutes);
  app.use('/core/attachments', attachmentRoutes);
  app.use('/core/notifications', notificationRoutes);
  app.use('/core/analytics', analyticsRoutes);

  // ── 404 ───────────────────────────────────────────────────────────────────
  app.use((req, res) =>
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
    })
  );

  // ── Global Error Handler ───────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = { createApp, registerAllEvents };
