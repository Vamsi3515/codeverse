const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'withdrawn', 'disqualified'],
      default: 'registered',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'free'],
      default: 'free',
    },
    paymentId: String,
    amountPaid: Number,
    isTeamLead: Boolean,
    emailVerified: Boolean,
    phoneVerified: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
