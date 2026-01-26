/**
 * Fair Leaderboard Scoring Algorithm
 * 
 * Fair scoring based on:
 * 1. Problems Solved (100 pts each)
 * 2. Test Cases Coverage (bonus for 100% pass)
 * 3. Time Efficiency (less time = more bonus)
 * 4. Violations (penalties based on organizer config)
 * 
 * This ensures fair competition where:
 * - Early submissions are rewarded
 * - Perfect solutions are prioritized
 * - Cheating attempts (violations) are penalized
 * - All metrics considered together fairly
 */

class LeaderboardScoreCalculator {
  /**
   * Calculate final leaderboard score for a user's submission
   * 
   * @param {object} submission - User's submission data
   * @param {object} hackathon - Hackathon details with config
   * @param {object} user - User information
   * @returns {object} { finalScore, breakdown: {...}, position: null (to be calculated) }
   */
  static calculateFinalScore(submission, hackathon, user) {
    try {
      console.log('📊 Calculating leaderboard score...');
      if (!user) {
        console.warn('⚠️  User object is null in score calculation');
        user = { email: 'unknown@example.com' }; // Fallback to avoid null reference
      }
      console.log('   User:', user.email);
      console.log('   Problems Solved:', submission.problemsSubmitted.length);
      
      // 1. BASE SCORE: Problems Solved (100 pts each)
      const problemsCount = submission.problemsSubmitted.length;
      const baseScore = problemsCount * 100;
      
      console.log(`   ✅ Base Score: ${problemsCount} problems × 100 = ${baseScore}`);

      // 2. TEST CASES BONUS (25 pts if ALL problems have 100% test pass rate)
      let testCasesBonus = 0;
      let allTestsPassed = true;
      let totalTestCases = 0;
      let passedTestCases = 0;

      submission.problemsSubmitted.forEach((problem, index) => {
        totalTestCases += problem.totalTestCases || 0;
        passedTestCases += problem.testCasesPassedCount || 0;
        
        if (problem.testCasesPassedCount !== problem.totalTestCases) {
          allTestsPassed = false;
        }
      });

      if (allTestsPassed && submission.problemsSubmitted.length > 0) {
        testCasesBonus = 25;
        console.log(`   ⭐ Test Cases Bonus: 25 (100% all test cases passed)`);
      } else {
        console.log(`   ⭐ Test Cases Bonus: 0 (${passedTestCases}/${totalTestCases} test cases)`);
      }

      // 3. TIME EFFICIENCY BONUS
      // Less time spent = more bonus (up to 50 pts)
      // Formula: (1 - timeSpent/totalTime) * 50
      const timeEfficiencyBonus = this.calculateTimeBonus(submission, hackathon);
      console.log(`   ⏱️  Time Bonus: ${timeEfficiencyBonus} (${this.formatTime(submission.timeSpentMinutes)})`);

      // 4. VIOLATIONS PENALTY
      // Apply penalties based on organizer's violation enforcement settings
      const violationPenalty = this.calculateViolationPenalty(submission, hackathon);
      console.log(`   ⚠️  Violation Penalty: -${violationPenalty} (${submission.totalViolations} violations)`);

      // FINAL SCORE
      const finalScore = baseScore + testCasesBonus + timeEfficiencyBonus - violationPenalty;

      console.log(`\n   📈 Final Score: ${finalScore}`);
      console.log(`      Base: ${baseScore} + Test: ${testCasesBonus} + Time: ${timeEfficiencyBonus} - Violations: ${violationPenalty}`);

      return {
        finalScore: Math.max(0, finalScore), // Ensure non-negative score
        breakdown: {
          baseScore,
          testCasesBonus,
          timeEfficiencyBonus,
          violationPenalty,
          totalScore: Math.max(0, finalScore)
        },
        metrics: {
          problemsSolved: problemsCount,
          testCasesPassed: passedTestCases,
          testCasesTotal: totalTestCases,
          // ✅ Only include timeSpentMinutes if hackathon has competitionDuration > 0, otherwise null
          timeSpentMinutes: hackathon?.competitionDuration && hackathon.competitionDuration > 0 ? submission.timeSpentMinutes : null,
          violations: submission.totalViolations || 0
        },
        position: null // Will be calculated when sorting leaderboard
      };
    } catch (error) {
      console.error('❌ Error calculating score:', error.message);
      return {
        finalScore: 0,
        breakdown: { baseScore: 0, testCasesBonus: 0, timeEfficiencyBonus: 0, violationPenalty: 0 },
        metrics: {},
        error: error.message
      };
    }
  }

