const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/hackathons/available',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const offlineHacks = json.hackathons.filter(h => h.mode === 'offline');
      
      console.log('🔍 OFFLINE HACKATHONS LOCATION CHECK:');
      offlineHacks.forEach((h, i) => {
        console.log(`\n[${i+1}] ${h.title}`);
        console.log('   location object:', h.location ? 'EXISTS' : 'NULL');
        if (h.location) {
          console.log('   - venueName:', h.location.venueName);
          console.log('   - latitude:', h.location.latitude, '(type:', typeof h.location.latitude + ')');
          console.log('   - longitude:', h.location.longitude, '(type:', typeof h.location.longitude + ')');
          console.log('   - address:', h.location.address);
          console.log('   - city:', h.location.city);
        }
      });
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
