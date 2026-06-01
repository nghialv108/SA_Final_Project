const eventBus  = require('../../shared/events/eventBus');
const EVENTS    = require('../../shared/events/eventNames');
const taskRepo  = require('./task.repository');

/**
 * Task module lắng nghe event từ các module khác.
 * KHÔNG import service/repository của module khác — chỉ qua eventBus.
 */
const register = () => {
  // Khi project bị xóa → archive tất cả task thuộc project đó
  eventBus.on(EVENTS.PROJECT_DELETED, async ({ projectId }) => {
    try {
      await taskRepo.findByProject(projectId).then(async (tasks) => {
        await Promise.all(
          tasks.map((t) => taskRepo.updateById(t._id, { isArchived: true }))
        );
      });
      console.log(`[task.events] archived tasks of deleted project ${projectId}`);
    } catch (err) {
      console.error('[task.events] PROJECT_DELETED handler error:', err.message);
    }
  });

  console.log('[task.events] registered');
};

module.exports = { register };
