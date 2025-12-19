const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createTeam = async (req, res) => {
  try {
    const { name, hackathonId, description } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const team = new Team({
      name,
      hackathonId,
      leader: req.user.id,
      description,
      members: [req.user.id],
      status: 'forming',
    });

    await team.save();

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate('leader', 'firstName lastName email')
      .populate('members', 'firstName lastName email college skills');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can update' });
    }

    if (name) team.name = name;
    if (description) team.description = description;

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can add members' });
    }

    if (team.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    if (team.members.length >= team.hackathonId.teamSize?.max) {
      return res.status(400).json({ success: false, message: 'Team is full' });
    }

    team.members.push(userId);
    await team.save();

    // Send notification
    const notification = new Notification({
      userId,
      hackathonId: team.hackathonId,
      type: 'team_invitation',
      title: `Added to Team: ${team.name}`,
      message: `You have been added to ${team.name}`,
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can remove members' });
    }

    team.members = team.members.filter((member) => member.toString() !== userId);
    await team.save();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.inviteTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can invite' });
    }

    const existingRequest = team.joinRequests.find((req) => req.userId.toString() === userId);
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Invitation already sent' });
    }

    team.joinRequests.push({
      userId,
      status: 'pending',
    });
    await team.save();

    // Send notification
    const notification = new Notification({
      userId,
      hackathonId: team.hackathonId,
      type: 'team_invitation',
      title: `Team Invitation: ${team.name}`,
      message: `You have been invited to join ${team.name}`,
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { response } = req.body; // 'accept' or 'reject'

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const joinRequest = team.joinRequests.find((req) => req.userId.toString() === req.user.id);
    if (!joinRequest) {
      return res.status(404).json({ success: false, message: 'No invitation found' });
    }

    if (response === 'accept') {
      if (team.members.length >= team.hackathonId.teamSize?.max) {
        return res.status(400).json({ success: false, message: 'Team is full' });
      }

      team.members.push(req.user.id);
      joinRequest.status = 'accepted';
    } else if (response === 'reject') {
      joinRequest.status = 'rejected';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid response' });
    }

    await team.save();

    res.status(200).json({
      success: true,
      message: `Invitation ${response}ed successfully`,
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitTeamProject = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { projectLink, videoLink, description, technologies } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can submit' });
    }

    team.submissionData = {
      projectLink,
      videoLink,
      description,
      technologies,
      submittedAt: new Date(),
    };
    team.status = 'submitted';

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Project submitted successfully',
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeamsByHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const teams = await Team.find({ hackathonId })
      .populate('leader', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Team.countDocuments({ hackathonId });

    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      pages: Math.ceil(total / limit),
      teams,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const teams = await Team.find({
      $or: [{ leader: req.user.id }, { members: req.user.id }],
    })
      .populate('leader', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .populate('hackathonId', 'title startDate endDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Team.countDocuments({
      $or: [{ leader: req.user.id }, { members: req.user.id }],
    });

    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      pages: Math.ceil(total / limit),
      teams,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
