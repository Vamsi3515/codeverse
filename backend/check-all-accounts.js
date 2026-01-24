// Script to check all accounts for 22b61a0557@sitam.co.in
require('dotenv').config();
const mongoose = require('mongoose');
const Organizer = require('./src/models/Organizer');
const Student = require('./src/models/Student');
const User = require('./src/models/User');

const EMAIL = '22b61a0557@sitam.co.in';

async function checkAllAccounts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('Checking email:', EMAIL);
    console.log('='.repeat(60));

    // Check Organizer collection
    const organizer = await Organizer.findOne({ email: EMAIL });
    console.log('\n📋 ORGANIZER COLLECTION:');
    if (organizer) {
      console.log('✅ Found:', organizer.firstName, organizer.lastName);
      console.log('   ID:', organizer._id);
      console.log('   Role:', organizer.role);
      console.log('   Email Verified:', organizer.isEmailVerified);
      console.log('   Proof Document:', organizer.proofDocument ? 'Yes' : 'No');
    } else {
      console.log('❌ Not found');
    }

    // Check Student collection
    const student = await Student.findOne({ email: EMAIL });
    console.log('\n📋 STUDENT COLLECTION:');
    if (student) {
      console.log('✅ Found:', student.firstName, student.lastName);
      console.log('   ID:', student._id);
      console.log('   Email Verified:', student.isEmailVerified);
      console.log('   College:', student.college);
    } else {
      console.log('❌ Not found');
    }

    // Check User collection (legacy)
    const user = await User.findOne({ email: EMAIL });
    console.log('\n📋 USER COLLECTION (legacy):');
    if (user) {
      console.log('✅ Found:', user.firstName, user.lastName);
      console.log('   ID:', user._id);
      console.log('   Role:', user.role);
    } else {
      console.log('❌ Not found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🔍 SUMMARY:');
    if (organizer) {
      console.log('✅ Organizer account exists - can login via /api/auth/organizer/login');
    } else if (student) {
      console.log('⚠️  Student account exists (exception email) - can login via organizer login');
    } else if (user) {
      console.log('⚠️  Legacy user account exists');
    } else {
      console.log('❌ No account found - needs to register first');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllAccounts();
