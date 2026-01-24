const mongoose = require('mongoose');
const dns = require('dns');

/**
 * Connect to MongoDB Database
 * Real connection mode - throws error if connection fails
 */
const connectDB = async () => {
  try {
    const customDns = process.env.MONGO_DNS_SERVERS;
    if (customDns) {
      const servers = customDns.split(',').map((s) => s.trim()).filter(Boolean);
      if (servers.length > 0) {
        dns.setServers(servers);
        console.log(`🧭 Using DNS servers: ${servers.join(', ')}`);
      }
    }

    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGO_URI or MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(uri);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed');
    console.error(`   Error: ${error.message}`);
    
    // Stop the server if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
