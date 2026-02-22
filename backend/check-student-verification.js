// Script to check student account verification status
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./src/models/Student');

const EMAIL = '22b61a0557@sitam.co.in';

async function checkStudentStatus() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const student = await Student.findOne({ email: EMAIL }).select('+password');
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('📋 STUDENT VERIFICATION STATUS');
    console.log('='.repeat(60));
    console.log('Name:', student.firstName, student.lastName);
    console.log('Email:', student.email);
    console.log('College:', student.college);
    console.log('Branch:', student.branch);
    console.log('Semester:', student.semester);
    console.log('\n✅ Email Verified:', student.isEmailVerified);
    console.log('✅ College ID Card:', student.collegeIdCard ? '✓ Uploaded' : '✗ Missing');
    console.log('✅ Live Selfie:', student.liveSelfie ? '✓ Uploaded' : '✗ Missing');
    console.log('✅ Password Set:', student.password ? 'Yes' : 'No');
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🔍 LOGIN STATUS:');
    
    const canLogin = student.isEmailVerified &&
                     student.collegeIdCard &&
                     student.liveSelfie &&
                     student.password;
    
    if (canLogin) {
      console.log('✅ Student can login as organizer (exception email)');
      console.log('   Login URL: POST /api/auth/organizer/login');
      console.log('   Email:', student.email);
    } else {
      console.log('❌ Cannot login yet. Missing:');
      if (!student.isEmailVerified) console.log('   - Email verification');
      if (!student.collegeIdCard) console.log('   - College ID Card');
      if (!student.liveSelfie) console.log('   - Live Selfie');
      if (!student.password) console.log('   - Password');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStudentStatus();
