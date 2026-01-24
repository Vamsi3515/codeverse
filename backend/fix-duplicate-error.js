const mongoose = require('mongoose');

async function fixDuplicateError() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/codeverse-campus');
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', require('./src/models/User').schema);

    // Step 1: Check current state
    console.log('📊 Current State:');
    const totalUsers = await User.countDocuments();
    const usersWithNullHash = await User.countDocuments({ collegeIdCardHash: null });
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with null collegeIdCardHash: ${usersWithNullHash}\n`);

    // Step 2: Remove duplicate null entries (keep only one)
    console.log('🧹 Cleaning up duplicate null entries...');
    const nullUsers = await User.find({ collegeIdCardHash: null });
    
    if (nullUsers.length > 1) {
      // Keep the first one, delete the rest
      for (let i = 1; i < nullUsers.length; i++) {
        await User.deleteOne({ _id: nullUsers[i]._id });
        console.log(`Deleted duplicate user: ${nullUsers[i].email || nullUsers[i].username}`);
      }
      console.log(`✅ Cleaned up ${nullUsers.length - 1} duplicate entries\n`);
    } else {
      console.log('✅ No duplicate null entries found\n');
    }

    // Step 3: Drop existing indexes
    console.log('🔧 Dropping existing indexes...');
    try {
      await User.collection.dropIndex('collegeIdCardHash_1');
      console.log('✅ Dropped collegeIdCardHash_1');
    } catch (err) {
      console.log('ℹ️  collegeIdCardHash_1 not found');
    }

    try {
      await User.collection.dropIndex('selfieHash_1');
      console.log('✅ Dropped selfieHash_1');
    } catch (err) {
      console.log('ℹ️  selfieHash_1 not found');
    }

    try {
      await User.collection.dropIndex('regNumber_1');
      console.log('✅ Dropped regNumber_1');
    } catch (err) {
      console.log('ℹ️  regNumber_1 not found');
    }

    // Step 4: Create new sparse indexes
    console.log('\n🔨 Creating new sparse indexes...');
    await User.collection.createIndex(
      { collegeIdCardHash: 1 },
      { unique: true, sparse: true, name: 'collegeIdCardHash_1' }
    );
    console.log('✅ Created collegeIdCardHash_1 (sparse)');

    await User.collection.createIndex(
      { selfieHash: 1 },
      { unique: true, sparse: true, name: 'selfieHash_1' }
    );
    console.log('✅ Created selfieHash_1 (sparse)');

    await User.collection.createIndex(
      { regNumber: 1 },
      { unique: true, sparse: true, name: 'regNumber_1' }
    );
    console.log('✅ Created regNumber_1 (sparse)');

    // Step 5: Verify indexes
    console.log('\n📋 Verifying indexes:');
    const indexes = await User.collection.getIndexes();
    for (const [name, config] of Object.entries(indexes)) {
      if (name.includes('Hash') || name.includes('regNumber')) {
        console.log(`${name}: ${JSON.stringify(config)}`);
      }
    }

    console.log('\n✅ All done! Database is fixed.');
    console.log('You can now try registering again.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixDuplicateError();
