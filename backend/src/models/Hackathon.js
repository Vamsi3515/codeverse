const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByRole: {
      type: String,
      enum: ['organizer', 'ORGANIZER', 'STUDENT_COORDINATOR'],
    },
    college: {
      type: String,
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    registrationStartDate: {
      type: Date,
    },
    registrationEndDate: {
      type: Date,
    },
    duration: {
      type: Number, // in hours - hackathon window duration (how long hackathon is open)
    },
    competitionDuration: {
      type: Number, // in minutes - time allowed after user joins to submit solution (optional)
      default: null,
    },
    // For offline hackathons
    location: {
      venueName: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
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
    },
    registrationFee: {
      type: Number,
      default: 0, // 0 means free
    },
    participationType: {
      type: String,
      enum: ['SOLO', 'TEAM', 'solo', 'team'],
      default: 'SOLO',
    },
    minTeamSize: {
      type: Number,
      default: 2,
    },
    maxTeamSize: {
      type: Number,
      default: 4,
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
        inputFormat: String,
        outputFormat: String,
        constraints: String,
        sampleInput: String,
        sampleOutput: String,
        explanation: String,
        sampleTestCases: [
          {
            input: String,
            output: String,
          },
        ],
        hiddenTestCases: [
          {
            input: String,
            output: String,
          },
        ],
        timeLimit: {
          type: Number,
          default: 1, // seconds
        },
        memoryLimit: {
          type: Number,
          default: 256, // MB
        },
        allowedLanguages: {
          type: [String],
          default: ['C', 'C++', 'Java', 'Python'],
        },
        resources: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Anti-cheating configuration for online hackathons
    antiCheatRules: {
      tabSwitchLimit: Number, // 0 means unlimited
      tabSwitchAllowed: Boolean,
      copyPasteRestricted: Boolean,
      copyPasteAllowed: Boolean,
      screenShareRequired: Boolean,
      fullScreenRequired: Boolean,
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
      enum: ['draft', 'published', 'scheduled', 'ongoing', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    isPublished: {
      type: Boolean,
      default: false,
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
