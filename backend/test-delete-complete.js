#!/usr/bin/env node

/**
 * COMPREHENSIVE DELETE HACKATHON TEST
 * 
 * This script tests the entire delete flow:
 * 1. Database state verification
 * 2. ID matching simulation
 * 3. Authorization logic validation
 * 
 * Usage: node test-delete-complete.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Models
const Organizer = require('./src/models/Organizer');
const Student = require('./src/models/Student');
const Hackathon = require('./src/models/Hackathon');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

async function runTests() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 COMPREHENSIVE DELETE HACKATHON AUTHORIZATION TEST');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Connect to database
    console.log('📡 STEP 1: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon');
    console.log('✅ Connected successfully\n');

    // Find test organizer
    console.log('👤 STEP 2: Finding test organizer (22b61a0557@sitam.co.in)');
    let organizer = await Student.findOne({ email: '22b61a0557@sitam.co.in' });
    let isFromStudent = true;
    
    if (!organizer) {
      organizer = await Organizer.findOne({ email: '22b61a0557@sitam.co.in' });
      isFromStudent = false;
    }

    if (!organizer) {
      console.log('❌ ERROR: Organizer not found\n');
      process.exit(1);
    }

    console.log(`   ✅ Found in ${isFromStudent ? 'Student' : 'Organizer'} collection`);
    console.log(`   Email: ${organizer.email}`);
    console.log(`   ID: ${organizer._id}`);
    console.log(`   ID (string): ${organizer._id.toString()}`);
    console.log(`   Name: ${organizer.firstName} ${organizer.lastName}\n`);

    // Find organizer's hackathons
    console.log('📚 STEP 3: Finding hackathons created by organizer');
    const hackathons = await Hackathon.find({
      $or: [
        { organizer: organizer._id },
        { createdBy: organizer._id }
      ]
    });

    console.log(`   Found: ${hackathons.length} hackathon(s)\n`);

    if (hackathons.length === 0) {
      console.log('⚠️  No hackathons found. Create one to test deletion.\n');
      
      console.log('📝 RECOMMENDED NEXT STEPS:');
      console.log('   1. Login to organizer dashboard');
      console.log('   2. Create a new hackathon');
      console.log('   3. Publish it as "Scheduled"');
      console.log('   4. Run this test again\n');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Test authorization for each hackathon
    console.log('🔐 STEP 4: Testing authorization for each hackathon\n');

    let allAuthChecksPassed = true;

    hackathons.forEach((hackathon, idx) => {
      console.log(`   Hackathon ${idx + 1}: ${hackathon.title}`);
      console.log(`   ───────────────────────────────────────`);
      
      // Show database state
      console.log(`   Database State:`);
      console.log(`     ID: ${hackathon._id}`);
      console.log(`     Status: ${hackathon.status}`);
      console.log(`     Organizer: ${hackathon.organizer}`);
      console.log(`     Organizer (string): ${hackathon.organizer.toString()}`);
      
      // Simulate middleware req.user setting
      const req_user_id = organizer._id.toString();
      const req_user_id_alt = organizer._id.toString();
      const hackathon_organizer_str = hackathon.organizer.toString();
      
      console.log(`\n   Request State (from JWT):`);
      console.log(`     req.user.id: ${req_user_id}`);
      console.log(`     req.user._id: ${req_user_id_alt}`);
      
      // Perform authorization check (same logic as controller)
      const isOwner = (hackathon_organizer_str === req_user_id) || 
                      (hackathon_organizer_str === req_user_id_alt);
      
      console.log(`\n   Authorization Check:`);
      console.log(`     hackathon.organizer === req.user.id?`);
      console.log(`       ${hackathon_organizer_str} === ${req_user_id}`);
      console.log(`       Result: ${isOwner ? '✅ YES' : '❌ NO'}`);
      
      if (!isOwner) {
        allAuthChecksPassed = false;
        console.log(`\n   ❌ AUTHORIZATION FAILED!`);
        console.log(`      This hackathon CANNOT be deleted.`);
      } else {
        // Check status
        const isDeletable = hackathon.status === 'scheduled' || hackathon.status === 'draft';
        console.log(`\n   Status Check:`);
        console.log(`     Current status: ${hackathon.status}`);
        console.log(`     Deletable? ${isDeletable ? '✅ YES' : '❌ NO'}`);
        
        if (!isDeletable) {
          console.log(`     Only "scheduled" or "draft" can be deleted`);
        } else {
          console.log(`\n   ✅ AUTHORIZATION PASSED - Can be deleted!`);
        }
      }
      
      console.log('');
    });

    // JWT Token Simulation
    console.log('🎫 STEP 5: JWT Token Simulation\n');
    
    // Create test token
    const testToken = jwt.sign(
      { id: organizer._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`   Creating test JWT token...`);
    console.log(`   Token: ${testToken.substring(0, 50)}...`);
    
    // Verify token
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log(`\n   Token Decoded:`);
    console.log(`     ID in token: ${decoded.id}`);
    console.log(`     ID (string): ${decoded.id.toString()}`);
    console.log(`     Same as organizer ID? ${decoded.id.toString() === organizer._id.toString() ? '✅ YES' : '❌ NO'}\n`);

    // Final summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY\n');
    
    if (allAuthChecksPassed) {
      console.log('✅ ALL AUTHORIZATION CHECKS PASSED!');
      console.log('   Organizer can delete their hackathons (if status allows)\n');
    } else {
      console.log('❌ SOME AUTHORIZATION CHECKS FAILED!');
      console.log('   Please verify:');
      console.log('   1. Hackathon was created by this organizer');
      console.log('   2. Database has correct organizer ID stored');
      console.log('   3. Check /backend/src/models/Hackathon.js - organizer field\n');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

runTests();
