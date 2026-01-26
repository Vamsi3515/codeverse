import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Award, Zap, Clock, AlertCircle, Loader } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

/**
 * Professional Contest Leaderboard
 * Shows rankings with fair scoring based on:
 * - Problems Solved
 * - Test Cases Coverage
 * - Time Efficiency
 * - Violations Penalties
 */
export default function Leaderboard() {
  const { id } = useParams(); // hackathonId
  const navigate = useNavigate();
  
  const [hackathon, setHackathon] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, completed, inProgress

  useEffect(() => {
    fetchLeaderboard();
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch hackathon
      const hackRes = await axios.get(`${API_URL}/hackathons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHackathon(hackRes.data.hackathon);

      // Fetch leaderboard
      const leaderRes = await axios.get(`${API_URL}/hackathons/${id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLeaderboard(leaderRes.data.leaderboard || []);
      
      // Find current user's rank
      const userId = localStorage.getItem('userId');
      const userRank = leaderRes.data.leaderboard?.find(
        entry => entry.userId?._id === userId
      );
      setCurrentUserRank(userRank);

      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const formatTime = (minutes) => {
    // Handle "N/A" or when hackathon duration isn't set
    if (minutes === undefined || minutes === null) return 'N/A';
    if (minutes === 0) return '0m';
    
    // Handle decimal minutes (e.g., 0.25 minutes = 15 seconds)
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    
    if (minutes < 60) return `${Math.round(minutes * 100) / 100}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading leaderboard...</p>
          <p className="text-gray-500 text-sm mt-2">Calculating final scores and rankings</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Leaderboard</h2>
            <p className="text-red-200">{error}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => fetchLeaderboard()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/dashboard/student')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">
                {hackathon?.title || 'Leaderboard'}
              </h1>
            </div>
            <button
              onClick={() => navigate('/dashboard/student')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              title="Go back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-400">
            {leaderboard.length} participants | Final rankings based on score and performance
          </p>
        </div>

        {/* Current User Highlight */}
        {currentUserRank && (
          <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-600/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Rank</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-blue-400">#{currentUserRank.leaderboardPosition}</span>
                  <div>
                    <p className="text-white font-semibold">{currentUserRank.userId?.firstName} {currentUserRank.userId?.lastName}</p>
                    <p className="text-gray-400 text-sm">{currentUserRank.leaderboardScore} points</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400 mb-2">{currentUserRank.leaderboardScore}</div>
                <p className="text-gray-400 text-sm">{currentUserRank.problemsSubmitted?.length || 0} problems solved</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-900/80 p-6 border-b border-gray-700 font-semibold text-gray-300">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Participant</div>
            <div className="col-span-2">Problems</div>
            <div className="col-span-2">Tests</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2 text-right">Score</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-700">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-lg">No submissions yet</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`p-6 ${
                    currentUserRank?._id === entry._id
                      ? 'bg-blue-900/20 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-700/30 transition-colors'
                  }`}
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        {index < 3 && <span className="text-2xl">{getMedalEmoji(index + 1)}</span>}
                        <span className="text-2xl font-bold text-white">#{entry.leaderboardPosition}</span>
                      </div>
                    </div>

                    {/* Participant */}
                    <div className="col-span-3">
                      <p className="font-semibold text-white">
                        {entry.userId?.firstName} {entry.userId?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">{entry.userId?.email}</p>
                    </div>

                    {/* Problems */}
                    <div className="col-span-2">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-400">
                          {entry.problemsSubmitted?.length || 0}
                        </p>
                        <p className="text-gray-400 text-xs">Problems Solved</p>
                      </div>
                    </div>

                    {/* Test Cases */}
                    <div className="col-span-2">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-blue-400">
                          {entry.scoreMetrics?.testCasesPassed || 0}/{entry.scoreMetrics?.testCasesTotal || 0}
                        </p>
                        <p className="text-gray-400 text-xs">Test Cases</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-3">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <div>
                          <p className="font-semibold text-white">
                            {formatTime(entry.timeSpentMinutes || 0)}
                          </p>
                          <p className="text-gray-400 text-xs">Time Spent</p>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-right">
                      <div className="inline-block text-right">
                        <p className="text-4xl font-bold text-blue-400">
                          {entry.leaderboardScore}
                        </p>
                        <p className="text-gray-400 text-xs">Points</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {index < 3 && <span className="text-xl">{getMedalEmoji(index + 1)}</span>}
                          <span className="text-lg font-bold text-white">#{entry.leaderboardPosition}</span>
                        </div>
                        <p className="font-semibold text-white">
                          {entry.userId?.firstName} {entry.userId?.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">{entry.userId?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{entry.leaderboardScore}</p>
                        <p className="text-gray-400 text-xs">Points</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-gray-700/50 rounded p-2">
                        <p className="font-bold text-green-400">{entry.problemsSubmitted?.length || 0}</p>
                        <p className="text-gray-400 text-xs">Problems</p>
                      </div>
                      <div className="bg-gray-700/50 rounded p-2">
                        <p className="font-bold text-blue-400">{entry.scoreMetrics?.testCasesPassed || 0}/{entry.scoreMetrics?.testCasesTotal || 0}</p>
                        <p className="text-gray-400 text-xs">Tests</p>
                      </div>
                      <div className="bg-gray-700/50 rounded p-2">
                        <p className="font-bold text-orange-400">{formatTime(entry.timeSpentMinutes || 0)}</p>
                        <p className="text-gray-400 text-xs">Time</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Score Breakdown Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Scoring System
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">Base Score</span>
                <span className="text-green-400 font-semibold">100 pts per problem</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Test Cases Bonus</span>
                <span className="text-green-400 font-semibold">+25 pts (100% pass)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Time Efficiency</span>
                <span className="text-green-400 font-semibold">Up to +50 pts</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Violations</span>
                <span className="text-red-400 font-semibold">-10 pts each</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Ranking Criteria
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Highest Final Score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Most Problems Solved (Tie)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Fastest Submission (Tie)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Earliest Submission (Tie)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
