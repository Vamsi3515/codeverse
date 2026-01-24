const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Organizer = require('../models/Organizer');

// Exception email that can act as organizer
const ROLE_EXCEPTION_EMAIL = '22b61a0557@sitam.co.in';

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in Organizer collection first
    let user = await Organizer.findById(decoded.id);
    
    if (user) {
      console.log('✅ Organizer found in middleware:', user.email, 'ID:', user._id);
      req.user = {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        college: user.college,
        role: 'organizer',
        organizerRole: user.role,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        roleSource: 'organizer'
      };
      console.log('   req.user.id set to:', req.user.id, 'req.user._id:', req.user._id);
      return next();
    }
    
    // Try Student collection
    user = await Student.findById(decoded.id);
    
    if (user) {
      console.log('✅ Student found in middleware:', user.email, 'ID:', user._id);
      
      // Check if this is the exception email that can act as organizer
      const isExceptionEmail = user.email.toLowerCase() === ROLE_EXCEPTION_EMAIL;
      
      req.user = {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        college: user.college,
        role: isExceptionEmail ? 'organizer' : 'student', // Exception email gets organizer role
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        roleSource: 'student',
        isRoleException: isExceptionEmail
      };
      
      console.log('   req.user.id set to:', req.user.id, 'req.user._id:', req.user._id, 'Role:', req.user.role);
      
      if (isExceptionEmail) {
        console.log('   ✅ Exception email detected - granting organizer role');
      }
      
      return next();
    }
    
    // Try User collection (legacy)
    user = await User.findById(decoded.id);
    
    if (user) {
      console.log('✅ User found in middleware (legacy):', user.email, 'ID:', user._id);
      req.user = user;
      return next();
    }

    // No user found in any collection
    console.log('❌ User not found in any collection for ID:', decoded.id);
    return res.status(404).json({ success: false, message: 'User not found' });

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

// Middleware to check if user can create hackathons
exports.checkHackathonCreatorRole = (req, res, next) => {
  const allowedRoles = ['organizer', 'ORGANIZER', 'STUDENT_COORDINATOR', 'admin'];
  
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Check legacy role field
  const hasAllowedRole = allowedRoles.includes(req.user.role);
  
  // Check new roles array
  const hasAllowedRoleInArray = req.user.roles && 
    (req.user.roles.includes('ORGANIZER') || 
     req.user.roles.includes('STUDENT_COORDINATOR') || 
     req.user.roles.includes('ADMIN'));

  if (!hasAllowedRole && !hasAllowedRoleInArray) {
    return res.status(403).json({ 
      success: false, 
      message: 'You are not authorized to create hackathons. Only Organizers and Student Coordinators can create hackathons.' 
    });
  }

  next();
};
