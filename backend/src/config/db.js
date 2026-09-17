const mongoose = require('mongoose');
const os = require('os');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      runtimeAdapters: { os },
    });
    console.log(`[CyberTrace] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[CyberTrace] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
