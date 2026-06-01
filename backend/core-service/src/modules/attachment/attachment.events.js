const eventBus = require('../../shared/events/eventBus');
const EVENTS   = require('../../shared/events/eventNames');

const register = () => {
  // Khi task bị xóa, attachment service có thể dọn file
  // (để đơn giản: log ra, production nên queue cleanup job)
  eventBus.on(EVENTS.TASK_DELETED, ({ taskId }) => {
    console.log(`[attachment.events] task ${taskId} deleted — schedule file cleanup`);
  });

  console.log('[attachment.events] registered');
};

module.exports = { register };
