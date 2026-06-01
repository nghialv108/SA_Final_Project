/**
 * ServiceUnavailableError
 * Downstream service không thể kết nối (timeout, network, ECONNREFUSED).
 * → HTTP 502 Bad Gateway
 */
class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name        = 'ServiceUnavailableError';
    this.statusCode  = 502;
    this.isOperational = true;
  }
}

/**
 * ServiceResponseError
 * Downstream service phản hồi với status code lỗi (4xx / 5xx).
 * Giữ nguyên statusCode để BFF có thể forward lên client.
 * → HTTP status tương ứng (403, 404, 422, 500...)
 */
class ServiceResponseError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name        = 'ServiceResponseError';
    this.statusCode  = statusCode;
    this.isOperational = true;
  }
}

module.exports = { ServiceUnavailableError, ServiceResponseError };
