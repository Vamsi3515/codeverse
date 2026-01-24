// Script to check and create organizer account for 22b61a0557@sitam.co.in
require('dotenv').config();
const mongoose = require('mongoose');
const Organizer = require('./src/models/Organizer');

const ORGANIZER_EMAIL = '22b61a0557@sitam.co.in';

async function checkOrganizer() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if organizer exists
    const organizer = await Organizer.findOne({ email: ORGANIZER_EMAIL });

    if (organizer) {
      console.log('\n✅ ORGANIZER FOUND:');
      console.log('ID:', organizer._id);
      console.log('Name:', organizer.firstName, organizer.lastName);
      console.log('Email:', organizer.email);
      console.log('Role:', organizer.role);
      console.log('College:', organizer.college);
      console.log('Email Verified:', organizer.isEmailVerified);
      console.log('Proof Document:', organizer.proofDocument ? 'Yes' : 'No');
      console.log('Created At:', organizer.createdAt);
      console.log('\nOrganizer account exists and is ready to use! ✅');
    } else {
      console.log('\n❌ ORGANIZER NOT FOUND');
      console.log('Email:', ORGANIZER_EMAIL);
      console.log('\nTo create an organizer account:');
      console.log('1. Go to the registration page');
      console.log('2. Use email:', ORGANIZER_EMAIL);
      console.log('3. Complete OTP verification');
      console.log('4. Upload proof document');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOrganizer();
