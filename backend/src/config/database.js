const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeverse_campus';

  try {
    const conn = await mongoose.connect(uri);
    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log('⚠️  MongoDB Connection Failed, running in static mode');
    console.log(`   Reason: ${error.message}`);
    console.log('   Server will continue with static responses');
    
    // DO NOT throw error - let server run without DB
    return false;
  }
};

module.exports = connectDB;
