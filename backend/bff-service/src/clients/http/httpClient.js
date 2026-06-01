const env    = require('../../shared/config/environment');
const logger = require('../../shared/utils/logger');
const { ServiceUnavailableError, ServiceResponseError } = require('../../errors');

/**
 * Base HTTP client dùng cho mọi downstream call.
 *
 * Tính năng:
 *   - Timeout tự động (AbortSignal)
 *   - Forward x-user-* headers để downstream biết user context
 *   - Phân biệt ServiceUnavailableError (network fail) vs ServiceResponseError (4xx/5xx)
 *   - Log mọi request trong development
 */

/**
 * Xây dựng headers chung — forward user context + JSON content type
 */
const buildHeaders = (user = null, extra = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };

  if (user) {
    headers['x-user-id']      = String(user.userId);
    headers['x-user-role']    = String(user.role || '');
    headers['x-workspace-id'] = String(user.workspaceId || '');
  }

  return headers;
};

/**
 * Core request function
 *
 * @param {string} baseUrl    - URL của downstream service
 * @param {string} path       - path bắt đầu bằng /
 * @param {object} options    - { method, body, user, headers }
 * @param {number} timeoutMs  - override timeout
 */
const request = async (baseUrl, path, options = {}, timeoutMs = env.HTTP_TIMEOUT_MS) => {
  const { method = 'GET', body, user, headers: extraHeaders = {} } = options;
  const url = `${baseUrl}${path}`;

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);

  if (env.NODE_ENV === 'development') {
    logger.info(`[httpClient] ${method} ${url}`);
  }

  try {
    const res = await fetch(url, {
      method,
      headers: buildHeaders(user, extraHeaders),
      body:    body ? JSON.stringify(body) : undefined,
      signal:  controller.signal,
    });

    clearTimeout(timer);

    // Downstream trả lỗi (4xx / 5xx) — đọc body rồi throw có message
    if (!res.ok) {
      let errMsg = `${method} ${path} failed with status ${res.status}`;
      try {
        const errBody = await res.json();
        errMsg = errBody.message || errMsg;
      } catch { /* ignore parse error */ }

      throw new ServiceResponseError(errMsg, res.status);
    }

    return res.json();
  } catch (err) {
    clearTimeout(timer);

    if (err.name === 'AbortError') {
      throw new ServiceUnavailableError(`${baseUrl} timed out after ${timeoutMs}ms`);
    }
    if (err instanceof ServiceResponseError || err instanceof ServiceUnavailableError) {
      throw err;
    }
    // Network error (ECONNREFUSED, DNS, etc.)
    throw new ServiceUnavailableError(`${baseUrl} unreachable: ${err.message}`);
  }
};

// ── Convenience methods ───────────────────────────────────────────────────────
const get  = (baseUrl, path, user, headers)       => request(baseUrl, path, { method: 'GET',    user, headers });
const post = (baseUrl, path, body, user, headers)  => request(baseUrl, path, { method: 'POST',   body, user, headers });
const put  = (baseUrl, path, body, user, headers)  => request(baseUrl, path, { method: 'PUT',    body, user, headers });
const patch= (baseUrl, path, body, user, headers)  => request(baseUrl, path, { method: 'PATCH',  body, user, headers });
const del  = (baseUrl, path, user, headers)        => request(baseUrl, path, { method: 'DELETE', user, headers });

module.exports = { request, get, post, put, patch, del };
