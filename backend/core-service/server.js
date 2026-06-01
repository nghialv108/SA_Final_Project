const { createApp, registerAllEvents } = require('./app');
const { connect } = require('./src/shared/config/db');
const env         = require('./src/shared/config/environment');

const start = async () => {
  // 1. Connect DB
  await connect();

  // 2. Register all inter-module event listeners
  registerAllEvents();

  // 3. Start HTTP server
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[core-service] running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log('  GET  /core/projects');
    console.log('  GET  /core/tasks?projectId=xxx');
    console.log('  GET  /core/collaboration/comments?targetId=xxx&targetType=task');
    console.log('  GET  /core/notifications');
    console.log('  GET  /core/analytics/burndown?projectId=xxx&from=&to=');
  });
};

start();
