const ActivityLog = require('../models/ActivityLog');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const Registration = require('../models/Registration');

exports.logActivity = async (req, res) => {
  try {
    const { hackathonId, activityType, severity, details } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check if anti-cheating is enabled
    if (!hackathon.antiCheatRules || !hackathon.antiCheatRules.activityTracking) {
      return res.status(400).json({ success: false, message: 'Activity tracking not enabled for this hackathon' });
    }

    // Determine if activity should be flagged
    let flagged = false;
    let flagReason = null;

    if (activityType === 'tab_switch' && hackathon.antiCheatRules.tabSwitchLimit > 0) {
      const recentSwitches = await ActivityLog.countDocuments({
        userId: req.user.id,
        hackathonId,
        activityType: 'tab_switch',
        timestamp: {
          $gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      });

      if (recentSwitches >= hackathon.antiCheatRules.tabSwitchLimit) {
        flagged = true;
        flagReason = `Tab switched ${recentSwitches} times in last 5 minutes`;
      }
    }

    if (activityType === 'copy_attempt' && hackathon.antiCheatRules.copyPasteRestricted) {
      flagged = true;
      flagReason = 'Copy-paste is not allowed';
    }

    if (activityType === 'paste_attempt' && hackathon.antiCheatRules.copyPasteRestricted) {
      flagged = true;
      flagReason = 'Copy-paste is not allowed';
    }

    if (activityType === 'webcam_off' && hackathon.antiCheatRules.webcamRequired) {
      flagged = true;
      flagReason = 'Webcam must be on';
    }

    if (activityType === 'screen_share_lost' && hackathon.antiCheatRules.screenShareRequired) {
      flagged = true;
      flagReason = 'Screen share must be maintained';
    }

    const activityLog = new ActivityLog({
      userId: req.user.id,
      hackathonId,
      activityType,
      severity: severity || (flagged ? 'high' : 'low'),
      timestamp: new Date(),
      details,
      flagged,
    });

    await activityLog.save();

    // Send notification if flagged
    if (flagged) {
      const notification = new Notification({
        userId: req.user.id,
        hackathonId,
        type: 'general',
        title: 'Activity Flagged',
        message: `Suspicious activity detected: ${flagReason}`,
      });
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      flagged,
      activityLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { page = 1, limit = 20, flaggedOnly = false } = req.query;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filter = { hackathonId };
    if (flaggedOnly === 'true') {
      filter.flagged = true;
    }

    const skip = (page - 1) * limit;
    const activityLogs = await ActivityLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: activityLogs.length,
      total,
      pages: Math.ceil(total / limit),
      activityLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserActivityLogs = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const activityLogs = await ActivityLog.find({
      userId: req.user.id,
      hackathonId,
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments({
      userId: req.user.id,
      hackathonId,
    });

    res.status(200).json({
      success: true,
      count: activityLogs.length,
      total,
      pages: Math.ceil(total / limit),
      activityLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.disqualifyUser = async (req, res) => {
  try {
    const { userId, hackathonId } = req.body;
    const { reason } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update registration status
    const registration = await Registration.findOne({
      userId,
      hackathonId,
    });

    if (registration) {
      registration.status = 'disqualified';
      await registration.save();
    }

    // Update team status if user is in a team
    const teams = await Team.find({
      hackathonId,
      members: userId,
    });

    for (const team of teams) {
      team.status = 'disqualified';
      await team.save();
    }

    // Send notification
    const notification = new Notification({
      userId,
      hackathonId,
      type: 'general',
      title: 'Disqualified',
      message: `You have been disqualified. Reason: ${reason}`,
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'User disqualified successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAntiCheatReport = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get flagged activities
    const flaggedActivities = await ActivityLog.aggregate([
      {
        $match: {
          hackathonId: new (require('mongoose')).Types.ObjectId(hackathonId),
          flagged: true,
        },
      },
      {
        $group: {
          _id: '$userId',
          totalFlags: { $sum: 1 },
          activities: { $push: '$activityType' },
          severities: { $push: '$severity' },
        },
      },
      { $sort: { totalFlags: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    // Activity breakdown
    const activityBreakdown = await ActivityLog.aggregate([
      {
        $match: {
          hackathonId: new (require('mongoose')).Types.ObjectId(hackathonId),
          flagged: true,
        },
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      report: {
        totalFlaggedActivities: flaggedActivities.reduce((sum, u) => sum + u.totalFlags, 0),
        suspiciousUsers: flaggedActivities.length,
        flaggedActivities,
        activityBreakdown,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
