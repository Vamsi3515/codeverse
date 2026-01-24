require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check for the student with the specific email (case-insensitive)
    const email = '22b61a0557@sitam.co.in';
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} NOT FOUND in User collection`);
      process.exit(0);
    }

    console.log(`✅ Found user in OLD User collection: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Is Verified: ${user.isVerified}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   College ID Card: ${user.collegeIdCard ? '✅ Uploaded' : '❌ Missing'}`);
    console.log(`   Live Selfie: ${user.liveSelfie ? '✅ Uploaded' : '❌ Missing'}`);
    console.log(`   Created At: ${user.createdAt}`);
    console.log('\n🔍 This account exists in OLD User collection but NOT in new Student collection!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
