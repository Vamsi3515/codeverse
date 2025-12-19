const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a hackathon title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: String,
      required: [true, 'Please provide organizing college'],
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    registrationStartDate: {
      type: Date,
      required: true,
    },
    registrationEndDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    // For offline hackathons
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: function () {
            return this.mode === 'offline' || this.mode === 'hybrid';
          },
        },
      },
    },
    eligibility: {
      minSemester: {
        type: Number,
        default: 1,
      },
      maxSemester: {
        type: Number,
        default: 8,
      },
      allowedColleges: [String], // Empty array means all colleges allowed
      branches: [String], // Empty array means all branches allowed
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    registrationFee: {
      type: Number,
      default: 0, // 0 means free
    },
    teamSize: {
      min: {
        type: Number,
        default: 1,
      },
      max: {
        type: Number,
        default: 4,
      },
    },
    rules: [String],
    prizes: {
      first: String,
      second: String,
      third: String,
    },
    theme: String,
    problemStatements: [
      {
        title: String,
        description: String,
        resources: [String],
      },
    ],
    // Anti-cheating configuration for online hackathons
    antiCheatRules: {
      tabSwitchLimit: Number, // 0 means unlimited
      copyPasteRestricted: Boolean,
      screenShareRequired: Boolean,
      activityTracking: Boolean,
      webcamRequired: Boolean,
    },
    // Guided participation
    guidedParticipation: {
      enabled: Boolean,
      commonQuestions: [
        {
          question: String,
          answer: String,
        },
      ],
      hints: [
        {
          problemStatement: String,
          hint: String,
        },
      ],
    },
    bannerImage: String,
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    notificationsSent: {
      registrationReminder: Boolean,
      eventStart: Boolean,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
hackathonSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Hackathon', hackathonSchema);
