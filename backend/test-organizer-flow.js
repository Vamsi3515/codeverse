// Comprehensive test for Organizer login and hackathon flow
const API_URL = 'http://localhost:5000/api';

async function testOrganizerFlow() {
  console.log('🔍 TESTING ORGANIZER LOGIN AND HACKATHON FLOW');
  console.log('='.repeat(70));
  
  const email = '22b61a0557@sitam.co.in';
  const password = 'Test@123'; // Update with correct password
  
  try {
    // STEP 1: Login
    console.log('\n📌 STEP 1: Organizer Login');
    console.log('Email:', email);
    
    const loginResponse = await fetch(`${API_URL}/auth/organizer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      console.log('\n❌ LOGIN FAILED:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    const user = loginData.user;
    
    console.log('\n✅ LOGIN SUCCESSFUL');
    console.log('User ID:', user.id);
    console.log('Name:', user.firstName, user.lastName);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Token:', token ? 'Generated ✓' : 'Missing ✗');
    
    // STEP 2: Fetch Hackathons
    console.log('\n📌 STEP 2: Fetch Organizer Hackathons');
    
    const hackathonResponse = await fetch(`${API_URL}/hackathons/organizer/my-hackathons`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const hackathonData = await hackathonResponse.json();
    console.log('Status:', hackathonResponse.status);
    console.log('Response:', JSON.stringify(hackathonData, null, 2));
    
    if (!hackathonData.success) {
      console.log('\n❌ FETCH FAILED:', hackathonData.message);
      return;
    }
    
    console.log('\n✅ FETCH SUCCESSFUL');
    console.log('Total Hackathons:', hackathonData.total);
    console.log('Hackathons Count:', hackathonData.count);
    
    if (hackathonData.hackathons && hackathonData.hackathons.length > 0) {
      console.log('\n📋 HACKATHONS:');
      hackathonData.hackathons.forEach((h, i) => {
        console.log(`\n${i + 1}. ${h.title}`);
        console.log('   ID:', h._id);
        console.log('   Status:', h.status);
        console.log('   Mode:', h.mode);
        console.log('   Start:', new Date(h.startDate).toLocaleDateString());
        console.log('   End:', new Date(h.endDate).toLocaleDateString());
      });
    } else {
      console.log('\n⚠️  No hackathons found');
    }
    
    // STEP 3: Test Create Hackathon
    console.log('\n📌 STEP 3: Test Create Hackathon Endpoint');
    console.log('This is a DRY RUN - not actually creating a hackathon');
    console.log('Endpoint would be: POST', `${API_URL}/hackathons/create`);
    console.log('Headers would include: Authorization: Bearer ' + token.substring(0, 20) + '...');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('\nRECOMMENDATIONS:');
    console.log('1. Login is working ✓');
    console.log('2. Dashboard API is accessible ✓');
    console.log('3. Create a test hackathon via frontend to verify creation flow');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testOrganizerFlow();
