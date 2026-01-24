#!/usr/bin/env node

/**
 * TEST: Delete Hackathon Authorization
 * 
 * This script helps debug the authorization issue with delete hackathon
 * 
 * Usage: node test-delete-authorization.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Organizer = require('./src/models/Organizer');
const Student = require('./src/models/Student');
const Hackathon = require('./src/models/Hackathon');

async function runTests() {
  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon');
    console.log('✅ Connected to MongoDB\n');

    // Find test organizer
    console.log('🔍 STEP 1: Finding test organizer (22b61a0557@sitam.co.in)');
    let organizer = await Student.findOne({ email: '22b61a0557@sitam.co.in' });
    
    if (!organizer) {
      console.log('   ❌ Organizer not found as Student');
      organizer = await Organizer.findOne({ email: '22b61a0557@sitam.co.in' });
      if (organizer) {
        console.log('   ✅ Found as Organizer collection');
      }
    } else {
      console.log('   ✅ Found as Student collection');
    }

    if (!organizer) {
      console.log('   ❌ Could not find organizer in either collection');
      process.exit(1);
    }

    console.log('   Email:', organizer.email);
    console.log('   ID:', organizer._id);
    console.log('   ID (string):', organizer._id.toString());
    console.log('   Name:', organizer.firstName, organizer.lastName);

    // Find organizer's hackathons
    console.log('\n🔍 STEP 2: Finding hackathons created by this organizer');
    const hackathons = await Hackathon.find({
      $or: [
        { organizer: organizer._id },
        { createdBy: organizer._id }
      ]
    });

    console.log(`   Found ${hackathons.length} hackathon(s)\n`);

    if (hackathons.length === 0) {
      console.log('   ℹ️  No hackathons found. Create one first to test deletion.');
      
      // Close connection and exit
      await mongoose.connection.close();
      process.exit(0);
    }

    // Analyze each hackathon
    hackathons.forEach((hackathon, index) => {
      console.log(`📋 Hackathon ${index + 1}:`);
      console.log(`   Title: ${hackathon.title}`);
      console.log(`   ID: ${hackathon._id}`);
      console.log(`   Status: ${hackathon.status}`);
      console.log(`   Organizer ID in DB: ${hackathon.organizer}`);
      console.log(`   Organizer ID (string): ${hackathon.organizer.toString()}`);
      console.log(`   CreatedBy ID in DB: ${hackathon.createdBy}`);
      console.log(`   CreatedBy ID (string): ${hackathon.createdBy.toString()}`);
      console.log(`   Organizer match with organizer._id?`, hackathon.organizer.toString() === organizer._id.toString());
      console.log(`   CreatedBy match with organizer._id?`, hackathon.createdBy.toString() === organizer._id.toString());
      
      // Check deletability
      const isDeletable = hackathon.status === 'scheduled' || hackathon.status === 'draft';
      console.log(`   Can be deleted? ${isDeletable ? '✅ Yes' : '❌ No'} (status: ${hackathon.status})`);
      console.log('');
    });

    // Authorization simulation
    console.log('🔐 STEP 3: Simulating authorization check');
    const hackathonToDelete = hackathons[0];
    const hackathonOrganizerStr = hackathonToDelete.organizer.toString();
    const requesterIdStr = organizer._id.toString();
    const requesterIdAltStr = organizer._id.toString(); // Same in this case

    console.log(`   Hackathon organizer: ${hackathonOrganizerStr}`);
    console.log(`   Requester ID: ${requesterIdStr}`);
    console.log(`   Match? ${hackathonOrganizerStr === requesterIdStr ? '✅ YES' : '❌ NO'}`);

    if (hackathonOrganizerStr === requesterIdStr) {
      console.log('\n✅ AUTHORIZATION CHECK PASSED - Deletion would be allowed');
    } else {
      console.log('\n❌ AUTHORIZATION CHECK FAILED - Deletion would be denied');
      console.log('   This is the issue! The IDs do not match.');
    }

    // Check JWT scenario
    console.log('\n\n📋 STEP 4: JWT Token Simulation');
    console.log('   When organizer logs in, the JWT contains: ' + organizer._id);
    console.log('   In middleware, req.user.id would be set to: ' + organizer._id);
    console.log('   In middleware, req.user._id would be set to: ' + organizer._id);
    console.log('   When deleting hackathon, comparison would be:');
    console.log(`     hackathon.organizer (${hackathonOrganizerStr}) === req.user.id (${requesterIdStr})?`);
    console.log(`     Result: ${hackathonOrganizerStr === requesterIdStr ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

runTests();
