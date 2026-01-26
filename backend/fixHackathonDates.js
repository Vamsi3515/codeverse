// Quick fix script to publish and set proper dates for testing
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const Hackathon = require('./src/models/Hackathon');

const updateHackathons = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Current time: 2026-01-25T17:45:21.031Z
    const now = new Date('2026-01-25T17:45:21.031Z');
    
    // Create dates: hackathon starting tomorrow at noon, ending 2 days later
    const startDate = new Date('2026-01-26T12:00:00.000Z'); // Tomorrow
    const endDate = new Date('2026-01-28T18:00:00.000Z'); // 2.25 days later

    console.log('\n📅 Updating csfsf to have proper future dates...');
    const result = await Hackathon.updateOne(
      { title: 'csfsf' },
      {
        $set: {
          startDate: startDate,
          endDate: endDate,
          isPublished: true,
          status: 'published'
        }
      }
    );
    
    console.log('✅ csfsf updated:', result);

    console.log('\n📅 Publishing draft "Genai versity" with future dates...');
    const result2 = await Hackathon.updateOne(
      { title: 'Genai versity' },
      {
        $set: {
          isPublished: true,
          status: 'published',
          // Keep its original dates: 2026-02-07T23:35:00.000Z to 2026-02-26T23:35:00.000Z
        }
      }
    );
    
    console.log('✅ Genai versity published:', result2);

    console.log('\n🔍 Fetching updated hackathons...');
    const allHackathons = await Hackathon.find({});
    
    console.log('\n📊 All Hackathons After Update:');
    allHackathons.forEach((h, idx) => {
      console.log(`\n[${idx + 1}] ${h.title}`);
      console.log(`  - isPublished: ${h.isPublished}`);
      console.log(`  - status: ${h.status}`);
      console.log(`  - startDate: ${h.startDate}`);
      console.log(`  - endDate: ${h.endDate}`);
      console.log(`  - isFuture: ${h.startDate > now ? '✅ YES' : '❌ NO'}`);
    });

    console.log('\n✅ Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateHackathons();
