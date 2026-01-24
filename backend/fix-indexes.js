const mongoose = require('mongoose');
require('dotenv').config();

// Fix duplicate key error by recreating indexes as sparse

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('\n📋 Current indexes:');
    const existingIndexes = await usersCollection.indexes();
    existingIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: sparse=${index.sparse || false}`);
    });

    // Drop problematic indexes
    console.log('\n🗑️  Dropping old indexes...');
    try {
      await usersCollection.dropIndex('collegeIdCardHash_1');
      console.log('  ✅ Dropped collegeIdCardHash_1');
    } catch (e) {
      console.log('  ⚠️  collegeIdCardHash_1 index not found or already dropped');
    }

    try {
      await usersCollection.dropIndex('selfieHash_1');
      console.log('  ✅ Dropped selfieHash_1');
    } catch (e) {
      console.log('  ⚠️  selfieHash_1 index not found or already dropped');
    }

    try {
      await usersCollection.dropIndex('regNumber_1');
      console.log('  ✅ Dropped regNumber_1');
    } catch (e) {
      console.log('  ⚠️  regNumber_1 index not found or already dropped');
    }

    // Create new sparse indexes
    console.log('\n✨ Creating new sparse indexes...');
    
    await usersCollection.createIndex(
      { collegeIdCardHash: 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log('  ✅ Created collegeIdCardHash (sparse, unique)');

    await usersCollection.createIndex(
      { selfieHash: 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log('  ✅ Created selfieHash (sparse, unique)');

    await usersCollection.createIndex(
      { regNumber: 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log('  ✅ Created regNumber (sparse, unique)');

    console.log('\n📋 New indexes:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: sparse=${index.sparse || false}`);
    });

    console.log('\n✅ Index fix completed successfully!');
    console.log('   Now organizers can register without duplicate key errors.');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixIndexes();
