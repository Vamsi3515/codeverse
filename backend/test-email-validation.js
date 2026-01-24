/**
 * Test Script for Email Validation & OTP Verification
 * Run with: node test-email-validation.js
 */

const { validateCollegeEmail, isPublicEmailDomain, extractDomain } = require('./src/utils/emailValidation');

console.log('═══════════════════════════════════════════════════════════');
console.log('  EMAIL VALIDATION & OTP VERIFICATION - TEST SCRIPT');
console.log('═══════════════════════════════════════════════════════════\n');

// Test data
const testEmails = [
  // Valid college emails
  { email: 'student@mit.edu', expected: 'VALID' },
  { email: 'john.doe@stanford.edu', expected: 'VALID' },
  { email: 'maria@oxbridge.ac.uk', expected: 'VALID' },
  { email: 'rahul@iitbombay.ac.in', expected: 'VALID' },
  { email: 'alex@university.edu.au', expected: 'VALID' },
  { email: 'student@college.org', expected: 'VALID' },
  
  // Invalid - public emails
  { email: 'student@gmail.com', expected: 'BLOCKED' },
  { email: 'john@yahoo.com', expected: 'BLOCKED' },
  { email: 'maria@outlook.com', expected: 'BLOCKED' },
  { email: 'test@hotmail.com', expected: 'BLOCKED' },
  { email: 'user@icloud.com', expected: 'BLOCKED' },
  { email: 'person@protonmail.com', expected: 'BLOCKED' },
  
  // Invalid format
  { email: 'notanemail', expected: 'INVALID' },
  { email: 'missing@', expected: 'INVALID' },
  { email: '@nodomain.com', expected: 'INVALID' },
  { email: '', expected: 'INVALID' },
];

console.log('Testing Email Validation...\n');
console.log('─────────────────────────────────────────────────────────\n');

let passed = 0;
let failed = 0;

testEmails.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.email}`);
  
  const result = validateCollegeEmail(test.email);
  let actualResult = 'INVALID';
  
  if (result.isValid) {
    actualResult = 'VALID';
  } else if (result.message.includes('college-issued email')) {
    actualResult = 'BLOCKED';
  }
  
  const testPassed = actualResult === test.expected;
  
  if (testPassed) {
    console.log(`  ✅ PASS - ${result.message}`);
    if (result.domain) {
      console.log(`     Domain: ${result.domain}`);
    }
    passed++;
  } else {
    console.log(`  ❌ FAIL - Expected: ${test.expected}, Got: ${actualResult}`);
    console.log(`     Message: ${result.message}`);
    failed++;
  }
  
  console.log('');
});

console.log('─────────────────────────────────────────────────────────\n');
console.log('Test Results:');
console.log(`  Total Tests: ${testEmails.length}`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  Success Rate: ${((passed / testEmails.length) * 100).toFixed(1)}%`);
console.log('\n═══════════════════════════════════════════════════════════\n');

// Additional utility tests
console.log('Testing Utility Functions:\n');

console.log('1. isPublicEmailDomain()');
console.log(`   gmail.com is public: ${isPublicEmailDomain('test@gmail.com')}`);
console.log(`   mit.edu is public: ${isPublicEmailDomain('test@mit.edu')}\n`);

console.log('2. extractDomain()');
console.log(`   Domain from 'student@mit.edu': ${extractDomain('student@mit.edu')}`);
console.log(`   Domain from 'john@stanford.edu': ${extractDomain('john@stanford.edu')}\n`);

console.log('═══════════════════════════════════════════════════════════\n');

// OTP Generation Test
console.log('Testing OTP Generation:\n');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log('Generating 5 sample OTPs:');
for (let i = 1; i <= 5; i++) {
  const otp = generateOTP();
  console.log(`  ${i}. ${otp} (${otp.length} digits)`);
}

console.log('\n═══════════════════════════════════════════════════════════\n');
console.log('✅ All tests completed!\n');
console.log('Next Steps:');
console.log('  1. Start the server: npm start');
console.log('  2. Test registration: POST /api/auth/signup');
console.log('  3. Verify OTP: POST /api/auth/verify-email');
console.log('\n═══════════════════════════════════════════════════════════\n');
