const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

exports.getResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  return {
    resetToken,
    resetTokenHash: crypto.createHash('sha256').update(resetToken).digest('hex'),
    resetTokenExpire: Date.now() + 30 * 60 * 1000, // 30 minutes
  };
};

exports.getVerificationToken = () => {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  return {
    verificationToken,
    verificationTokenHash: crypto.createHash('sha256').update(verificationToken).digest('hex'),
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
};
