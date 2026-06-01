const logger = require('../../shared/utils/logger');

/**
 * Chạy nhiều promise song song, xử lý partial failure.
 *
 * Dùng Promise.allSettled thay vì Promise.all để đảm bảo:
 *   - 1 service chết KHÔNG làm sập toàn bộ aggregation
 *   - Response vẫn được trả về với phần dữ liệu có sẵn
 *   - Phần thất bại trả về null (transformer tự xử lý fallback)
 *
 * @param {Record<string, Promise>} promiseMap - { key: promise }
 * @returns {Record<string, any>}              - { key: data | null }
 *
 * @example
 * const { profile, tasks } = await settleAll({
 *   profile: iamClient.getProfile(userId),
 *   tasks:   coreClient.getTasks(userId),
 * });
 * // tasks có thể là null nếu core-service down
 */
const settleAll = async (promiseMap) => {
  const keys    = Object.keys(promiseMap);
  const results = await Promise.allSettled(Object.values(promiseMap));

  return keys.reduce((acc, key, i) => {
    const result = results[i];
    if (result.status === 'fulfilled') {
      acc[key] = result.value;
    } else {
      logger.warn(`[parallel] "${key}" failed: ${result.reason?.message}`);
      acc[key] = null;
    }
    return acc;
  }, {});
};

/**
 * Variant ném lỗi nếu BẤT KỲ promise nào fail.
 * Dùng cho các call quan trọng mà thiếu 1 là response vô nghĩa.
 *
 * @param {Record<string, Promise>} promiseMap
 */
const requireAll = async (promiseMap) => {
  const keys    = Object.keys(promiseMap);
  const values  = await Promise.all(Object.values(promiseMap));
  return keys.reduce((acc, key, i) => { acc[key] = values[i]; return acc; }, {});
};

module.exports = { settleAll, requireAll };
