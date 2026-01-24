const mongoose = require('mongoose');
require('dotenv').config();

// Test the email OTP verification system

async function testOTPSystem() {
  try {
    console.log('🧪 TESTING EMAIL OTP VERIFICATION SYSTEM\n');
    console.log('=' .repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('./src/models/User');

    // Test Case 1: Check if user has correct OTP fields
    console.log('📋 Test 1: Verify User Model Schema');
    console.log('-'.repeat(60));
    const testUser = await User.findOne({ email: '22b61a0516@sitam.co.in' }).select('+emailOTP +otpExpiry');
    
    if (testUser) {
      console.log('✅ User found:', testUser.email);
      console.log('   isEmailVerified:', testUser.isEmailVerified);
      console.log('   emailOTP:', testUser.emailOTP ? '***SET***' : 'null');
      console.log('   otpExpiry:', testUser.otpExpiry || 'null');
      
      if (testUser.otpExpiry) {
        const now = new Date();
        const expiry = new Date(testUser.otpExpiry);
        const isExpired = expiry < now;
        console.log('   OTP Expired:', isExpired ? 'YES ❌' : 'NO ✅');
        
        if (!isExpired) {
          const minutesLeft = Math.floor((expiry - now) / 60000);
          console.log('   Time remaining:', minutesLeft, 'minutes');
        }
      }
    } else {
      console.log('⚠️  No test user found');
    }

    console.log('\n📋 Test 2: Security Checks');
    console.log('-'.repeat(60));
    
    // Check that OTP fields are hidden by default
    const normalQuery = await User.findOne({ email: '22b61a0516@sitam.co.in' });
    const hasOTPInNormalQuery = normalQuery && normalQuery.emailOTP !== undefined;
    
    if (!hasOTPInNormalQuery) {
      console.log('✅ OTP is hidden in normal queries (secure)');
    } else {
      console.log('❌ WARNING: OTP is visible in normal queries!');
    }

    console.log('\n📋 Test 3: Email Configuration');
    console.log('-'.repeat(60));
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail');

    console.log('\n📋 Test 4: OTP Generation Test');
    console.log('-'.repeat(60));
    const otp1 = Math.floor(100000 + Math.random() * 900000).toString();
    const otp2 = Math.floor(100000 + Math.random() * 900000).toString();
    const otp3 = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('Generated OTPs (should be 6 digits):');
    console.log('  OTP 1:', otp1, otp1.length === 6 ? '✅' : '❌');
    console.log('  OTP 2:', otp2, otp2.length === 6 ? '✅' : '❌');
    console.log('  OTP 3:', otp3, otp3.length === 6 ? '✅' : '❌');

    console.log('\n📋 Test 5: Expiry Calculation Test');
    console.log('-'.repeat(60));
    const now = new Date();
    const expiry5min = new Date(now.getTime() + 5 * 60 * 1000);
    const diff = Math.floor((expiry5min - now) / 60000);
    console.log('Current time:', now.toLocaleString());
    console.log('Expiry time (5 min):', expiry5min.toLocaleString());
    console.log('Difference:', diff, 'minutes', diff === 5 ? '✅' : '❌');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS COMPLETED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testOTPSystem();
