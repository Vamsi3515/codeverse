import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';

/**
 * LeaderboardComponent.jsx
 * Professional leaderboard display for hackathon results
 * Shows ranked participants with scores and their percentile ranking
 */
const LeaderboardComponent = ({ hackathonId, currentUserId = null }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [hackathonId]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch leaderboard
      const leaderboardRes = await axios.get(
        `/api/hackathons/${hackathonId}/leaderboard`
      );
      setLeaderboard(leaderboardRes.data.leaderboard || []);

      // Fetch user rank if logged in
      if (currentUserId) {
        const rankRes = await axios.get(
          `/api/hackathons/${hackathonId}/my-rank`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setUserRank(rankRes.data.rankData);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-slate-50 border-slate-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-slate-100 text-slate-800';
      case 3:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-200 h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
        </div>
        <p className="text-slate-600">
          {leaderboard.length} participants | Ranked by score and submission time
        </p>
      </div>

      {/* User's Rank Card (if logged in) */}
      {userRank && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-indigo-100 text-sm mb-1">Your Rank</p>
              <p className="text-4xl font-bold">#{userRank.rank}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Your Score</p>
              <p className="text-4xl font-bold">{userRank.score}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Percentile</p>
              <p className="text-4xl font-bold">{Math.round(userRank.percentile)}%</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Total Participants</p>
              <p className="text-4xl font-bold">{userRank.totalParticipants}</p>
            </div>
          </div>
          
          {/* User's Score Breakdown */}
          {userRank.scoreBreakdown && (
            <div className="mt-6 pt-6 border-t border-indigo-400 grid grid-cols-3 gap-4">
              <div>
                <p className="text-indigo-100 text-xs mb-1">Base Score</p>
                <p className="text-lg font-semibold">{userRank.scoreBreakdown.baseScore}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-xs mb-1">Time Bonus</p>
                <p className={`text-lg font-semibold ${userRank.scoreBreakdown.timeBonus >= 0 ? 'text-green-200' : 'text-orange-200'}`}>
                  {userRank.scoreBreakdown.timeBonus >= 0 ? '+' : ''}{userRank.scoreBreakdown.timeBonus}
                </p>
              </div>
              <div>
                <p className="text-indigo-100 text-xs mb-1">Violations Penalty</p>
                <p className="text-lg font-semibold text-red-200">
                  -{userRank.scoreBreakdown.violationPenalty}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No submissions yet</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUserId && entry.userId === currentUserId;

            return (
              <div
                key={entry.userId}
                className={`border-2 rounded-lg p-4 transition-all ${getRankColor(rank)} ${
                  isCurrentUser ? 'border-indigo-400 shadow-lg' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`${getRankBadgeColor(rank)} w-16 h-16 rounded-lg flex items-center justify-center font-bold`}>
                    {getMedalIcon(rank) || (
                      <span className="text-lg">{rank}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {entry.userName || 'Anonymous User'}
                      </h3>
                      {isCurrentUser && (
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                      <div>
                        <p className="text-xs text-slate-500">Problems Solved</p>
                        <p className="font-medium text-slate-900">
                          {entry.problemsSubmitted?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Time Spent</p>
                        <p className="font-medium text-slate-900">
                          {entry.totalTimeSpentMinutes ? `${Math.round(entry.totalTimeSpentMinutes)} min` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Violations</p>
                        <p className={`font-medium ${entry.violationDetails?.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {entry.violationDetails?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-xs text-slate-600 mb-1">Score</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {entry.leaderboardScore}
                    </p>
                    
                    {/* Score Breakdown */}
                    {entry.scoreBreakdown && (
                      <div className="mt-3 text-right text-xs space-y-1">
                        <p className="text-slate-600">
                          Base: <span className="font-semibold text-slate-900">{entry.scoreBreakdown.baseScore}</span>
                        </p>
                        <p className={entry.scoreBreakdown.timeBonus >= 0 ? 'text-green-600' : 'text-orange-600'}>
                          Bonus: <span className="font-semibold">{entry.scoreBreakdown.timeBonus >= 0 ? '+' : ''}{entry.scoreBreakdown.timeBonus}</span>
                        </p>
                        {entry.scoreBreakdown.violationPenalty > 0 && (
                          <p className="text-red-600">
                            Penalties: <span className="font-semibold">-{entry.scoreBreakdown.violationPenalty}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderboardComponent;
