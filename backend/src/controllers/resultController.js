const crypto = require('crypto');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Team = require('../models/Team');
const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Notification = require('../models/Notification');

exports.addJudgeScore = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { score, feedback } = req.body;

    let result = await Result.findById(resultId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    result.judgeScores.push({
      judge: req.user.id,
      score,
      feedback,
    });

    // Calculate average score
    const avgScore = result.judgeScores.reduce((sum, j) => sum + j.score, 0) / result.judgeScores.length;
    result.score = Math.round(avgScore);

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Score added successfully',
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.declareResults = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { teamScores } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to declare results' });
    }

    // Sort and create results
    const sortedTeams = teamScores.sort((a, b) => b.score - a.score);
    const prizes = [hackathon.prizes?.first, hackathon.prizes?.second, hackathon.prizes?.third];
    const coinRewards = [100, 75, 50]; // Configurable

    const results = [];

    for (let i = 0; i < sortedTeams.length; i++) {
      const { teamId, score } = sortedTeams[i];
      const rank = i + 1;

      const result = new Result({
        hackathonId,
        teamId,
        rank,
        score,
        coinReward: rank <= 3 ? coinRewards[rank - 1] : 0,
        prizeTitle: rank <= 3 ? prizes[rank - 1] : null,
      });

      await result.save();
      results.push(result);

      // Update team rank and score
      const team = await Team.findById(teamId);
      team.rank = rank;
      team.score = score;
      if (rank <= 3) {
        team.status = 'submitted';
      }
      await team.save();

      // Award coins to team members
      const team_data = await Team.findById(teamId).populate('members');
      for (const member of team_data.members) {
        const user = await User.findById(member._id);
        user.coins += result.coinReward;
        if (rank === 1) user.totalWins += 1;
        await user.save();

        // Send notification
        const notification = new Notification({
          userId: member._id,
          hackathonId,
          type: 'coin_awarded',
          title: `Coins Awarded - Rank ${rank}`,
          message: `Your team ranked ${rank} and earned ${result.coinReward} coins!`,
        });
        await notification.save();
      }
    }

    hackathon.status = 'completed';
    await hackathon.save();

    res.status(201).json({
      success: true,
      message: 'Results declared successfully',
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateCertificates = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const results = await Result.find({ hackathonId }).populate({
      path: 'teamId',
      populate: { path: 'members' },
    });

    const certificates = [];

    for (const result of results) {
      const team = result.teamId;

      for (const member of team.members) {
        const certificateNumber = `CV-${hackathonId.substring(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;

        const certificate = new Certificate({
          userId: member._id,
          hackathonId,
          teamId: team._id,
          certificateNumber,
          prizeTitle: result.prizeTitle,
          issueDate: new Date(),
        });

        await certificate.save();
        certificates.push(certificate);

        result.certificateIssued = true;
        await result.save();

        // Send notification
        const notification = new Notification({
          userId: member._id,
          hackathonId,
          type: 'certificate_issued',
          title: 'Certificate Issued',
          message: `Your certificate for ${hackathon.title} is ready`,
        });
        await notification.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Certificates generated successfully',
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { limit = 20 } = req.query;

    const results = await Result.find({ hackathonId })
      .populate({
        path: 'teamId',
        populate: {
          path: 'members',
          select: 'firstName lastName email college',
        },
      })
      .sort({ rank: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: results.length,
      leaderboard: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const users = await User.find()
      .select('firstName lastName email college coins totalWins totalHackathonsParticipated')
      .sort({ coins: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      leaderboard: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const certificates = await Certificate.find({ userId: req.user.id })
      .populate('hackathonId', 'title startDate endDate')
      .populate({
        path: 'teamId',
        select: 'name members',
      })
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Certificate.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: certificates.length,
      total,
      pages: Math.ceil(total / limit),
      certificates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHackathonResults = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const skip = (page - 1) * limit;
    const results = await Result.find({ hackathonId })
      .populate({
        path: 'teamId',
        populate: {
          path: 'members',
          select: 'firstName lastName email',
        },
      })
      .sort({ rank: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Result.countDocuments({ hackathonId });

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      pages: Math.ceil(total / limit),
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
