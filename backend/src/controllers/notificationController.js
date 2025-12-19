const Notification = require('../models/Notification');
const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const { sendEmail, generateHackathonReminderEmail } = require('../utils/emailService');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;

    const filter = { userId: req.user.id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(filter)
      .populate('hackathonId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      pages: Math.ceil(total / limit),
      notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendRegistrationReminders = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const registrations = await Registration.find({ hackathonId }).populate('userId');

    let sentCount = 0;
    for (const registration of registrations) {
      try {
        await sendEmail({
          email: registration.userId.email,
          subject: `Reminder: Registration for ${hackathon.title}`,
          message: generateHackathonReminderEmail(hackathon.title, hackathon.startDate),
        });

        // Create notification
        const notification = new Notification({
          userId: registration.userId._id,
          hackathonId,
          type: 'registration_reminder',
          title: 'Registration Reminder',
          message: `Reminder: The hackathon ${hackathon.title} starts soon!`,
        });
        await notification.save();

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${registration.userId.email}:`, emailError);
      }
    }

    hackathon.notificationsSent.registrationReminder = true;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: `Reminders sent to ${sentCount} participants`,
      sentCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendEventStartNotifications = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    if (hackathon.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const registrations = await Registration.find({ hackathonId, status: 'registered' }).populate('userId');

    let notificationCount = 0;
    for (const registration of registrations) {
      const notification = new Notification({
        userId: registration.userId._id,
        hackathonId,
        type: 'event_start',
        title: 'Event Starting Now!',
        message: `${hackathon.title} is starting now! Join and showcase your skills.`,
      });
      await notification.save();
      notificationCount++;
    }

    hackathon.notificationsSent.eventStart = true;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: `Event start notifications sent to ${notificationCount} participants`,
      notificationCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
