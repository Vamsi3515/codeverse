// Quick Verification Script
// Run this in the browser console on the ViewRegistrations page

console.log('🧪 ORGANIZER REGISTRATION AUTH TEST\n');

// Check 1: Token exists
const token = localStorage.getItem('token');
console.log('✅ Check 1: Token Stored');
console.log('   Present:', !!token);
if (token) {
  console.log('   Length:', token.length);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('   User ID:', payload.id || payload.userId);
    console.log('   Email:', payload.email);
    console.log('   Role:', payload.role);
  } catch (e) {
    console.log('   ⚠️ Could not decode token');
  }
}

// Check 2: Current URL
const url = new URL(window.location.href);
const hackathonId = url.pathname.split('/').pop();
console.log('\n✅ Check 2: Hackathon ID');
console.log('   HackathonId from URL:', hackathonId);

// Check 3: Test API call
console.log('\n✅ Check 3: Testing API Call');
console.log('   Endpoint: /api/registrations/hackathon/' + hackathonId);
console.log('   Headers: { Authorization: Bearer [TOKEN] }');

fetch(`http://localhost:5000/api/registrations/hackathon/${hackathonId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('   Response Status:', res.status, res.statusText);
  return res.json();
})
.then(data => {
  console.log('   Response Body:', data);
  if (data.success) {
    console.log('   ✅ SUCCESS! Registrations:', data.count);
  } else {
    console.log('   ❌ ERROR:', data.message);
    if (data.debug) {
      console.log('   Debug Info:', data.debug);
    }
  }
})
.catch(err => {
  console.log('   ❌ Network Error:', err.message);
});

console.log('\n🔍 If successful, you should see registrations list above');
console.log('📋 If 403 error, you are not the organizer who created this hackathon');
console.log('📋 If other error, check the response message above\n');