  /**
   * Calculate time efficiency bonus
   * Less time = more bonus (up to 50 points)
   * 
   * ONLY if hackathon has competitionDuration set!
   * If no duration, return 0 (no time bonus)
   * 
   * Bonus = (1 - timeSpent/totalTime) * 50
   * 
   * Examples (180 min competition):
   * - Submitted at 1 min: (1 - 1/180) * 50 = 49.7 pts
   * - Submitted at 90 min: (1 - 90/180) * 50 = 25 pts
   * - Submitted at 180 min: (1 - 180/180) * 50 = 0 pts
   */
  static calculateTimeBonus(submission, hackathon) {
    try {
      // ✅ Check if hackathon has competitionDuration defined and > 0
      const competitionDuration = hackathon?.competitionDuration;
      
      // If no duration specified or duration is 0, no time bonus
      if (!competitionDuration || competitionDuration <= 0) {
        console.log('   ⏱️  No competition duration set → Time Bonus: 0 (N/A)');
        return 0;
      }

      const timeSpentMinutes = submission.timeSpentMinutes || 0;

      if (timeSpentMinutes <= 0) {
        return 0;
      }

      // Time efficiency: how much time left (as percentage)
      const timeEfficiency = Math.max(0, 1 - (timeSpentMinutes / competitionDuration));
      const timeBonus = Math.round(timeEfficiency * 50 * 100) / 100; // Round to 2 decimals

      console.log(`   ⏱️  Duration: ${competitionDuration}min, Time Spent: ${timeSpentMinutes}min → Bonus: ${timeBonus} pts`);
      return timeBonus;
    } catch (error) {
      console.error('Error calculating time bonus:', error);
      return 0;
    }
  }

  /**
   * Calculate violation penalty
   * Penalties only applied if organizer has configured them
   * 
   * Each violation type has configurable points to deduct
   * Only count violations that organizer is tracking
   */
  static calculateViolationPenalty(submission, hackathon) {
    try {
      let totalPenalty = 0;
      const violationDetails = submission.violationDetails || [];
      const antiCheatConfig = hackathon.antiCheatRules || {};

      // Only penalize if organizer has enabled violation tracking
      if (!antiCheatConfig.enforceTabSwitch && !antiCheatConfig.enforceFullScreen) {
        console.log('   ℹ️  No violation penalties configured by organizer');
        return 0;
      }

      // TAB SWITCHING VIOLATIONS
      if (antiCheatConfig.enforceTabSwitch) {
        const tabSwitchViolations = violationDetails.filter(v => v.type === 'tabSwitch').length;
        const tabSwitchPenalty = tabSwitchViolations * 10; // 10 pts per violation
        totalPenalty += tabSwitchPenalty;
        
        if (tabSwitchViolations > 0) {
          console.log(`        • Tab Switch: ${tabSwitchViolations} violations × 10 = -${tabSwitchPenalty}`);
        }
      }

      // FULLSCREEN VIOLATIONS
      if (antiCheatConfig.enforceFullScreen) {
        const fullScreenViolations = violationDetails.filter(v => v.type === 'fullScreen').length;
        const fullScreenPenalty = fullScreenViolations * 10; // 10 pts per violation
        totalPenalty += fullScreenPenalty;
        
        if (fullScreenViolations > 0) {
          console.log(`        • Full Screen: ${fullScreenViolations} violations × 10 = -${fullScreenPenalty}`);
        }
      }

      // Other violation types can be added here with their own penalties

      return totalPenalty;
    } catch (error) {
      console.error('Error calculating violation penalty:', error);
      return 0;
    }
  }

