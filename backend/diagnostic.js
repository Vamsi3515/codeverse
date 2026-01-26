#!/usr/bin/env node

/**
 * Quick diagnostic to verify Google Calendar setup
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n📋 GOOGLE CALENDAR SETUP DIAGNOSTIC\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('   ✓ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ MISSING');
console.log('   ✓ GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ MISSING');
console.log('   ✓ GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? '✅ SET' : '❌ MISSING');
console.log('   ✓ BACKEND_URL:', process.env.BACKEND_URL ? '✅ SET' : '❌ MISSING (optional)');

// Check if credentials look valid
console.log('\n2️⃣ Credential Format Check:');

if (process.env.GOOGLE_CLIENT_ID) {
  const isValid = process.env.GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com');
  console.log('   ✓ Client ID format:', isValid ? '✅ Valid' : '❌ Invalid (should end with apps.googleusercontent.com)');
}

if (process.env.GOOGLE_CLIENT_SECRET) {
  const isValid = process.env.GOOGLE_CLIENT_SECRET.startsWith('GOCSPX-');
  console.log('   ✓ Client Secret format:', isValid ? '✅ Valid' : '❌ Invalid (should start with GOCSPX-)');
}

if (process.env.GOOGLE_REDIRECT_URI) {
  const isValid = process.env.GOOGLE_REDIRECT_URI.includes('/api/calendar/callback');
  console.log('   ✓ Redirect URI format:', isValid ? '✅ Valid' : '❌ Invalid (should include /api/calendar/callback)');
}

// Check if Google library is available
console.log('\n3️⃣ Dependencies Check:');
try {
  require('googleapis');
  console.log('   ✓ googleapis package:', '✅ Installed');
} catch (e) {
  console.log('   ✓ googleapis package:', '❌ NOT installed (run: npm install googleapis)');
}

// Summary
console.log('\n✅ Diagnostic Complete\n');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI) {
  console.log('🎉 Google Calendar credentials are properly configured!');
  console.log('   Next: Restart your backend server with: npm start\n');
} else {
  console.log('⚠️  Missing required credentials. Please:');
  console.log('   1. Get OAuth credentials from: https://console.cloud.google.com');
  console.log('   2. Add them to backend/.env.local');
  console.log('   3. Restart the backend server\n');
}
