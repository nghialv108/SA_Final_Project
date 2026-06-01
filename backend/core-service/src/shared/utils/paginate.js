/**
 * Parse pagination params từ query string.
 * Dùng: const { page, limit, skip } = parsePagination(req.query);
 */
const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page  || 1,  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Tạo metadata pagination để gắn vào response.
 */
const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = { parsePagination, paginationMeta };
