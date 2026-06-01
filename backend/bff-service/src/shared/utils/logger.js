const env = require('../config/environment');

const log = (level, message, meta = {}) => {
  if (env.NODE_ENV === 'test') return;
  const entry = { level, message, ts: new Date().toISOString(), ...meta };
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
};

module.exports = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
