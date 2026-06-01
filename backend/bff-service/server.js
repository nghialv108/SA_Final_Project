const app = require('./app');
const env = require('./src/shared/config/environment');

app.listen(env.PORT, () => {
  console.log(`[bff-service] running on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`  IAM  → ${env.IAM_SERVICE_URL}`);
  console.log(`  Core → ${env.CORE_SERVICE_URL}`);
  console.log('  GET  /bff/dashboard');
  console.log('  GET  /bff/projects');
  console.log('  GET  /bff/tasks/mine');
  console.log('  GET  /bff/users/me');
  console.log('  GET  /bff/notifications');
});
