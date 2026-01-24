require('dotenv').config();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Registration = require('./src/models/Registration');

const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Generate QR code with URL
const generateQRCodeWithURL = async (registrationId) => {
  try {
    const registrationPageUrl = `${FRONTEND_URL}/registration/${registrationId}`;

    const qrCodeDataUrl = await QRCode.toDataURL(registrationPageUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (err) {
    console.error('❌ Error generating QR code:', err);
    return null;
  }
};

const migrateQRCodes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all registrations with QR codes (offline hackathons)
    const registrations = await Registration.find({
      qrCode: { $exists: true, $ne: null }
    });

    console.log(`\n📊 Found ${registrations.length} registrations with QR codes`);

    let updated = 0;
    let failed = 0;

    for (const registration of registrations) {
      try {
        // Generate new QR code with URL
        const newQRCode = await generateQRCodeWithURL(registration._id);

        if (newQRCode) {
          registration.qrCode = newQRCode;
          await registration.save();
          updated++;
          console.log(`✅ Updated QR code for registration: ${registration._id}`);
        } else {
          failed++;
          console.log(`❌ Failed to generate QR code for: ${registration._id}`);
        }
      } catch (err) {
        failed++;
        console.error(`❌ Error updating registration ${registration._id}:`, err.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total registrations: ${registrations.length}`);
    console.log(`   Successfully updated: ${updated}`);
    console.log(`   Failed: ${failed}`);
    console.log('\n✅ Migration completed!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateQRCodes();
