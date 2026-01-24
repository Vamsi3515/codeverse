const mongoose = require('mongoose');
require('dotenv').config();

// Clean up duplicate null values that are blocking registration

async function cleanupDuplicateNulls() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users with null collegeIdCardHash
    const usersWithNullHash = await usersCollection.find({
      $or: [
        { collegeIdCardHash: null },
        { collegeIdCardHash: { $exists: false } }
      ]
    }).toArray();

    console.log(`📊 Found ${usersWithNullHash.length} users with null collegeIdCardHash\n`);

    if (usersWithNullHash.length > 1) {
      console.log('🗑️  Removing duplicate null entries...\n');
      
      // Keep only the first one, delete the rest
      for (let i = 1; i < usersWithNullHash.length; i++) {
        const user = usersWithNullHash[i];
        console.log(`   Deleting user: ${user.email} (${user.firstName} ${user.lastName})`);
        await usersCollection.deleteOne({ _id: user._id });
      }
      
      console.log(`\n✅ Deleted ${usersWithNullHash.length - 1} duplicate entries`);
      console.log(`✅ Kept user: ${usersWithNullHash[0].email}\n`);
    } else if (usersWithNullHash.length === 1) {
      console.log('✅ Only one user with null hash - no duplicates to remove\n');
    } else {
      console.log('✅ No users with null hash found\n');
    }

    // Now unset the null fields completely for organizers
    console.log('🔄 Unsetting null fields for organizers...');
    const result = await usersCollection.updateMany(
      { 
        role: 'organizer',
        $or: [
          { collegeIdCardHash: null },
          { selfieHash: null },
          { regNumber: null }
        ]
      },
      { 
        $unset: { 
          collegeIdCardHash: "",
          selfieHash: "",
          regNumber: "",
          collegeIdCard: "",
          liveSelfie: ""
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} organizer records\n`);

    // Verify the fix
    const remainingDuplicates = await usersCollection.find({
      collegeIdCardHash: null
    }).toArray();

    console.log('📊 Final Status:');
    console.log(`   Users with null collegeIdCardHash: ${remainingDuplicates.length}`);
    
    if (remainingDuplicates.length <= 1) {
      console.log('\n✅ SUCCESS! No more duplicate null values');
      console.log('   Organizers can now register without errors\n');
    } else {
      console.log('\n⚠️  Still have duplicates - may need manual cleanup\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupDuplicateNulls();
