const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Tạo proxy middleware cho một downstream service.
 *
 * @param {string} targetUrl - URL của service
 * @param {string} prefix    - Prefix thêm vào path sau khi rewrite
 * @param {object} breaker   - CircuitBreaker instance (optional) để track lỗi thực tế
 */
const createServiceProxy = (targetUrl, prefix = '', breaker = null) =>
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (path) => prefix + path,

    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[PROXY] ${req.method} ${req.path} → ${targetUrl}${proxyReq.path}`);
        if (req.headers['x-internal-secret']) {
          proxyReq.setHeader('x-internal-secret', req.headers['x-internal-secret']);
        }
        if (req.headers['x-user-id']) {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
        if (req.headers['x-user-role']) {
          proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
        if (req.headers['x-workspace-id']) {
          proxyReq.setHeader('x-workspace-id', req.headers['x-workspace-id']);
        }
      },

      // Track response status để circuit breaker phản ánh đúng thực tế
      proxyRes: (proxyRes, req) => {
        if (breaker && proxyRes.statusCode >= 500) {
          breaker._onFailure();
        } else if (breaker) {
          breaker._onSuccess();
        }
      },

      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${req.method} ${req.path}`, err.message);
        if (breaker) breaker._onFailure();
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Service temporarily unavailable. Please try again.',
          });
        }
      },
    },
  });

module.exports = { createServiceProxy };
