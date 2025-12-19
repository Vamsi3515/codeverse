const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Result = require('../models/Result');
const User = require('../models/User');
const Team = require('../models/Team');

exports.getHackathonAnalytics = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view analytics' });
    }

    // Registration stats
    const totalRegistrations = await Registration.countDocuments({ hackathonId });
    const attendedCount = await Registration.countDocuments({ hackathonId, status: 'attended' });
    const withdrawnCount = await Registration.countDocuments({ hackathonId, status: 'withdrawn' });

    // Team stats
    const totalTeams = await Team.countDocuments({ hackathonId });
    const submittedTeams = await Team.countDocuments({ hackathonId, status: 'submitted' });

    // College-wise participation
    const registrationsByCollege = await Registration.aggregate([
      { $match: { hackathonId: new (require('mongoose')).Types.ObjectId(hackathonId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $group: {
          _id: '$user.college',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top performing teams
    const topTeams = await Result.find({ hackathonId })
      .populate({
        path: 'teamId',
        select: 'name members',
      })
      .sort({ rank: 1 })
      .limit(5);

    // Time-based stats
    const registrationsOverTime = await Registration.aggregate([
      { $match: { hackathonId: new (require('mongoose')).Types.ObjectId(hackathonId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$registrationDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        registrationStats: {
          total: totalRegistrations,
          attended: attendedCount,
          withdrawn: withdrawnCount,
          registered: totalRegistrations - attendedCount - withdrawnCount,
        },
        teamStats: {
          total: totalTeams,
          submitted: submittedTeams,
        },
        collegeWiseParticipation: registrationsByCollege,
        topTeams,
        registrationsOverTime,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Total statistics
    const totalUsers = await User.countDocuments();
    const totalHackathons = await Hackathon.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalTeams = await Team.countDocuments();

    // Hackathon status breakdown
    const hackathonsByStatus = await Hackathon.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top colleges by participation
    const topColleges = await User.aggregate([
      {
        $group: {
          _id: '$college',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Most registered hackathons
    const mostRegisteredHackathons = await Hackathon.find()
      .select('title registeredCount status')
      .sort({ registeredCount: -1 })
      .limit(10);

    // Top contributors (organizers)
    const topOrganizers = await Hackathon.aggregate([
      {
        $group: {
          _id: '$organizer',
          hackathonCount: { $sum: 1 },
        },
      },
      { $sort: { hackathonCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    // Global leaderboard
    const topUsers = await User.find()
      .select('firstName lastName email coins totalWins college')
      .sort({ coins: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      dashboard: {
        totalStats: {
          users: totalUsers,
          hackathons: totalHackathons,
          registrations: totalRegistrations,
          teams: totalTeams,
        },
        hackathonsByStatus,
        topColleges,
        mostRegisteredHackathons,
        topOrganizers,
        topUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // User's registrations
    const registrations = await Registration.find({ userId: req.user.id });
    const attendedCount = registrations.filter((r) => r.status === 'attended').length;

    // User's teams
    const teams = await Team.find({ $or: [{ leader: req.user.id }, { members: req.user.id }] });

    // User's achievements
    const results = await Result.find({
      teamId: { $in: teams.map((t) => t._id) },
    }).sort({ rank: 1 });

    const rankedTeams = results.filter((r) => r.rank <= 3).length;

    // Coins breakdown (which hackathons)
    const coinSources = await Result.find({
      teamId: { $in: teams.map((t) => t._id) },
    })
      .populate('hackathonId', 'title')
      .select('hackathonId coinReward rank');

    res.status(200).json({
      success: true,
      analytics: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          college: user.college,
        },
        stats: {
          hackathonsParticipated: registrations.length,
          hackathonsAttended: attendedCount,
          teamsJoined: teams.length,
          coinsEarned: user.coins,
          totalWins: user.totalWins,
          topRankings: rankedTeams,
        },
        coinSources,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCollegeAnalytics = async (req, res) => {
  try {
    const { college } = req.query;

    if (!college) {
      return res.status(400).json({ success: false, message: 'Please provide a college name' });
    }

    // Users from college
    const collegeUsers = await User.find({ college });
    const userCount = collegeUsers.length;

    // Registrations from college
    const collegeRegistrations = await Registration.find({
      userId: { $in: collegeUsers.map((u) => u._id) },
    });

    // Hackathons organized by college
    const organizedHackathons = await Hackathon.countDocuments({ college });

    // Top participants from college
    const topUsers = await User.find({ college })
      .select('firstName lastName coins totalWins')
      .sort({ coins: -1 })
      .limit(10);

    // Performance stats
    const teams = await Team.find({
      _id: {
        $in: collegeRegistrations.map((r) => r.teamId).filter(Boolean),
      },
    });

    const results = await Result.find({
      teamId: { $in: teams.map((t) => t._id) },
    });

    const totalWins = results.filter((r) => r.rank === 1).length;
    const totalCoinsEarned = results.reduce((sum, r) => sum + r.coinReward, 0);

    res.status(200).json({
      success: true,
      collegeAnalytics: {
        collegeName: college,
        stats: {
          totalUsers: userCount,
          totalParticipants: collegeRegistrations.length,
          hackathonsOrganized: organizedHackathons,
          totalWins,
          totalCoinsEarned,
        },
        topUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
