require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function clearUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users before deletion
    const users = await User.find({}).select('email role isEmailVerified');
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Verified: ${user.isEmailVerified}`);
    });

    console.log('\n🗑️  Deleting all users...');
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} user(s)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearUsers();
