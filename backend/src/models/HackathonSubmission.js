const mongoose = require('mongoose');

const hackathonSubmissionSchema = new mongoose.Schema(
  {
    // User & Hackathon Info
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

    // Timing
    joinedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalTimeSpentMinutes: {
      type: Number, // Total time from join to submit
      default: 0,
    },

    // Problems Submitted
    problemsSubmitted: [
      {
        problemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Hackathon.problemStatements',
        },
        problemIndex: Number, // 0, 1, 2, etc
        problemTitle: String,
        submittedAt: Date,
        language: String,
        solutionCode: String,
        timeComplexity: String, // e.g., "O(n)", "O(n log n)", "O(1)"
        spaceComplexity: String, // e.g., "O(1)", "O(n)"
        testCasesPassedCount: Number,
        totalTestCases: Number,
        passPercentage: Number, // 0-100
        complexityAnalysisTime: Number, // milliseconds taken to analyze
        status: {
          type: String,
          enum: ['accepted', 'rejected', 'pending'],
          default: 'accepted',
        },
      },
    ],

    // Violations Tracking
    totalViolations: {
      type: Number,
      default: 0,
    },
    violationDetails: [
      {
        type: {
          type: String,
          enum: ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_PASTE'],
        },
        timestamp: Date,
        problemIndex: Number,
        description: String,
      },
    ],

    // Leaderboard Score
    leaderboardScore: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      baseScore: Number, // Problems solved × 100
      timeBonus: Number,
      violationPenalty: Number,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'completed', 'disqualified'],
      default: 'active',
    },

    // Additional Info
    notes: String,
    metadata: mongoose.Schema.Types.Mixed, // For any additional data
  },
  { timestamps: true }
);

// Create compound index for faster queries
hackathonSubmissionSchema.index({ hackathonId: 1, userId: 1 }, { unique: true });
hackathonSubmissionSchema.index({ leaderboardScore: -1, submittedAt: 1 });

module.exports = mongoose.model('HackathonSubmission', hackathonSubmissionSchema);
