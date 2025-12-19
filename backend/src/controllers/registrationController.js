const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.registerForHackathon = async (req, res) => {
  try {
    const { hackathonId, teamId } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.registeredCount >= hackathon.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Hackathon is full' });
    }

    // Check if already registered
    const existingReg = await Registration.findOne({
      hackathonId,
      userId: req.user.id,
    });

    if (existingReg) {
      return res.status(400).json({ success: false, message: 'Already registered for this hackathon' });
    }

    const registration = new Registration({
      hackathonId,
      userId: req.user.id,
      teamId,
      status: 'registered',
      paymentStatus: hackathon.registrationFee > 0 ? 'pending' : 'free',
      amountPaid: hackathon.registrationFee,
    });

    await registration.save();

    hackathon.registeredCount += 1;
    await hackathon.save();

    // Increment user's participation count
    const user = await User.findById(req.user.id);
    user.totalHackathonsParticipated += 1;
    await user.save();

    // Send notification
    const notification = new Notification({
      userId: req.user.id,
      hackathonId,
      type: 'registration_reminder',
      title: 'Registration Confirmed',
      message: `You have successfully registered for ${hackathon.title}`,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdrawRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this registration' });
    }

    registration.status = 'withdrawn';
    await registration.save();

    const hackathon = await Hackathon.findById(registration.hackathonId);
    hackathon.registeredCount -= 1;
    await hackathon.save();

    // Send notification
    const notification = new Notification({
      userId: req.user.id,
      hackathonId: registration.hackathonId,
      type: 'general',
      title: 'Withdrawal Confirmed',
      message: `Your registration has been withdrawn`,
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Registration withdrawn successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const registrations = await Registration.find({ userId: req.user.id })
      .populate({
        path: 'hackathonId',
        select: 'title startDate endDate mode status college',
      })
      .populate({
        path: 'teamId',
        select: 'name members',
      })
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      pages: Math.ceil(total / limit),
      registrations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHackathonRegistrations = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these registrations' });
    }

    const filter = { hackathonId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const registrations = await Registration.find(filter)
      .populate('userId', 'firstName lastName email phone college')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      pages: Math.ceil(total / limit),
      registrations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsAttended = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const hackathon = await Hackathon.findById(registration.hackathonId);
    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    registration.status = 'attended';
    await registration.save();

    if (!hackathon.participantCount) hackathon.participantCount = 0;
    hackathon.participantCount += 1;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Marked as attended',
      registration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegistrationStats = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const totalRegistrations = await Registration.countDocuments({
      hackathonId,
    });
    const attendedCount = await Registration.countDocuments({
      hackathonId,
      status: 'attended',
    });
    const withdrawnCount = await Registration.countDocuments({
      hackathonId,
      status: 'withdrawn',
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        attended: attendedCount,
        withdrawn: withdrawnCount,
        registered: totalRegistrations - attendedCount - withdrawnCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
