const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    certificateUrl: String,
    prizeTitle: String,
    issueDate: {
      type: Date,
      default: Date.now,
    },
    certificateNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
