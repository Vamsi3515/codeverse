/**
 * Leaderboard Score Calculator
 * Calculates score based on problems solved, time taken, and violations
 */

class ScoreCalculator {
  /**
   * Calculate leaderboard score
   * @param {object} submission - HackathonSubmission object
   * @returns {object} { totalScore, breakdown }
   */
  static calculateScore(submission) {
    try {
      const {
        problemsSubmitted = [],
        totalViolations = 0,
        totalTimeSpentMinutes = 0,
      } = submission;

      // Calculate base score (problems solved)
      const problemsCount = problemsSubmitted.length;
      const baseScore = problemsCount * 100;

      // Calculate time bonus/penalty
      const timeBonus = this.calculateTimeBonus(problemsCount, totalTimeSpentMinutes);

      // Calculate violation penalty
      const violationPenalty = totalViolations * 10;

      // Final score
      const totalScore = Math.max(0, baseScore + timeBonus - violationPenalty);

      return {
        totalScore: Math.floor(totalScore),
        breakdown: {
          baseScore,
          timeBonus,
          violationPenalty,
          problemsSolved: problemsCount,
          totalViolations,
          totalTimeSpentMinutes,
        },
      };
    } catch (error) {
      console.error('Score calculation error:', error);
      return {
        totalScore: 0,
        breakdown: {
          baseScore: 0,
          timeBonus: 0,
          violationPenalty: 0,
          problemsSolved: 0,
          totalViolations: 0,
          totalTimeSpentMinutes: 0,
        },
      };
    }
  }

  /**
   * Calculate time bonus based on problems solved and time taken
   * Incentivizes solving more problems quickly
   */
  static calculateTimeBonus(problemsCount, totalTimeSpentMinutes) {
    if (problemsCount === 0) return 0;

    let bonus = 0;

    // Bonus for solving first problem quickly
    if (problemsCount >= 1) {
      if (totalTimeSpentMinutes < 30) {
        bonus += 50; // Very fast
      } else if (totalTimeSpentMinutes < 60) {
        bonus += 25; // Fast
      }
      // No bonus if > 60 minutes for first problem
    }

    // Bonus for solving additional problems
    if (problemsCount >= 2) {
      const avgTimePerProblem = totalTimeSpentMinutes / problemsCount;
      if (avgTimePerProblem < 20) {
        bonus += 30 * (problemsCount - 1); // Solving quickly
      } else if (avgTimePerProblem < 40) {
        bonus += 15 * (problemsCount - 1); // Moderate pace
      } else {
        bonus -= 5 * (problemsCount - 1); // Slow pace
      }
    }

    // Bonus for solving all/most problems
    if (problemsCount >= 3) {
      bonus += 50; // Solving 3+ problems is significant
    }

    return bonus;
  }

  /**
   * Generate leaderboard ranking
   * @param {array} submissions - Array of HackathonSubmission objects
   * @returns {array} Ranked and scored submissions
   */
  static generateLeaderboard(submissions) {
    try {
      // Calculate scores for all submissions
      const scoredSubmissions = submissions.map((submission) => {
        const { totalScore, breakdown } = this.calculateScore(submission);
        return {
          ...submission.toObject ? submission.toObject() : submission,
          leaderboardScore: totalScore,
          scoreBreakdown: breakdown,
        };
      });

      // Sort by score (descending), then by submission time (ascending)
      const ranked = scoredSubmissions.sort((a, b) => {
        // Primary: Score descending
        if (b.leaderboardScore !== a.leaderboardScore) {
          return b.leaderboardScore - a.leaderboardScore;
        }
        // Secondary: Earlier submission time (submit faster = better rank)
        const aSubmitTime = new Date(a.submittedAt).getTime();
        const bSubmitTime = new Date(b.submittedAt).getTime();
        return aSubmitTime - bSubmitTime;
      });

      // Add rank position
      return ranked.map((submission, index) => ({
        ...submission,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Leaderboard generation error:', error);
      return [];
    }
  }

  /**
   * Get rank details with percentile info
   */
  static getRankDetails(ranked, userId) {
    const userRank = ranked.find((r) => r.userId.toString() === userId.toString());

    if (!userRank) {
      return null;
    }

    const percentile = ((ranked.length - userRank.rank + 1) / ranked.length) * 100;

    return {
      rank: userRank.rank,
      totalParticipants: ranked.length,
      score: userRank.leaderboardScore,
      percentile: Math.round(percentile),
      scoreBreakdown: userRank.scoreBreakdown,
    };
  }

  /**
   * Get top N participants
   */
  static getTopParticipants(ranked, limit = 10) {
    return ranked.slice(0, Math.min(limit, ranked.length));
  }

  /**
   * Format score for display
   */
  static formatScoreBreakdown(breakdown) {
    return {
      baseScore: `${breakdown.baseScore} pts (${breakdown.problemsSolved} problems × 100)`,
      timeBonus: `${breakdown.timeBonus > 0 ? '+' : ''}${breakdown.timeBonus} pts`,
      violationPenalty: `-${breakdown.violationPenalty} pts (${breakdown.totalViolations} violations)`,
      timeTaken: `${Math.floor(breakdown.totalTimeSpentMinutes / 60)}h ${breakdown.totalTimeSpentMinutes % 60}m`,
    };
  }
}

module.exports = ScoreCalculator;
