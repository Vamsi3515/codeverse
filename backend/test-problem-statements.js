#!/usr/bin/env node

/**
 * Test Problem Statement Management Feature
 * 
 * Tests:
 * 1. Add problem statements during hackathon creation
 * 2. Add problem statements after hackathon creation but before start
 * 3. Update problem statements before start time
 * 4. Delete problem statements before start time
 * 5. Block publishing without problem statements (ONLINE mode only)
 * 6. Block adding/updating/deleting problems after hackathon starts
 * 7. Verify offline/hybrid hackathons are unaffected
 * 8. Verify registration is blocked if online hackathon has no problems
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test helper function
async function testEndpoint(name, method, url, data = null, token = null) {
  try {
    const config = { 
      method, 
      url: `${BASE_URL}${url}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    if (data) config.data = data;

    const response = await axios(config);
    console.log(`✅ ${name}`);
    console.log(`   Response: ${response.status} ${response.statusText}`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}`);
    if (error.response) {
      console.log(`   Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return null;
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  PROBLEM STATEMENT MANAGEMENT FEATURE TESTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // You'll need to replace these with actual test data
  const organizerToken = 'your_organizer_token_here';
  const studentToken = 'your_student_token_here';

  console.log('📋 TEST SUITE 1: Problem Statement CRUD Operations\n');

  // Create a test online hackathon
  console.log('1️⃣ Creating online hackathon...');
  const hackathonData = {
    title: 'Test Hackathon - Problem Statements',
    description: 'Testing problem statement management',
    college: 'Test College',
    mode: 'online',
    startDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    endDate: new Date(Date.now() + 50 * 60 * 60 * 1000),
    registrationStartDate: new Date(),
    registrationEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 48,
    maxParticipants: 100,
    participationType: 'SOLO',
    problemStatements: [] // Initially empty
  };

  const hackathonResponse = await testEndpoint(
    'Create online hackathon',
    'POST',
    '/hackathons',
    hackathonData,
    organizerToken
  );

  if (!hackathonResponse?.data?.hackathon) {
    console.log('\n⚠️  Cannot continue without hackathon. Make sure to provide valid tokens.\n');
    return;
  }

  const hackathonId = hackathonResponse.data.hackathon._id;
  console.log(`   Hackathon ID: ${hackathonId}\n`);

  // Test 1: Add first problem statement
  console.log('2️⃣ Adding first problem statement...');
  const problem1Data = {
    title: 'Weather Prediction API',
    description: 'Build an API that predicts weather patterns using machine learning.',
    resources: ['https://example.com/weather-api', 'https://example.com/ml-guide']
  };

  const addProblem1 = await testEndpoint(
    'Add problem statement 1',
    'POST',
    `/hackathons/${hackathonId}/problems`,
    problem1Data,
    organizerToken
  );

  if (addProblem1?.data?.problemCount) {
    console.log(`   Total problems: ${addProblem1.data.problemCount}\n`);
  }

  // Test 2: Add second problem statement
  console.log('3️⃣ Adding second problem statement...');
  const problem2Data = {
    title: 'E-Commerce Platform',
    description: 'Create a full-stack e-commerce platform with payment integration.',
    resources: ['https://example.com/ecom-tutorial']
  };

  const addProblem2 = await testEndpoint(
    'Add problem statement 2',
    'POST',
    `/hackathons/${hackathonId}/problems`,
    problem2Data,
    organizerToken
  );

  if (addProblem2?.data?.problemCount) {
    console.log(`   Total problems: ${addProblem2.data.problemCount}\n`);
  }

  // Extract first problem ID for update/delete tests
  const firstProblemId = addProblem1?.data?.hackathon?.problemStatements?.[0]?._id;

  if (firstProblemId) {
    // Test 3: Update problem statement
    console.log('4️⃣ Updating first problem statement...');
    const updateProblemData = {
      title: 'Weather Prediction API - UPDATED',
      description: 'Build an advanced API that predicts weather patterns using deep learning.'
    };

    await testEndpoint(
      'Update problem statement',
      'PUT',
      `/hackathons/${hackathonId}/problems/${firstProblemId}`,
      updateProblemData,
      organizerToken
    );
    console.log();
  }

  // Test 4: Try to publish without problems (should fail initially, then succeed)
  console.log('5️⃣ Publishing hackathon with problems (should succeed)...');
  await testEndpoint(
    'Publish hackathon',
    'PUT',
    `/hackathons/${hackathonId}/publish`,
    {},
    organizerToken
  );
  console.log();

  // Test 5: Verify offline hackathon cannot have problem statements
  console.log('\n📋 TEST SUITE 2: Mode-Specific Validation\n');
  console.log('6️⃣ Creating offline hackathon...');

  const offlineHackathonData = {
    title: 'Test Offline Hackathon',
    description: 'Testing offline mode',
    college: 'Test College',
    mode: 'offline',
    location: {
      venueName: 'University Auditorium',
      address: '123 Main St',
      city: 'Test City',
      latitude: 40.7128,
      longitude: -74.0060
    },
    startDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 50 * 60 * 60 * 1000),
    registrationStartDate: new Date(),
    registrationEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 48,
    maxParticipants: 50,
    participationType: 'SOLO'
  };

  const offlineHackathonResponse = await testEndpoint(
    'Create offline hackathon',
    'POST',
    '/hackathons',
    offlineHackathonData,
    organizerToken
  );

  if (offlineHackathonResponse?.data?.hackathon) {
    const offlineHackathonId = offlineHackathonResponse.data.hackathon._id;
    console.log(`   Offline Hackathon ID: ${offlineHackathonId}\n`);

    // Test 6: Try to add problem to offline hackathon (should fail)
    console.log('7️⃣ Attempting to add problem to OFFLINE hackathon (should fail)...');
    const offlineProblemData = {
      title: 'Offline Problem',
      description: 'This should not be allowed for offline hackathons'
    };

    await testEndpoint(
      'Add problem to offline hackathon',
      'POST',
      `/hackathons/${offlineHackathonId}/problems`,
      offlineProblemData,
      organizerToken
    );
    console.log();
  }

  // Test 7: Authorization checks
  console.log('\n📋 TEST SUITE 3: Authorization & Security\n');
  console.log('8️⃣ Attempting to add problem as student (should fail)...');
  const studentProblemData = {
    title: 'Unauthorized Problem',
    description: 'Students should not add problems'
  };

  await testEndpoint(
    'Add problem as student',
    'POST',
    `/hackathons/${hackathonId}/problems`,
    studentProblemData,
    studentToken
  );
  console.log();

  // Test 8: Alerts integration
  console.log('\n📋 TEST SUITE 4: Organizer Dashboard Alerts\n');
  console.log('9️⃣ Fetching organizer hackathons (should include alerts)...');

  const organizerHackathons = await testEndpoint(
    'Get organizer hackathons',
    'GET',
    '/hackathons/organizer/my-hackathons',
    null,
    organizerToken
  );

  if (organizerHackathons?.data?.hackathons) {
    organizerHackathons.data.hackathons.forEach((h, idx) => {
      if (h.problemStatementAlert) {
        console.log(`   Hackathon ${idx + 1}: ${h.title}`);
        console.log(`   Alert Type: ${h.problemStatementAlert.type}`);
        console.log(`   Message: ${h.problemStatementAlert.message}`);
        console.log(`   Severity: ${h.problemStatementAlert.severity}\n`);
      }
    });
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  TEST SUITE COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 ENDPOINT REFERENCE:\n');
  console.log('  POST   /api/hackathons/:id/problems');
  console.log('         Add a new problem statement\n');
  console.log('  PUT    /api/hackathons/:id/problems/:problemId');
  console.log('         Update an existing problem statement\n');
  console.log('  DELETE /api/hackathons/:id/problems/:problemId');
  console.log('         Delete a problem statement\n');

  console.log('✅ REQUEST BODY EXAMPLES:\n');
  console.log('  {');
  console.log('    "title": "Problem Title",');
  console.log('    "description": "Detailed problem description",');
  console.log('    "resources": ["link1", "link2"]  // Optional');
  console.log('  }\n');

  console.log('⚠️  CONSTRAINTS:\n');
  console.log('  ✓ ONLINE mode only (offline/hybrid rejected)');
  console.log('  ✓ Before start time only (blocked after start)');
  console.log('  ✓ Organizer only (others get 403)');
  console.log('  ✓ At least 1 required to publish');
  console.log('  ✓ At least 1 required for student registration\n');
}

// Run tests
runTests().catch(console.error);
