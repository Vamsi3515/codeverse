const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
    },
    type: {
      type: String,
      enum: ['registration_reminder', 'event_start', 'event_end', 'result_declared', 'coin_awarded', 'certificate_issued', 'team_invitation', 'general'],
      required: true,
    },
    title: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
