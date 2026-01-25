async function testBackend() {
    try {
        console.log('Testing connection to http://localhost:5000/api/hackathons...');
        const res = await fetch('http://localhost:5000/api/hackathons');
        const data = await res.json();
        
        console.log('Status:', res.status);
        console.log('Success:', data.success);
        console.log('Count:', data.count);
        console.log('Data length:', data.hackathons ? data.hackathons.length : (data.data ? data.data.length : 'Unknown'));
        console.log('Response keys:', Object.keys(data));

        const list = data.hackathons || data.data;
        
        if (list && list.length > 0) {
            const firstId = list[0]._id || list[0].id;
            console.log('First Hackathon ID:', firstId);
            console.log('Fetching details for first hackathon...');
            
            const res2 = await fetch(`http://localhost:5000/api/hackathons/${firstId}`);
            const data2 = await res2.json();
            
            console.log('Detail Status:', res2.status);
            console.log('Detail Body Structure Keys:', Object.keys(data2));
            if(data2.hackathon) console.log('data.hackathon is PRESENT');
            if(data2.data) console.log('data.data is PRESENT');
        } else {
            console.log('No hackathons found to test details.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testBackend();