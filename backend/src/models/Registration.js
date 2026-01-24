const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    selfieUrl: String,
    participationType: {
      type: String,
      enum: ['SOLO', 'TEAM', 'solo', 'team'],
      required: true,
    },
    // For team-based registrations
    team: {
      teamName: {
        type: String,
        required: function() {
          return this.participationType === 'TEAM' || this.participationType === 'team';
        }
      },
      leader: {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: function() {
            return this.participationType === 'TEAM' || this.participationType === 'team';
          }
        },
        email: {
          type: String,
          required: function() {
            return this.participationType === 'TEAM' || this.participationType === 'team';
          }
        },
        rollNumber: {
          type: String,
          required: function() {
            return this.participationType === 'TEAM' || this.participationType === 'team';
          }
        }
      },
      members: [{
        email: {
          type: String,
          required: true
        },
        rollNumber: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ['INVITED', 'CONFIRMED'],
          default: 'CONFIRMED'
        }
      }]
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
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrCode: {
      type: String, // Base64 encoded PNG image data URL
      default: null,
    },
    qrIssuedAt: Date,
    qrUsed: {
      type: Boolean,
      default: false,
    },
    qrUsedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
