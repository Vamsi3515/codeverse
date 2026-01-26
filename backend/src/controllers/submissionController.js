const HackathonSubmission = require('../models/HackathonSubmission');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const Student = require('../models/Student');
const Organizer = require('../models/Organizer');
const ComplexityAnalyzer = require('../utils/ComplexityAnalyzer');
const ScoreCalculator = require('../utils/ScoreCalculator');
const LeaderboardScoreCalculator = require('../utils/LeaderboardScoreCalculator');
const { sendEmail } = require('../utils/emailService');

/**
 * Submit a single problem solution
 */
exports.submitProblem = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { problemIndex, language, solutionCode, testCasesPassedCount, totalTestCases } = req.body;
    const userId = req.user.id;

    console.log('📝 PROBLEM SUBMISSION:', {
      userId,
      hackathonId,
      problemIndex,
      language,
      testCasesPassedCount,
      totalTestCases,
    });

    // Validate input
    if (!solutionCode || testCasesPassedCount === undefined || totalTestCases === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: solutionCode, testCasesPassedCount, totalTestCases',
      });
    }

    // Check if all test cases passed
    if (testCasesPassedCount !== totalTestCases) {
      return res.status(400).json({
        success: false,
        message: `Not all test cases passed: ${testCasesPassedCount}/${totalTestCases}. Cannot submit.`,
      });
    }

    // Fetch hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Get problem statement
    const problem = hackathon.problemStatements[problemIndex];
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Analyze complexity
    console.log('🔍 Analyzing complexity...');
    const complexityAnalysis = ComplexityAnalyzer.analyzeComplexity(
      solutionCode,
      language.toLowerCase(),
      {
        maxTimeComplexity: problem.maxTimeComplexity || 'O(n²)',
        maxSpaceComplexity: problem.maxSpaceComplexity || 'O(n)',
      }
    );

    console.log('📊 Complexity Analysis:', complexityAnalysis);

    // If complexity exceeded, validate with LLM for second opinion
    let llmValidation = null;
    if (complexityAnalysis.status === 'exceeded') {
      console.log('⚠️ Pattern analysis shows complexity exceeded. Requesting LLM validation...');
      
      llmValidation = await ComplexityAnalyzer.validateWithLLM(
        solutionCode,
        language.toLowerCase(),
        complexityAnalysis.timeComplexity,
        problem.maxTimeComplexity || 'O(n²)',
        complexityAnalysis.spaceComplexity,
        problem.maxSpaceComplexity || 'O(n)'
      );

      console.log('🤖 LLM Validation Result:', llmValidation);

      // LLM says it's NOT feasible -> reject
      if (llmValidation.isFeasible === false) {
        console.log('❌ LLM confirms complexity exceeded');
        
        // Get optimization suggestions from LLM
        const suggestions = await ComplexityAnalyzer.getSuggestions(
          solutionCode,
          language.toLowerCase(),
          complexityAnalysis
        );

        return res.status(400).json({
          success: false,
          message: 'Complexity analysis failed',
          reason: 'exceeded_complexity',
          complexityAnalysis: {
            timeComplexity: complexityAnalysis.timeComplexity,
            spaceComplexity: complexityAnalysis.spaceComplexity,
            maxTimeComplexity: problem.maxTimeComplexity || 'O(n²)',
            maxSpaceComplexity: problem.maxSpaceComplexity || 'O(n)',
            message: complexityAnalysis.message,
            patternAnalysis: true,
            llmValidation: {
              confirmed: true,
              reasoning: llmValidation.reasoning,
              confidence: llmValidation.confidence,
              suggestions: suggestions.suggestions || [],
            },
          },
        });
      }
      // LLM says it IS feasible -> allow (override pattern analysis)
      else if (llmValidation.isFeasible === true) {
        console.log('✅ LLM overrides: Solution is feasible despite pattern analysis');
        complexityAnalysis.status = 'accepted_by_llm';
        complexityAnalysis.message = `✅ Pattern analysis showed complexity concerns, but LLM validation confirmed solution is feasible (${llmValidation.reasoning})`;
      }
      // LLM couldn't decide -> use pattern analysis decision
      else {
        console.log('⚠️ LLM unavailable, using pattern-based decision');
        return res.status(400).json({
          success: false,
          message: complexityAnalysis.message,
          reason: 'exceeded_complexity',
          complexityAnalysis: {
            ...complexityAnalysis,
            llmValidation: {
              available: false,
              message: llmValidation.reasoning,
            },
          },
        });
      }
    }

    // Get or create submission record
    let submission = await HackathonSubmission.findOne({
      hackathonId,
      userId,
    });

    if (!submission) {
      submission = new HackathonSubmission({
        hackathonId,
        userId,
        joinedAt: new Date(),
        submittedAt: new Date(),
      });
    }

    // Check if problem already submitted
    const existingProblemSubmission = submission.problemsSubmitted.find((p) => p.problemIndex === problemIndex);

    if (existingProblemSubmission) {
      return res.status(400).json({
        success: false,
        message: 'This problem has already been submitted. Cannot resubmit.',
      });
    }

    // Add problem submission
    submission.problemsSubmitted.push({
      problemId: problem._id,
      problemIndex: problemIndex,
      problemTitle: problem.title,
      submittedAt: new Date(),
      language,
      solutionCode,
      timeComplexity: complexityAnalysis.timeComplexity,
      spaceComplexity: complexityAnalysis.spaceComplexity,
      testCasesPassedCount,
      totalTestCases,
      passPercentage: 100,
      complexityAnalysisTime: complexityAnalysis.analysisTime,
      llmValidation: llmValidation || null,
      status: 'accepted',
    });

    // Save submission
    await submission.save();

    console.log('✅ PROBLEM SUBMITTED SUCCESSFULLY');

    res.status(200).json({
      success: true,
      message: `Problem ${problemIndex + 1} submitted successfully!`,
      submission,
      complexityAnalysis,
      llmValidation: llmValidation || null,
    });
  } catch (error) {
    console.error('❌ PROBLEM SUBMISSION ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Submit entire hackathon (final submission with all data)
 */
exports.submitHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { totalViolations, violationDetails = [] } = req.body;
    const userId = req.user.id;

    console.log('📤 HACKATHON SUBMISSION:', {
      userId,
      hackathonId,
      totalViolations,
      violationsCount: violationDetails.length,
    });

    // Fetch hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Get submission
    let submission = await HackathonSubmission.findOne({
      hackathonId,
      userId,
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found. Please submit at least one problem first.',
      });
    }

    // Update submission with final data
    submission.submittedAt = new Date();
    submission.totalViolations = totalViolations || 0;
    submission.violationDetails = violationDetails || [];

    // Calculate time spent (from join to submission)
    // ✅ ONLY if hackathon has competitionDuration defined and > 0
    if (hackathon?.competitionDuration && hackathon.competitionDuration > 0) {
      const joinTime = new Date(submission.joinedAt).getTime();
      const submitTime = new Date(submission.submittedAt).getTime();
      const timeSpentMs = submitTime - joinTime;
      submission.timeSpentMinutes = Math.round((timeSpentMs / (1000 * 60)) * 100) / 100; // 2 decimal places

      console.log('⏱️ Time Calculation (with duration):', {
        competitionDuration: hackathon.competitionDuration,
        joinedAt: submission.joinedAt,
        submittedAt: submission.submittedAt,
        timeSpentMs: timeSpentMs,
        timeSpentMinutes: submission.timeSpentMinutes,
        timeSpentSeconds: Math.round(timeSpentMs / 1000),
      });
    } else {
      // No duration set or duration = 0, don't track time
      submission.timeSpentMinutes = null;
      console.log('⏱️ Time Calculation (NO/OPEN duration): Skipped - hackathon has no competitionDuration or competitionDuration=0');
    }

    // Fetch user for score calculation (check Student and Organizer collections)
    let user = await Student.findById(userId);
    if (!user) {
      user = await Organizer.findById(userId);
    }
    if (!user) {
      user = await User.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please make sure you are logged in.' });
    }

    // Calculate leaderboard score using fair algorithm
    const scoreData = LeaderboardScoreCalculator.calculateFinalScore(submission, hackathon, user);
    submission.leaderboardScore = scoreData.finalScore;
    submission.scoreBreakdown = scoreData.breakdown;
    submission.scoreMetrics = scoreData.metrics;
    submission.status = 'completed';

    console.log('🏆 Leaderboard Score Calculated:', scoreData);

    // Save final submission
    await submission.save();

    // Populate user info for response
    await submission.populate('userId', 'email firstName lastName');

    // Send confirmation email
    try {
      const emailContent = `
        <h2>Hackathon Submission Confirmed</h2>
        <p>Dear ${user.firstName},</p>
        <p>Your hackathon submission for <strong>${hackathon.title}</strong> has been received and processed.</p>
        
        <h3>Submission Summary:</h3>
        <ul>
          <li><strong>Problems Solved:</strong> ${scoreData.metrics.problemsSolved}</li>
          <li><strong>Total Time:</strong> ${LeaderboardScoreCalculator.formatTime(submission.timeSpentMinutes)}</li>
          <li><strong>Violations:</strong> ${scoreData.metrics.violations}</li>
          <li><strong>Your Score:</strong> ${scoreData.finalScore}</li>
        </ul>
        
        <h3>Score Breakdown:</h3>
        <ul>
          <li>Base Score (${scoreData.metrics.problemsSolved} problems × 100): ${scoreData.breakdown.baseScore} pts</li>
          <li>Test Cases Bonus: +${scoreData.breakdown.testCasesBonus} pts</li>
          <li>Time Efficiency Bonus: +${scoreData.breakdown.timeEfficiencyBonus} pts</li>
          <li>Violation Penalties: -${scoreData.breakdown.violationPenalty} pts</li>
        </ul>
        
        <p>Check the leaderboard to see your rank!</p>
      `;

      await sendEmail(
        user.email,
        `Hackathon Submission Confirmed - ${hackathon.title}`,
        emailContent
      );
    } catch (emailError) {
      console.warn('Warning: Could not send confirmation email:', emailError);
      // Don't fail the submission if email fails
    }

    console.log('✅ HACKATHON SUBMITTED SUCCESSFULLY');

    res.status(200).json({
      success: true,
      message: 'Hackathon submitted successfully!',
      submission: {
        hackathonId: submission.hackathonId,
        userId: submission.userId,
        problemsSubmitted: submission.problemsSubmitted.length,
        leaderboardScore: submission.leaderboardScore,
        totalTimeSpentMinutes: submission.totalTimeSpentMinutes,
        totalViolations: submission.totalViolations,
        scoreBreakdown: submission.scoreBreakdown,
      },
    });
  } catch (error) {
    console.error('❌ HACKATHON SUBMISSION ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get leaderboard for a hackathon
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { limit = 100 } = req.query;

    console.log('📊 Fetching leaderboard:', { hackathonId, limit });

    // Fetch hackathon for config
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Fetch all completed submissions for this hackathon
    const submissions = await HackathonSubmission.find({
      hackathonId,
      status: 'completed',
    })
      .populate('userId', 'firstName lastName email')
      .lean();

    if (submissions.length === 0) {
      return res.status(200).json({
        success: true,
        leaderboard: [],
        message: 'No completed submissions yet',
      });
    }

    console.log(`📊 Processing ${submissions.length} submissions...`);

    // Calculate leaderboard positions using fair algorithm
    const rankedLeaderboard = LeaderboardScoreCalculator.calculateLeaderboardPositions(submissions, hackathon);

    // Return top N (limit)
    const topLeaderboard = rankedLeaderboard.slice(0, Math.min(parseInt(limit), rankedLeaderboard.length));

    console.log(`✅ Leaderboard generated: Top ${topLeaderboard.length} of ${rankedLeaderboard.length} participants`);

    res.status(200).json({
      success: true,
      leaderboard: topLeaderboard,
      totalSubmissions: submissions.length,
      totalRanked: rankedLeaderboard.length,
    });
  } catch (error) {
    console.error('❌ LEADERBOARD FETCH ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user's submission details
 */
exports.getUserSubmission = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user.id;

    const submission = await HackathonSubmission.findOne({
      hackathonId,
      userId,
    }).populate('userId', 'firstName lastName email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found for this user and hackathon',
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error('❌ GET SUBMISSION ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user's rank on leaderboard
 */
exports.getUserRank = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user.id;

    // Get all submissions for this hackathon
    const submissions = await HackathonSubmission.find({
      hackathonId,
      status: 'completed',
    }).lean();

    if (submissions.length === 0) {
      return res.status(200).json({
        success: true,
        rank: null,
        message: 'No submissions yet',
      });
    }

    // Generate ranked leaderboard
    const rankedLeaderboard = ScoreCalculator.generateLeaderboard(submissions);

    // Get user's rank
    const rankDetails = ScoreCalculator.getRankDetails(rankedLeaderboard, userId);

    if (!rankDetails) {
      return res.status(404).json({
        success: false,
        message: 'User not found in leaderboard',
      });
    }

    res.status(200).json({
      success: true,
      rankDetails,
    });
  } catch (error) {
    console.error('❌ GET RANK ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user's all submissions (for tracking attempted hackathons)
 */
exports.getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📋 FETCHING USER SUBMISSIONS:', { userId });

    // Fetch only COMPLETED submissions for this user (attempted hackathons)
    const submissions = await HackathonSubmission.find({ 
      userId,
      status: 'completed'
    })
      .select('hackathonId status submittedAt leaderboardScore')
      .populate('hackathonId', '_id title competitionDuration')
      .lean();

    if (!submissions || submissions.length === 0) {
      console.log('⚠️ NO COMPLETED SUBMISSIONS FOUND for user:', userId);
      return res.status(200).json({
        success: true,
        submissions: [],
        message: 'No completed submissions found',
      });
    }

    console.log('✅ USER COMPLETED SUBMISSIONS FETCHED:', submissions.length, 'submissions', submissions.map(s => ({ hackId: s.hackathonId._id, title: s.hackathonId.title, status: s.status })));

    res.status(200).json({
      success: true,
      submissions: submissions,
    });
  } catch (error) {
    console.error('❌ GET MY SUBMISSIONS ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all submissions for a specific hackathon (for organizers)
 */
exports.getHackathonSubmissions = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    console.log('📋 FETCHING HACKATHON SUBMISSIONS:', { hackathonId });

    // Fetch all submissions for this hackathon
    const submissions = await HackathonSubmission.find({ 
      hackathonId,
      status: 'completed'
    })
      .select('userId studentName email leaderboardScore submittedAt problemsSubmitted')
      .lean();

    const count = submissions.length;

    console.log('✅ HACKATHON SUBMISSIONS FETCHED:', count, 'submissions');

    res.status(200).json({
      success: true,
      count: count,
      submissions: submissions,
      message: `Found ${count} completed submissions`,
    });
  } catch (error) {
    console.error('❌ GET HACKATHON SUBMISSIONS ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
