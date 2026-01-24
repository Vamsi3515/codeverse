require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const bcrypt = require('bcryptjs');

async function migrateUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = '22b61a0557@sitam.co.in';
    const oldUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!oldUser) {
      console.log(`❌ Old user with email ${email} NOT FOUND`);
      process.exit(1);
    }

    console.log(`Found old user: ${oldUser.firstName} ${oldUser.lastName}`);
    console.log(`Email: ${oldUser.email}`);
    
    // Check if student already exists in new collection
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      console.log(`⚠️ Student already exists in new Student collection. Skipping migration.`);
      process.exit(0);
    }

    // Create new student document with data from old user
    const newStudent = new Student({
      firstName: oldUser.firstName,
      lastName: oldUser.lastName,
      email: oldUser.email,
      password: oldUser.password, // Password is already hashed in old model
      phone: oldUser.phone,
      college: oldUser.college,
      branch: oldUser.branch,
      semester: oldUser.semester,
      regNumber: oldUser.regNumber,
      profilePicture: oldUser.profilePicture,
      collegeIdCard: oldUser.collegeIdCard,
      collegeIdCardHash: oldUser.collegeIdCardHash,
      liveSelfie: oldUser.liveSelfie,
      selfieHash: oldUser.selfieHash,
      bio: oldUser.bio,
      skills: oldUser.skills,
      isVerified: oldUser.isVerified,
      emailVerified: oldUser.emailVerified,
      isEmailVerified: oldUser.emailVerified, // Use the verified flag from old model
      mobileVerified: oldUser.mobileVerified,
      cameraVerified: oldUser.cameraVerified,
    });

    // Save without pre-save hook since password is already hashed
    await Student.collection.insertOne(newStudent.toObject());
    
    console.log('\n✅ Successfully migrated user to new Student collection!');
    console.log(`Name: ${newStudent.firstName} ${newStudent.lastName}`);
    console.log(`Email: ${newStudent.email}`);
    console.log(`Email Verified: ${newStudent.isEmailVerified}`);
    console.log(`College ID: ${newStudent.collegeIdCard ? '✅ Uploaded' : '❌ Missing'}`);
    console.log(`Live Selfie: ${newStudent.liveSelfie ? '✅ Uploaded' : '❌ Missing'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateUser();
