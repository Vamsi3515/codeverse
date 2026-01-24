require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function listUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('email firstName lastName isEmailVerified collegeIdCard liveSelfie');
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log(`   College ID: ${user.collegeIdCard ? '✅ Uploaded' : '❌ Missing'}`);
      console.log(`   Live Selfie: ${user.liveSelfie ? '✅ Uploaded' : '❌ Missing'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
