const mongoose = require('mongoose');
const Hackathon = require('./src/models/Hackathon');

mongoose.connect('mongodb://localhost:27017/codeverse')
  .then(async () => {
    const all = await Hackathon.find({});
    const online = await Hackathon.find({ mode: 'online' });
    const offline = await Hackathon.find({ mode: 'offline' });
    const hybrid = await Hackathon.find({ mode: 'hybrid' });
    
    console.log('📊 TOTAL HACKATHONS:', all.length);
    console.log('   - Online:', online.length);
    console.log('   - Offline:', offline.length);
    console.log('   - Hybrid:', hybrid.length);
    
    if (offline.length > 0) {
      console.log('\n✅ OFFLINE HACKATHONS EXIST:');
      offline.forEach((h, i) => {
        console.log(`\n[${i+1}] ${h.title}`);
        console.log('    Mode:', h.mode);
        console.log('    Location:', JSON.stringify(h.location, null, 2));
      });
    } else {
      console.log('\n❌ NO OFFLINE HACKATHONS FOUND!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  });
