const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const User = require('../models/User');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { sendEmail, generateRegistrationConfirmationEmail } = require('../utils/emailService');

// Resolve backend base URL for serving static uploads
const getBackendBaseUrl = () => {
  const direct = (process.env.BACKEND_URL || process.env.API_BASE_URL || '').replace(/\/+$/, '');
  if (direct) return direct;
  const fe = process.env.FRONTEND_URL || '';
  if (fe.includes('-5173')) return fe.replace('-5173', '-5000');
  return 'http://localhost:5000';
};

// Convert relative '/uploads/...' paths to absolute URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `${getBackendBaseUrl()}${imagePath}`;
  }
  return imagePath;
};

const getStudentProfile = async (userId) => {
  // Try Student model first, then fallback to User
  const student = await Student.findById(userId).select('firstName lastName email college regNumber emailVerified isEmailVerified collegeIdCard liveSelfie');
  if (student) return student;
  const user = await User.findById(userId).select('firstName lastName email college regNumber emailVerified isEmailVerified collegeIdCard liveSelfie');
  return user;
};

// Generate QR code for offline hackathon registration with URL to details page
const generateQRCode = async (
  registrationId,
  hackathonId
) => {
  try {
    // Generate URL to the verification page (shows full student details when scanned)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const registrationPageUrl = `${frontendUrl}/registration/verify/${registrationId}`;

    // Generate QR code containing the URL
    const qrCodeDataUrl = await QRCode.toDataURL(registrationPageUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ [QR CODE] Generated QR code with verification URL for registration:', registrationId);
    return qrCodeDataUrl;
  } catch (err) {
    console.error('❌ [QR CODE] Error generating QR code:', err);
    return null;
  }
};

exports.registerForHackathon = async (req, res) => {
  try {
    const { hackathonId, teamId, teamData } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // ONLINE HACKATHONS ONLY: Block registration if no problem statements
    if (hackathon.mode === 'online') {
      const problemCount = hackathon.problemStatements ? hackathon.problemStatements.length : 0;
      if (problemCount === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'This hackathon is not yet ready for registration. Problem statements have not been added.' 
        });
      }
    }

    if (hackathon.registeredCount >= hackathon.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Hackathon is full' });
    }

    // Enforce location presence for offline/hybrid
    if ((hackathon.mode === 'offline' || hackathon.mode === 'hybrid')) {
      const loc = hackathon.location || {};
      if (!loc.venueName || !loc.address || !loc.city || !loc.latitude || !loc.longitude) {
        return res.status(400).json({ success: false, message: 'Offline hackathon is missing location details' });
      }
    }

    // Check if already registered
    const existingReg = await Registration.findOne({
      hackathonId,
      userId: req.user.id,
    });

    if (existingReg) {
      return res.status(400).json({ success: false, message: 'Already registered for this hackathon' });
    }

    // Offline prerequisites: email verified + ID card + live selfie
    const studentProfile = await getStudentProfile(req.user.id);
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (hackathon.mode === 'offline') {
      const emailVerified = studentProfile.emailVerified || studentProfile.isEmailVerified;
      const hasIdCard = Boolean(studentProfile.collegeIdCard);
      const hasSelfie = Boolean(studentProfile.liveSelfie);

      if (!emailVerified) {
        return res.status(400).json({ success: false, message: 'Email must be verified for offline registration' });
      }
      if (!hasIdCard) {
        return res.status(400).json({ success: false, message: 'College ID card upload required for offline registration' });
      }
      if (!hasSelfie) {
        return res.status(400).json({ success: false, message: 'Live selfie capture required for offline registration' });
      }
    }

    // Team registration validation
    const participationType = hackathon.participationType.toUpperCase();
    
    if (participationType === 'TEAM') {
      if (!teamData || !teamData.teamName) {
        return res.status(400).json({ success: false, message: 'Team name is required for team-based hackathons' });
      }

      if (!teamData.members || !Array.isArray(teamData.members)) {
        return res.status(400).json({ success: false, message: 'Team members are required' });
      }

      const totalMembers = teamData.members.length + 1; // +1 for leader
      if (totalMembers < hackathon.minTeamSize || totalMembers > hackathon.maxTeamSize) {
        return res.status(400).json({ 
          success: false, 
          message: `Team size must be between ${hackathon.minTeamSize} and ${hackathon.maxTeamSize}` 
        });
      }

      // Check for duplicate emails
      const allEmails = [studentProfile.email, ...teamData.members.map(m => m.email)];
      const uniqueEmails = new Set(allEmails.map(e => e.toLowerCase()));
      if (uniqueEmails.size !== allEmails.length) {
        return res.status(400).json({ success: false, message: 'Duplicate emails found in team' });
      }

      // Check if any team member is already registered in another team for this hackathon
      const memberEmails = teamData.members.map(m => m.email.toLowerCase());
      const existingTeamRegs = await Registration.find({
        hackathonId,
        'team.members.email': { $in: memberEmails }
      });

      if (existingTeamRegs.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more team members are already registered in another team' 
        });
      }
    } else if (participationType === 'SOLO' && teamData) {
      return res.status(400).json({ success: false, message: 'Team data not allowed for solo hackathons' });
    }

    const qrToken = hackathon.mode === 'offline' ? uuidv4() : undefined;

    // Prepare registration data
    const studentName = `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim();

    const registrationData = {
      hackathonId,
      organizerId: hackathon.organizerId || hackathon.organizer,
      userId: req.user.id,
      studentName,
      rollNumber: studentProfile.regNumber || '',
      selfieUrl: studentProfile.liveSelfie || '',
      participationType,
      teamId,
      status: 'registered',
      paymentStatus: hackathon.registrationFee > 0 ? 'pending' : 'free',
      amountPaid: hackathon.registrationFee,
      emailVerified: studentProfile.emailVerified || studentProfile.isEmailVerified,
      qrToken,
      qrIssuedAt: qrToken ? new Date() : undefined,
    };

    // Add team data if team-based
    if (participationType === 'TEAM' && teamData) {
      registrationData.team = {
        teamName: teamData.teamName,
        leader: {
          studentId: req.user.id,
          email: studentProfile.email,
          rollNumber: studentProfile.regNumber || teamData.leaderRollNumber || ''
        },
        members: teamData.members.map(member => ({
          email: member.email,
          rollNumber: member.rollNumber,
          status: 'CONFIRMED' // Static for now as per requirements
        }))
      };
      registrationData.isTeamLead = true;
    }

    const registration = new Registration(registrationData);
    await registration.save();

    // Generate QR code for offline hackathons
    if (hackathon.mode === 'offline' && registration.qrToken) {
      console.log('🔷 [QR CODE] Generating QR code for offline hackathon registration...');
      
      const qrCodeImage = await generateQRCode(
        registration._id,
        hackathon._id
      );

      if (qrCodeImage) {
        registration.qrCode = qrCodeImage; // Store base64 QR code image
        await registration.save();
        console.log('✅ [QR CODE] QR code generated and saved successfully');
      } else {
        console.warn('⚠️ [QR CODE] Failed to generate QR code, but registration completed');
      }
    }

    hackathon.registeredCount += 1;
    await hackathon.save();

    // Increment user's participation count
    const user = await User.findById(req.user.id);
    if (user) {
      user.totalHackathonsParticipated += 1;
      await user.save();
    }

    // Send notification
    const notification = new Notification({
      userId: req.user.id,
      hackathonId,
      type: 'registration_reminder',
      title: 'Registration Confirmed',
      message: `You have successfully registered for ${hackathon.title}`,
    });
    await notification.save();

    // Send registration confirmation email asynchronously
    const hackathonDetails = {
      title: hackathon.title,
      mode: hackathon.mode,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      location: hackathon.location,
      college: hackathon.college
    };

    // Send email without blocking the response
    sendEmail({
      email: studentProfile.email,
      subject: 'Hackathon Registration Successful - ' + hackathon.title,
      message: generateRegistrationConfirmationEmail(studentName, hackathonDetails)
    }).then(() => {
      console.log('✅ Registration confirmation email sent to:', studentProfile.email);
    }).catch((emailError) => {
      // Log error but don't fail the registration
      console.error('⚠️ Failed to send registration confirmation email:', emailError.message);
      console.error('   Student:', studentProfile.email, '| Hackathon:', hackathon.title);
    });

    const qrPayload = qrToken
      ? {
          studentId: req.user.id,
          hackathonId,
          registrationId: registration._id,
          qrToken,
        }
      : null;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration,
      qrPayload,
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

// Verify QR by registrationId
exports.verifyQrByRegistrationId = async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'registrationId is required' });
    }

    const registration = await Registration.findById(registrationId).populate({
      path: 'hackathonId',
      select: 'title startDate endDate mode location'
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Invalid QR' });
    }

    const hackathon = registration.hackathonId;
    if (!hackathon || hackathon.mode?.toLowerCase() !== 'offline') {
      return res.status(400).json({ success: false, message: 'QR valid only for offline hackathons' });
    }

    // Fetch student profile to get selfie (do not rely on duplicated data)
    const studentProfile = await getStudentProfile(registration.userId);
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const selfieRaw = studentProfile.liveSelfie; // primary source of selfie
    const selfieResolved = getFullImageUrl(selfieRaw);

    // Ensure selfie exists
    if (!selfieResolved) {
      return res.status(400).json({ success: false, message: 'Student selfie not found. Entry denied.' });
    }

    // Check already used
    const alreadyUsed = registration.qrUsed;

    // Mark as attended if first scan
    if (!alreadyUsed) {
      registration.qrUsed = true;
      registration.qrUsedAt = new Date();
      registration.status = 'attended';
      await registration.save();
    }

    const fullName = (registration.studentName || `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim()).trim();

    const responsePayload = {
      student: {
        name: fullName,
        rollNumber: registration.rollNumber || studentProfile.regNumber || 'N/A',
        selfieUrl: selfieResolved
      },
      hackathon: {
        title: hackathon.title,
        date: hackathon.startDate,
        venue: hackathon.location || null
      },
      status: alreadyUsed ? 'ALREADY_CHECKED_IN' : 'VERIFIED'
    };

    return res.status(200).json({ success: true, data: responsePayload });
  } catch (error) {
    console.error('❌ [QR VERIFY] Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during QR verification' });
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

    console.log('📋 [GET_REGISTRATIONS] hackathonId:', hackathonId);
    console.log('📋 [GET_REGISTRATIONS] req.user.id:', req.user.id);
    console.log('📋 [GET_REGISTRATIONS] req.user.role:', req.user.role);

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      console.log('❌ [GET_REGISTRATIONS] Hackathon not found');
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const hackathonOrganizerId = (hackathon.organizerId || hackathon.organizer)?.toString();
    const loggedOrganizerId = (req.user?._id || req.user?.id || '').toString();

    console.log('✅ [GET_REGISTRATIONS] Hackathon found:', hackathon.title);
    console.log('✅ [GET_REGISTRATIONS] Hackathon Organizer ID:', hackathonOrganizerId);
    console.log('✅ [GET_REGISTRATIONS] Logged Organizer ID:', loggedOrganizerId);
    console.log('✅ [GET_REGISTRATIONS] Match?', hackathonOrganizerId === loggedOrganizerId);

    console.log('Logged Organizer ID:', loggedOrganizerId);
    console.log('Hackathon Organizer ID:', hackathonOrganizerId);

    if (hackathonOrganizerId !== loggedOrganizerId) {
      console.log('❌ [GET_REGISTRATIONS] Authorization failed - organizer mismatch');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these registrations',
        debug: {
          hackathonOrganizerId,
          requestUserId: loggedOrganizerId,
          match: hackathonOrganizerId === loggedOrganizerId
        }
      });
    }

    console.log('✅ [GET_REGISTRATIONS] Authorization successful');

    const filter = { hackathonId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const registrations = await Registration.find(filter)
      .populate('userId', 'firstName lastName email phone college regNumber liveSelfie')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Registrations Found:', registrations.length);

    // Ensure selfieUrl is included in response and properly formatted
    const enrichedRegistrations = registrations.map(reg => {
      const regObj = reg.toObject ? reg.toObject() : reg;
      // Use selfieUrl from registration record first, fallback to user's liveSelfie
      if (!regObj.selfieUrl && regObj.userId?.liveSelfie) {
        regObj.selfieUrl = regObj.userId.liveSelfie;
      }
      return regObj;
    });

    const total = await Registration.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: enrichedRegistrations.length,
      total,
      pages: Math.ceil(total / limit),
      registrations: enrichedRegistrations,
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

exports.verifyOfflineQr = async (req, res) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'qrToken is required' });
    }

    const registration = await Registration.findOne({ qrToken });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Invalid QR code' });
    }

    const hackathon = await Hackathon.findById(registration.hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found for this QR' });
    }

    if (hackathon.mode !== 'offline' && hackathon.mode !== 'hybrid') {
      return res.status(400).json({ success: false, message: 'QR verification is only for offline or hybrid hackathons' });
    }

    // Organizer guard
    if (hackathon.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this hackathon QR' });
    }

    if (registration.qrUsed) {
      return res.status(400).json({ success: false, message: 'QR has already been used' });
    }

    const studentProfile = await getStudentProfile(registration.userId);
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    registration.qrUsed = true;
    registration.qrUsedAt = new Date();
    registration.status = 'attended';
    await registration.save();

    const responsePayload = {
      studentName: `${studentProfile.firstName} ${studentProfile.lastName}`.trim(),
      college: studentProfile.college,
      rollNumber: studentProfile.regNumber,
      registeredHackathon: hackathon.title,
      selfieImageUrl: studentProfile.liveSelfie,
      verificationStatus: 'VALID',
    };

    res.status(200).json({ success: true, data: responsePayload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Public endpoint to get registration details by ID (for QR code scanning)

exports.getPublicRegistrationDetails = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
      .populate('hackathonId', 'title mode startDate endDate location college')
      .lean();

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Only allow viewing offline hackathon registrations
    if (registration.hackathonId.mode !== 'offline') {
      return res.status(403).json({ success: false, message: 'This QR code is only valid for offline hackathons' });
    }

    const studentProfile = await getStudentProfile(registration.userId);
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const selfieUrl = studentProfile.liveSelfie || registration.selfieUrl;

    const responseData = {
      studentName: `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim(),
      rollNumber: studentProfile.regNumber || registration.rollNumber || 'N/A',
      college: studentProfile.college || 'N/A',
      email: studentProfile.email,
      selfieUrl: getFullImageUrl(selfieUrl),
      hackathon: {
        title: registration.hackathonId.title,
        mode: registration.hackathonId.mode,
        startDate: registration.hackathonId.startDate,
        endDate: registration.hackathonId.endDate,
        location: registration.hackathonId.location,
        college: registration.hackathonId.college
      },
      registrationStatus: registration.status,
      qrUsed: registration.qrUsed || false,
      registeredAt: registration.registeredAt,
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error fetching public registration details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration details' });
  }
};

/**
 * Verify Registration Details (Public) - For QR Code Scanning
 * Displays complete registration info when QR is scanned
 * Endpoint: GET /api/registrations/verify/:registrationId
 */
exports.verifyRegistrationDetails = async (req, res) => {
  try {
    const { registrationId } = req.params;
    console.log('🔍 [VERIFICATION] Fetching details for registration:', registrationId);

    // Find registration and populate all required fields
    const registration = await Registration.findById(registrationId)
      .populate({
        path: 'hackathonId',
        select: 'title mode startDate endDate date location organizer description',
        populate: {
          path: 'organizer',
          select: 'fullName name email phone'
        }
      })
      .lean();

    if (!registration) {
      console.log('❌ [VERIFICATION] Registration not found:', registrationId);
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    // Get student profile details
    const studentProfile = await getStudentProfile(registration.userId);
    if (!studentProfile) {
      console.log('❌ [VERIFICATION] Student profile not found for user:', registration.userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    // Get selfie URL (prefer liveSelfie, fallback to registration selfie)
    const selfieUrl = studentProfile.liveSelfie || registration.selfieUrl;

    // Construct complete response data
    const responseData = {
      _id: registration._id,
      status: registration.status,
      registeredAt: registration.registeredAt,
      registrationDate: registration.registrationDate,
      teamName: registration.teamName || null,
      participationType: registration.participationType,
      
      // Student details
      student: {
        fullName: `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim(),
        rollNumber: studentProfile.regNumber || registration.rollNumber || 'N/A',
        email: studentProfile.email,
        phone: studentProfile.phone || 'N/A',
        college: studentProfile.college || 'N/A',
        branch: studentProfile.branch || 'N/A',
        selfie: getFullImageUrl(selfieUrl)
      },
      
      // Team details (if applicable)
      team: registration.team ? {
        teamName: registration.team.teamName,
        leader: {
          email: registration.team.leader.email,
          rollNumber: registration.team.leader.rollNumber
        },
        members: registration.team.members && registration.team.members.length > 0 ? registration.team.members.map(m => ({
          email: m.email,
          rollNumber: m.rollNumber,
          status: m.status
        })) : []
      } : null,
      
      // Hackathon details
      hackathon: {
        title: registration.hackathonId.title,
        mode: registration.hackathonId.mode,
        startDate: registration.hackathonId.startDate || registration.hackathonId.date,
        endDate: registration.hackathonId.endDate,
        date: registration.hackathonId.date,
        location: registration.hackathonId.location,
        description: registration.hackathonId.description,
        organizer: registration.hackathonId.organizer
      }
    };

    console.log('✅ [VERIFICATION] Registration details fetched successfully');
    res.status(200).json({ 
      success: true, 
      data: responseData 
    });

  } catch (error) {
    console.error('❌ [VERIFICATION] Error fetching registration details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registration details',
      error: error.message 
    });
  }
};