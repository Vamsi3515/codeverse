const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const { findNearbyHackathons, sortByDistance } = require('../utils/locationService');

exports.createHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      college,
      mode,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
      duration,
      location,
      eligibility,
      maxParticipants,
      registrationFee,
      teamSize,
      rules,
      prizes,
      theme,
      problemStatements,
      antiCheatRules,
      guidedParticipation,
      bannerImage,
      tags,
    } = req.body;

    const hackathon = new Hackathon({
      title,
      description,
      organizer: req.user.id,
      college,
      mode,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
      duration,
      location,
      eligibility,
      maxParticipants,
      registrationFee,
      teamSize,
      rules,
      prizes,
      theme,
      problemStatements,
      antiCheatRules,
      guidedParticipation,
      bannerImage,
      tags,
      status: 'draft',
    });

    await hackathon.save();

    res.status(201).json({
      success: true,
      message: 'Hackathon created successfully',
      hackathon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hackathon' });
    }

    const updatedHackathon = await Hackathon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Hackathon updated successfully',
      hackathon: updatedHackathon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.publishHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to publish this hackathon' });
    }

    hackathon.status = 'published';
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Hackathon published successfully',
      hackathon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id).populate('organizer', 'firstName lastName email college');

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    res.status(200).json({
      success: true,
      hackathon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllHackathons = async (req, res) => {
  try {
    const { status, mode, college, page = 1, limit = 10, search } = req.query;

    const filter = { status: { $ne: 'draft' } };

    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (college) filter.college = college;
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    const skip = (page - 1) * limit;
    const hackathons = await Hackathon.find(filter)
      .populate('organizer', 'firstName lastName college')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: hackathons.length,
      total,
      pages: Math.ceil(total / limit),
      hackathons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyHackathons = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
    }

    const hackathons = await Hackathon.find({
      mode: { $in: ['offline', 'hybrid'] },
      status: { $ne: 'draft' },
    }).populate('organizer', 'firstName lastName');

    const nearbyHackathons = findNearbyHackathons(parseFloat(latitude), parseFloat(longitude), hackathons, parseInt(radius));
    const sortedHackathons = sortByDistance(parseFloat(latitude), parseFloat(longitude), nearbyHackathons);

    res.status(200).json({
      success: true,
      count: sortedHackathons.length,
      hackathons: sortedHackathons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHackathonsByOrganizer = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const hackathons = await Hackathon.find({ organizer: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments({ organizer: req.user.id });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      total,
      pages: Math.ceil(total / limit),
      hackathons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hackathon' });
    }

    await Hackathon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Hackathon deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchHackathons = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const hackathons = await Hackathon.find(
      {
        $text: { $search: query },
        status: { $ne: 'draft' },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('organizer', 'firstName lastName college');

    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
