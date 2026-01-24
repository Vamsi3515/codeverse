// Test Delete Hackathon functionality
const API_URL = 'http://localhost:5000/api';

// Mock organizer token (get from login)
let token = '';
let hackathonId = '';

async function testDeleteHackathon() {
  console.log('🧪 TESTING DELETE HACKATHON FUNCTIONALITY');
  console.log('='.repeat(70));

  try {
    // STEP 1: Get token (manual - update with actual token)
    token = localStorage.getItem('token');
    if (!token) {
      console.log('\n❌ No token found. Please login first.');
      return;
    }
    console.log('\n✅ Token found');

    // STEP 2: Fetch existing hackathons
    console.log('\n📌 Fetching existing hackathons...');
    const fetchResponse = await fetch(`${API_URL}/hackathons/organizer/my-hackathons`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const fetchData = await fetchResponse.json();
    
    if (!fetchData.success || !fetchData.hackathons || fetchData.hackathons.length === 0) {
      console.log('❌ No hackathons found to delete');
      console.log('Create a hackathon first before testing delete');
      return;
    }

    // Find a scheduled hackathon to delete
    const scheduledHackathon = fetchData.hackathons.find(h => h.status === 'scheduled' || h.status === 'draft');
    
    if (!scheduledHackathon) {
      console.log('❌ No scheduled/draft hackathon found');
      console.log('Only scheduled or draft hackathons can be deleted');
      return;
    }

    hackathonId = scheduledHackathon._id;
    console.log('✅ Found scheduled hackathon:');
    console.log('   ID:', hackathonId);
    console.log('   Title:', scheduledHackathon.title);
    console.log('   Status:', scheduledHackathon.status);

    // STEP 3: Delete the hackathon
    console.log('\n📌 Sending DELETE request...');
    console.log('Endpoint: DELETE', `${API_URL}/hackathons/${hackathonId}`);
    
    const deleteResponse = await fetch(`${API_URL}/hackathons/${hackathonId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const deleteData = await deleteResponse.json();
    
    console.log('Status Code:', deleteResponse.status);
    console.log('Response:', JSON.stringify(deleteData, null, 2));

    if (deleteResponse.ok && deleteData.success) {
      console.log('\n✅ DELETION SUCCESSFUL');
      console.log('Hackathon deleted:', deleteData.hackathon.title);
    } else {
      console.log('\n❌ DELETION FAILED');
      console.log('Error:', deleteData.message);
    }

    // STEP 4: Verify deletion
    console.log('\n📌 Verifying deletion...');
    const verifyResponse = await fetch(`${API_URL}/hackathons/${hackathonId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.status === 404) {
      console.log('✅ Hackathon confirmed deleted (404 Not Found)');
    } else {
      console.log('⚠️  Hackathon still exists');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Test wrong organizer deletion
async function testUnauthorizedDelete() {
  console.log('\n\n🧪 TESTING UNAUTHORIZED DELETE (SECURITY)');
  console.log('='.repeat(70));

  try {
    // This would test deletion by a different organizer (if we had 2 organizers)
    console.log('\nNote: This test requires setting up a different organizer account');
    console.log('If you have 2 organizer accounts:');
    console.log('1. Login with organizer 1');
    console.log('2. Get organizer 1 token');
    console.log('3. Create hackathon with organizer 1');
    console.log('4. Get organizer 1\'s hackathon ID');
    console.log('5. Login with organizer 2');
    console.log('6. Try to delete organizer 1\'s hackathon with organizer 2 token');
    console.log('7. Should get 403 Unauthorized error');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test delete active hackathon (should fail)
async function testDeleteActiveHackathon() {
  console.log('\n\n🧪 TESTING DELETE ACTIVE HACKATHON (SHOULD FAIL)');
  console.log('='.repeat(70));

  try {
    token = localStorage.getItem('token');
    if (!token) {
      console.log('\n❌ No token found');
      return;
    }

    const fetchResponse = await fetch(`${API_URL}/hackathons/organizer/my-hackathons`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const fetchData = await fetchResponse.json();
    
    if (!fetchData.hackathons || fetchData.hackathons.length === 0) {
      console.log('❌ No hackathons found');
      return;
    }

    const activeHackathon = fetchData.hackathons.find(h => h.status === 'active');
    
    if (!activeHackathon) {
      console.log('⚠️  No active hackathon found');
      console.log('Skipping this test');
      return;
    }

    console.log('\nAttempting to delete active hackathon:');
    console.log('Title:', activeHackathon.title);
    console.log('Status:', activeHackathon.status);

    const deleteResponse = await fetch(`${API_URL}/hackathons/${activeHackathon._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const deleteData = await deleteResponse.json();
    
    if (!deleteResponse.ok) {
      console.log('\n✅ CORRECTLY REJECTED (as expected)');
      console.log('Status Code:', deleteResponse.status);
      console.log('Error Message:', deleteData.message);
    } else {
      console.log('\n❌ UNEXPECTED: Active hackathon was deleted');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testDeleteHackathon();
  await testUnauthorizedDelete();
  await testDeleteActiveHackathon();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testDeleteHackathon, testUnauthorizedDelete, testDeleteActiveHackathon, runAllTests };
}
