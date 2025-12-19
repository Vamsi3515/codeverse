const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    judgeScores: [
      {
        judge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        score: Number,
        feedback: String,
      },
    ],
    coinReward: {
      type: Number,
      default: 0,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: String,
    prizeTitle: String,
    coinsDistributed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
