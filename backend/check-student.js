require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./src/models/Student');

async function checkStudent() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check for the student with the specific email (case-insensitive)
    const email = '22b61a0557@sitam.co.in';
    const student = await Student.findOne({ email: email.toLowerCase() });
    
    if (!student) {
      console.log(`❌ Student with email ${email} NOT FOUND in Student collection`);
      process.exit(0);
    }

    console.log(`✅ Found student: ${student.firstName} ${student.lastName}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Email Verified (isEmailVerified): ${student.isEmailVerified}`);
    console.log(`   Email Verified (emailVerified): ${student.emailVerified}`);
    console.log(`   College ID Card: ${student.collegeIdCard ? '✅ Uploaded' : '❌ Missing'}`);
    console.log(`   Live Selfie: ${student.liveSelfie ? '✅ Uploaded' : '❌ Missing'}`);
    console.log(`   Created At: ${student.createdAt}`);
    console.log(`   Updated At: ${student.updatedAt}`);
    console.log('\n📋 Full Student Data:');
    console.log(JSON.stringify(student.toObject(), null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStudent();
