const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get student profile
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure the requesting user can only access their own data OR if organizer/admin
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'organizer' && req.user.role !== 'ORGANIZER') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this resource' 
      });
    }

    // Try Student model first, then User model
    let student = await Student.findById(userId);
    
    if (!student) {
      student = await User.findById(userId);
    }

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: student._id,
        fullName: student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : (student.name || 'N/A'),
        name: student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : (student.name || 'N/A'),
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email,
        phone: student.phone || '',
        phoneNumber: student.phone || '',
        college: student.college,
        collegeAddress: student.collegeAddress,
        rollNumber: student.rollNumber || '',
        department: student.department || '',
        year: student.year || '',
        liveSelfie: student.liveSelfie,
        profilePicture: student.profilePicture,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving student profile' 
    });
  }
});

// Get student's college location
router.get('/:userId/college-location', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure the requesting user can only access their own data
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this resource' 
      });
    }

    // Try Student model first, then User model
    let student = await Student.findById(userId).select('college collegeAddress collegeLat collegeLng');
    
    if (!student) {
      student = await User.findById(userId).select('college collegeAddress collegeLat collegeLng');
    }

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Check if location data is available
    if (!student.collegeAddress || !student.collegeLat || !student.collegeLng) {
      return res.status(404).json({ 
        success: false, 
        message: 'College location not available. Please update your profile with college address.' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        college: student.college,
        collegeAddress: student.collegeAddress,
        collegeLat: student.collegeLat,
        collegeLng: student.collegeLng
      }
    });
  } catch (error) {
    console.error('Get college location error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving college location' 
    });
  }
});

module.exports = router;
