// SMS Service - Using console logs for demo (integrate Twilio/AWS SNS in production)

exports.sendSMS = async (phone, message) => {
  try {
    // In production, integrate with Twilio, AWS SNS, or other SMS provider
    // Example with Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    // For now, log to console (DEMO MODE)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SMS NOTIFICATION (DEMO MODE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${phone}`);
    console.log(`Message: ${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

exports.generateOTPMessage = (otp) => {
  return `Your CodeVerse Campus verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
};
