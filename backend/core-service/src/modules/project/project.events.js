const eventBus    = require('../../shared/events/eventBus');
const EVENTS      = require('../../shared/events/eventNames');
const projectRepo = require('./project.repository');

/**
 * Project module lắng nghe các event liên quan đến chính nó.
 * Ví dụ: khi một user bị xóa khỏi workspace (từ IAM),
 * project module cần remove user đó khỏi tất cả project.
 *
 * Hiện tại: khi task bị xóa không cần project xử lý gì thêm.
 * File này sẵn sàng để mở rộng.
 */
const register = () => {
  // Placeholder — mở rộng khi cần
  // eventBus.on(EVENTS.SOME_EVENT, async (payload) => { ... });

  console.log('[project.events] registered');
};

module.exports = { register };
