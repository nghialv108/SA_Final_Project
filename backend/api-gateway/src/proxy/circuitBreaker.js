const axios = require('axios');

const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

/**
 * Circuit Breaker đơn giản theo pattern State Machine.
 *
 * CLOSED    → request bình thường, đếm số lần fail
 * OPEN      → từ chối request ngay lập tức, chờ cooldown
 * HALF_OPEN → thử 1 request thăm dò, nếu pass → CLOSED, nếu fail → OPEN
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;    // Số lần fail để OPEN
    this.cooldownMs       = options.cooldownMs       || 30_000; // Thời gian chờ (ms)
    this.timeoutMs        = options.timeoutMs        || 5_000;  // Timeout mỗi request

    this.state       = STATE.CLOSED;
    this.failCount   = 0;
    this.lastFailAt  = null;
  }

  /**
   * Kiểm tra service có healthy không bằng cách gọi /health.
   * Dùng bởi middleware healthCheck route.
   */
  async checkHealth(serviceUrl) {
    try {
      await axios.get(`${serviceUrl}/health`, { timeout: this.timeoutMs });
      this._onSuccess();
      return true;
    } catch {
      this._onFailure();
      return false;
    }
  }

  /**
   * Express middleware — ngắt request ngay khi circuit OPEN.
   * Mount trước proxy handler của mỗi service.
   */
  middleware() {
    return (req, res, next) => {
      if (this.state === STATE.OPEN) {
        const elapsed = Date.now() - this.lastFailAt;

        // Cooldown xong → chuyển sang HALF_OPEN để thử lại
        if (elapsed >= this.cooldownMs) {
          this.state = STATE.HALF_OPEN;
          console.log('[CIRCUIT BREAKER] → HALF_OPEN, probing...');
          return next();
        }

        return res.status(503).json({
          success: false,
          message: 'Service circuit is open. Please retry shortly.',
        });
      }
      next();
    };
  }

  _onSuccess() {
    this.failCount = 0;
    if (this.state === STATE.HALF_OPEN) {
      this.state = STATE.CLOSED;
      console.log('[CIRCUIT BREAKER] → CLOSED');
    }
  }

  _onFailure() {
    this.failCount++;
    this.lastFailAt = Date.now();

    if (this.failCount >= this.failureThreshold || this.state === STATE.HALF_OPEN) {
      this.state = STATE.OPEN;
      console.log(`[CIRCUIT BREAKER] → OPEN (failures: ${this.failCount})`);
    }
  }
}

// Một instance per service
const breakers = {
  iam:    new CircuitBreaker(),
  core:   new CircuitBreaker(),
  bff:    new CircuitBreaker(),
  search: new CircuitBreaker(),
  report: new CircuitBreaker(),
};

module.exports = { breakers };
