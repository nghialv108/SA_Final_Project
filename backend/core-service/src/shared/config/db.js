const mongoose = require('mongoose');
const env      = require('./environment');

const connect = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('[core-service] MongoDB connected');
  } catch (err) {
    console.error('[core-service] MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { connect };