  /**
   * Calculate position on leaderboard
   * Positions determined by:
   * 1. Final Score (descending)
   * 2. Problems Solved (descending) - tiebreaker
   * 3. Time Spent (ascending) - tiebreaker
   * 4. Submission Time (ascending) - tiebreaker
   */
  static calculateLeaderboardPositions(submissions, hackathon) {
    try {
      console.log('📊 Calculating leaderboard positions...');

      // Calculate scores for all submissions
      const scoresWithMetrics = submissions.map(sub => {
        const scoreData = this.calculateFinalScore(sub, hackathon, sub.userId);
        return {
          ...sub,
          leaderboardScore: scoreData.finalScore,
          scoreBreakdown: scoreData.breakdown,
          scoreMetrics: scoreData.metrics  // ✅ Use scoreMetrics to match frontend expectations
        };
      });

      // Sort by:
      // 1. Final Score (descending - higher is better)
      // 2. Problems Solved (descending - tie-breaker)
      // 3. Time Spent (ascending - tie-breaker, less time is better)
      // 4. Submission Time (ascending - tie-breaker, earlier is better)
      const sorted = scoresWithMetrics.sort((a, b) => {
        // 1. Compare final scores
        if (b.leaderboardScore !== a.leaderboardScore) {
          return b.leaderboardScore - a.leaderboardScore;
        }

        // 2. Tiebreaker: More problems solved
        const aProblems = a.problemsSubmitted.length;
        const bProblems = b.problemsSubmitted.length;
        if (bProblems !== aProblems) {
          return bProblems - aProblems;
        }

        // 3. Tiebreaker: Less time spent
        if (b.timeSpentMinutes !== a.timeSpentMinutes) {
          return a.timeSpentMinutes - b.timeSpentMinutes;
        }

        // 4. Tiebreaker: Earlier submission
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      });

      // Assign positions
      let position = 1;
      const withPositions = sorted.map((sub, index) => {
        // Handle ties - same score = same position
        if (index > 0 && sub.leaderboardScore === sorted[index - 1].leaderboardScore) {
          // Same as previous
          position = index + 1;
        } else {
          position = index + 1;
        }

        return {
          ...sub,
          leaderboardPosition: position
        };
      });

      console.log(`✅ Leaderboard calculated: ${withPositions.length} participants`);
      console.log(`   🥇 1st: ${withPositions[0]?.userId?.email || 'N/A'} - ${withPositions[0]?.leaderboardScore || 0} pts`);
      if (withPositions[1]) {
        console.log(`   🥈 2nd: ${withPositions[1]?.userId?.email || 'N/A'} - ${withPositions[1]?.leaderboardScore || 0} pts`);
      }
      if (withPositions[2]) {
        console.log(`   🥉 3rd: ${withPositions[2]?.userId?.email || 'N/A'} - ${withPositions[2]?.leaderboardScore || 0} pts`);
      }

      return withPositions;
    } catch (error) {
      console.error('❌ Error calculating positions:', error);
      throw error;
    }
  }

  /**
   * Get user's ranking on leaderboard
   */
  static getUserRanking(userId, leaderboard) {
    const ranking = leaderboard.find(entry => entry.userId._id.toString() === userId.toString());
    return ranking || null;
  }

  /**
   * Format time for display
   */
  static formatTime(minutes) {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  /**
   * Get medal emoji for top positions
   */
  static getMedalEmoji(position) {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }
}

module.exports = LeaderboardScoreCalculator;
