const { EventEmitter } = require('events');

/**
 * EventBus nội bộ — giao tiếp giữa các module trong core-service.
 *
 * Quy tắc bắt buộc:
 *   ✅ Module A emit event  → Module B lắng nghe và xử lý
 *   ❌ Module A KHÔNG được require() service/repository của Module B
 *
 * Điều này giữ ranh giới module rõ ràng, dễ tách thành microservice sau.
 *
 * Ví dụ flow:
 *   task.events.js      → emit(TASK_ASSIGNED, { taskId, assigneeId })
 *   notification.events → listen TASK_ASSIGNED → tạo notification
 *   collaboration.events→ listen TASK_ASSIGNED → ghi activity log
 */
class EventBus extends EventEmitter {}

const eventBus = new EventBus();

// Tăng limit để tránh warning khi nhiều module đăng ký listener
eventBus.setMaxListeners(50);

// Log tất cả event trong development
if (process.env.NODE_ENV === 'development') {
  const originalEmit = eventBus.emit.bind(eventBus);
  eventBus.emit = (event, ...args) => {
    if (event !== 'error') {
      console.log(`[EventBus] emit → ${event}`, JSON.stringify(args[0] || {}));
    }
    return originalEmit(event, ...args);
  };
}

module.exports = eventBus;
