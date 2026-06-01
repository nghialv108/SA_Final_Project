const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./src/config/environment');

const authMiddleware = require('./src/middlewares/auth.middleware');
const { globalLimiter } = require('./src/middlewares/rateLimit.middleware');
const { invalidateCacheHandler } = require('./src/middlewares/internalCache.middleware');
const routes = require('./src/routes/index');

const app = express();

// ─── Security & Utility ───────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// app.use(express.json());

// CORS: whitelist với callback — tường minh, dễ debug (từ V2)
const allowedOrigins = env.CORS_ORIGINS;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Global Rate Limit — trước auth để bảo vệ sớm nhất (từ V2) ───────────────
app.use(globalLimiter);

// ─── Health — trước auth, load balancer cần ping được ────────────────────────
app.get('/health', (_, res) =>
  res.json({ success: true, service: 'api-gateway', status: 'UP' })
);

// ─── Health aggregate — kiểm tra tất cả downstream services (từ V2) ──────────
app.get('/health/all', async (_, res) => {
  const axios = require('axios');
  const check = async (name, url) => {
    try {
      await axios.get(`${url}/health`, { timeout: 3000 });
      return { name, status: 'UP' };
    } catch {
      return { name, status: 'DOWN' };
    }
  };

  const results = await Promise.allSettled([
    check('iam-service', env.IAM_SERVICE_URL),
    check('core-service', env.CORE_SERVICE_URL),
    check('bff-service', env.BFF_SERVICE_URL),
    check('search-service', env.SEARCH_SERVICE_URL),
    check('report-service', env.REPORT_SERVICE_URL),
  ]);

  const services = results.map((r) => r.value || { name: 'unknown', status: 'DOWN' });
  const allUp = services.every((s) => s.status === 'UP');

  return res.status(allUp ? 200 : 207).json({
    success: allUp,
    gateway: 'UP',
    services,
  });
});

// ─── Internal cache invalidation — không qua auth (từ V1) ────────────────────
// IAM gọi endpoint này sau mỗi lần membership thay đổi
// Bảo vệ bằng x-internal-secret bên trong handler
app.post('/internal/cache/invalidate', invalidateCacheHandler);

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use(authMiddleware);

// ─── Public API Routes ────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  })
);

// ─── Error Handler ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err);
  res.status(500).json({ success: false, message: 'Internal gateway error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`[api-gateway] running on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`  /api/iam  → ${env.IAM_SERVICE_URL}`);
  console.log(`  /api/core → ${env.CORE_SERVICE_URL}`);
  console.log(`  /api/bff     → ${env.BFF_SERVICE_URL}`);
  console.log(`  /api/search  → ${env.SEARCH_SERVICE_URL}`);
  console.log(`  /api/reports → ${env.REPORT_SERVICE_URL}`);
  console.log(`  Redis     → ${env.REDIS_URL}`);
});

// Export để dễ viết integration test (từ V2)
module.exports = app;
