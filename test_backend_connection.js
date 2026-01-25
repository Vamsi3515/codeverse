const axios = require('axios');

async function testBackend() {
    try {
        console.log('Testing connection to http://localhost:5000/api/hackathons...');
        const res = await axios.get('http://localhost:5000/api/hackathons');
        console.log('Status:', res.status);
        console.log('Success:', res.data.success);
        console.log('Count:', res.data.count);
        if (res.data.data && res.data.data.length > 0) {
            console.log('First Hackathon ID:', res.data.data[0]._id);
            console.log('Fetching details for first hackathon...');
            const detailRes = await axios.get(`http://localhost:5000/api/hackathons/${res.data.data[0]._id}`);
            console.log('Detail Status:', detailRes.status);
            console.log('Detail Hackathon:', detailRes.data.hackathon ? 'Found' : 'Missing');
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.status, error.response.data);
        }
    }
}

testBackend();