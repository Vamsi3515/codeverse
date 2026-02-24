const fs = require('fs');
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
      const online = json.hackathons.filter(h => h.mode === 'online').length;
      const offline = json.hackathons.filter(h => h.mode === 'offline').length;
      const hybrid = json.hackathons.filter(h => h.mode === 'hybrid').length;
      
      console.log('📊 API RESPONSE ANALYSIS:');
      console.log('Total count field:', json.count);
      console.log('Actual hackathons returned:', json.hackathons.length);
      console.log('  - Online:', online);
      console.log('  - Offline:', offline);
      console.log('  - Hybrid:', hybrid);
      
      if (offline > 0) {
        console.log('\n✅ OFFLINE HACKATHONS FOUND IN API:');
        json.hackathons.filter(h => h.mode === 'offline').forEach((h, i) => {
          console.log(`  [${i+1}] ${h.title} - Location:`, h.location ? 'Yes' : 'No');
        });
      } else {
        console.log('\n❌ NO OFFLINE HACKATHONS IN API RESPONSE!');
      }
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
