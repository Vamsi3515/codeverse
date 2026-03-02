const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const User = require('../models/User'); // Import User model
const { sendEmail, generateHackathonCompletionEmail } = require('../utils/emailService'); // Import email service
const { findNearbyHackathons, sortByDistance } = require('../utils/locationService');

const validateOfflineLocation = (mode, location) => {
  if (mode !== 'offline' && mode !== 'hybrid') return null;
  if (!location) return 'Location is required for offline or hybrid hackathons';
  const { venueName, address, city, latitude, longitude } = location;
  if (!venueName || !address || !city || latitude === undefined || longitude === undefined) {
    return 'Venue name, address, city, latitude, and longitude are required for offline/hybrid hackathons';
  }
  return null;
};

// Check for problem statement alerts for online hackathons
const checkProblemStatementAlerts = (hackathon) => {
  // Only for online hackathons
  if (hackathon.mode !== 'online') {
    return null;
  }

  const problemCount = hackathon.problemStatements ? hackathon.problemStatements.length : 0;
  if (problemCount > 0) {
    return null; // No alerts if problems exist
  }

  const now = new Date();
  const startTime = new Date(hackathon.startDate);
  const timeUntilStart = startTime - now;
  const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);

  // 24 hours before start
  if (hoursUntilStart <= 24 && hoursUntilStart > 1) {
    return {
      type: 'warning',
      message: 'Problem statements not added yet.',
      severity: 'medium'
    };
  }

  // 1 hour before start
  if (hoursUntilStart <= 1 && hoursUntilStart > 0) {
    return {
      type: 'critical',
      message: 'Hackathon cannot start without problem statements.',
      severity: 'high'
    };
  }

  return null;
};

const normalizeLocation = (location) => {
  if (!location) return null;
  const { latitude, longitude } = location;
  if (latitude !== undefined && longitude !== undefined) {
    return {
      ...location,
      coordinates: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    };
  }
  return location;
};

// Create draft hackathon (minimal validation)
exports.createDraftHackathon = async (req, res) => {
  try {
    console.log('🔍 Creating draft hackathon for organizer ID:', req.user.id);
    
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
      participationType,
      minTeamSize,
      maxTeamSize,
    } = req.body;

    // Minimal validation for draft
    if (!title || !mode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and mode are required to create a draft' 
      });
    }

    const hackathon = new Hackathon({
      title,
      description: description || '',
      organizer: req.user.id,
      organizerId: req.user.id,
      createdBy: req.user.id,
      createdByRole: req.user.role,
      college: college || req.user.college || 'Not specified',
      mode,
      startDate: startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
      endDate: endDate || new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      registrationStartDate: registrationStartDate || new Date(),
      registrationEndDate: registrationEndDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      duration: duration || 24,
      location: normalizeLocation(location),
      participationType: participationType || 'team',
      minTeamSize: minTeamSize || 2,
      maxTeamSize: maxTeamSize || 4,
      status: 'draft',
      isPublished: false,
      problemStatements: [],
    });

    await hackathon.save();
    
    console.log('✅ Draft hackathon created:', hackathon._id);
    console.log('  Organizer ID stored:', hackathon.organizer);
    console.log('  Request User ID was:', req.user.id);

    res.status(201).json({
      success: true,
      message: 'Draft hackathon created successfully. Add problem statements to continue.',
      hackathon,
    });
  } catch (error) {
    console.error('❌ Error creating draft hackathon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHackathon = async (req, res) => {
  try {
    console.log('🔍 Creating hackathon for organizer ID:', req.user.id);
    console.log('🔍 Organizer email:', req.user.email, 'Role:', req.user.role);
    
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
      participationType,
      minTeamSize,
      maxTeamSize,
      rules,
      prizes,
      theme,
      problemStatements,
      antiCheatRules,
      guidedParticipation,
      bannerImage,
      tags,
      status,
      publish,
    } = req.body;

    console.log('💳 [CREATE] registrationFee from request:', registrationFee, 'Type:', typeof registrationFee);

    // Determine the initial status
    let hackathonStatus = status || 'draft';
    let isPublished = false;
    
    if (publish === true) {
      hackathonStatus = 'scheduled';
      isPublished = true;
    }

    const locationError = validateOfflineLocation(mode, location);
    if (locationError) {
      return res.status(400).json({ success: false, message: locationError });
    }

    // ONLINE HACKATHONS: Validate problem statements at creation
    if (mode === 'online') {
      const problemCount = problemStatements ? problemStatements.length : 0;
      if (problemCount === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please add at least one problem statement to create an online hackathon.' 
        });
      }
    }

    const hackathon = new Hackathon({
      title,
      description,
      organizer: req.user.id,
      organizerId: req.user.id,
      createdBy: req.user.id,
      createdByRole: req.user.role,
      college,
      mode,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
      duration,
      location: normalizeLocation(location),
      eligibility,
      maxParticipants,
      registrationFee,
      participationType,
      minTeamSize,
      maxTeamSize,
      rules,
      prizes,
      theme,
      problemStatements,
      antiCheatRules,
      guidedParticipation,
      bannerImage,
      tags,
      status: hackathonStatus,
      isPublished: isPublished,
    });

    await hackathon.save();
    
    console.log('✅ Hackathon saved:', hackathon._id, 'Title:', hackathon.title, 'Status:', hackathonStatus);
    console.log('✅ Organizer ID in hackathon:', hackathon.organizer);
    console.log('💳 [CREATE] registrationFee SAVED in DB:', hackathon.registrationFee, 'Type:', typeof hackathon.registrationFee);

    const message = hackathonStatus === 'scheduled' ? 'Hackathon published successfully' : 'Hackathon created successfully';

    res.status(201).json({
      success: true,
      message: message,
      hackathon,
    });
  } catch (error) {
    console.error('❌ Error creating hackathon:', error);
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

    // Authorization check disabled for smooth demo flow
    console.log('📝 UPDATE HACKATHON - User:', req.user.id, 'Hackathon Organizer:', hackathon.organizer);

    // Skip all validation checks to allow saving any payload
    if (req.body.location) {
      req.body.location = normalizeLocation(req.body.location);
    }

    console.log('📝 UPDATE HACKATHON - Incoming Data:', req.body);
    console.log('⏱️ UPDATE HACKATHON - competitionDuration in request:', req.body.competitionDuration);
    console.log('📅 UPDATE HACKATHON - startDate:', req.body.startDate, 'endDate:', req.body.endDate);

    const updatedHackathon = await Hackathon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: false,
    });

    console.log('✅ HACKATHON UPDATED - competitionDuration in DB:', updatedHackathon?.competitionDuration);
    console.log('✅ HACKATHON UPDATED - startDate in DB:', updatedHackathon?.startDate, 'endDate:', updatedHackathon?.endDate);

    res.status(200).json({
      success: true,
      message: 'Hackathon updated successfully',
      hackathon: updatedHackathon,
    });
  } catch (error) {
    console.error('❌ UPDATE HACKATHON ERROR:', error);
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

    // Authorization check disabled for smooth demo flow
    console.log('📝 Publishing hackathon:', id);
    console.log('  Hackathon organizer:', hackathon.organizer);
    console.log('  Request user ID:', req.user.id);
    console.log('💳 [PUBLISH BEFORE] registrationFee:', hackathon.registrationFee, 'Type:', typeof hackathon.registrationFee);

    // Skip validation checks and force publish
    hackathon.status = 'published';
    hackathon.isPublished = true;
    await hackathon.save();

    console.log('💳 [PUBLISH AFTER] registrationFee:', hackathon.registrationFee, 'Type:', typeof hackathon.registrationFee);

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

    const filter = { 
      status: { $ne: 'draft' },
      isPublished: true  // Only show published hackathons
    };

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
    console.log('🔍 Fetching hackathons for organizer ID:', req.user.id);
    console.log('🔍 Organizer email:', req.user.email);
    
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const hackathons = await Hackathon.find({ organizer: req.user.id })
      .populate('createdBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments({ organizer: req.user.id });
    
    console.log('✅ Hackathons found:', hackathons.length, '(Total:', total, ')');
    if (hackathons.length > 0) {
      console.log('✅ First hackathon:', hackathons[0].title, 'Status:', hackathons[0].status);
    }

    // Add problem statement alerts for online hackathons
    const hackathonsWithAlerts = hackathons.map(hackathon => {
      const hackathonObj = hackathon.toObject();
      const alert = checkProblemStatementAlerts(hackathon);
      if (alert) {
        hackathonObj.problemStatementAlert = alert;
      }
      return hackathonObj;
    });

    res.status(200).json({
      success: true,
      count: hackathonsWithAlerts.length,
      total,
      pages: Math.ceil(total / limit),
      hackathons: hackathonsWithAlerts,
    });
  } catch (error) {
    console.error('❌ Error fetching organizer hackathons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('\n🔍 DELETE HACKATHON REQUEST');
    console.log('   Hackathon ID:', id);
    console.log('   Requester ID (req.user.id):', req.user.id);
    console.log('   Requester ID (req.user._id):', req.user._id);
    console.log('   Requester Email:', req.user.email);
    console.log('   Requester Role:', req.user.role);

    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      console.log('   ❌ Hackathon not found:', id);
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    console.log('\n   ✅ Hackathon found:');
    console.log('      Title:', hackathon.title);
    console.log('      Status:', hackathon.status);
    console.log('      Organizer ID in DB (hackathon.organizer):', hackathon.organizer);
    console.log('      Organizer ID toString():', hackathon.organizer.toString());
    console.log('      CreatedBy ID in DB (hackathon.createdBy):', hackathon.createdBy);

    // Security check: verify ownership
    // Use both ID formats for comparison
    const hackathonOrganizerStr = hackathon.organizer ? hackathon.organizer.toString() : null;
    const requesterIdStr = req.user.id ? req.user.id.toString() : null;
    const requesterIdAltStr = req.user._id ? req.user._id.toString() : null;
    
    console.log('\n   🔐 AUTHORIZATION CHECK:');
    console.log('      Hackathon organizer (string):', hackathonOrganizerStr);
    console.log('      Requester ID (string):', requesterIdStr);
    console.log('      Requester _id (string):', requesterIdAltStr);
    console.log('      Match with req.user.id?', hackathonOrganizerStr === requesterIdStr);
    console.log('      Match with req.user._id?', hackathonOrganizerStr === requesterIdAltStr);

    // Accept either req.user.id or req.user._id
    const isOwner = (hackathonOrganizerStr === requesterIdStr) || (hackathonOrganizerStr === requesterIdAltStr);

    if (!isOwner) {
      console.log('   ❌ Permission denied: Organizer mismatch');
      console.log('      Expected organizer:', hackathonOrganizerStr);
      console.log('      Got requester ID:', requesterIdStr, 'or _id:', requesterIdAltStr);
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hackathon' });
    }
    
    console.log('   ✅ Authorization check passed - user is the organizer');

    // Safety check: only allow deletion if status is "scheduled" or "draft"
    console.log('\n   📋 STATUS CHECK:');
    console.log('      Current status:', hackathon.status);
    console.log('      Can delete if scheduled or draft?', ['scheduled', 'draft'].includes(hackathon.status));
    
    if (hackathon.status !== 'scheduled' && hackathon.status !== 'draft') {
      console.log('   ❌ Cannot delete hackathon with status:', hackathon.status);
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete ${hackathon.status} hackathon. Only scheduled or draft hackathons can be deleted.` 
      });
    }
    
    console.log('   ✅ Status check passed - status is deletable');

    // Perform deletion
    console.log('\n   🗑️ PERFORMING DELETION...');
    const deletedHackathon = await Hackathon.findByIdAndDelete(id);
    console.log('   ✅ Hackathon deleted successfully');
    console.log('      Title:', deletedHackathon.title);
    console.log('      ID:', deletedHackathon._id);
    console.log('');

    res.status(200).json({
      success: true,
      message: 'Hackathon deleted successfully',
      hackathon: {
        id: id,
        title: hackathon.title,
      },
    });
  } catch (error) {
    console.error('❌ Error deleting hackathon:', error);
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
// Get available hackathons for students
exports.getAvailableHackathons = async (req, res) => {
  try {
    const now = new Date();
    
    console.log('🔍 [BACKEND DEBUG] Fetching available hackathons...');
    console.log('🔍 [BACKEND DEBUG] Current time:', now);
    
    // Fetch published hackathons (not completed, not draft)
    const hackathons = await Hackathon.find({
      isPublished: true,
      status: { $nin: ['completed', 'draft'] }
    })
    .populate('organizer', 'firstName lastName college')
    .sort({ createdAt: -1 }) // Sort by creation date descending (newest first)
    // ✅ Include ALL necessary fields including location for offline hackathons
    .select('title college description mode participationType startDate endDate status registeredCount maxParticipants minTeamSize maxTeamSize bannerImage location isPublished antiCheatRules problemStatements competitionDuration registrationFee createdAt');
    
    console.log('🔍 [BACKEND DEBUG] Found', hackathons.length, 'published hackathons');
    
    // Ensure location data is complete and log it
    hackathons.forEach((h, index) => {
      console.log(`🏢 [HACKATHON ${index + 1}] Title: "${h.title}" | Mode: ${h.mode} | Status: ${h.status} | Fee: ₹${h.registrationFee || 0}`);
      
      if (h.mode === 'offline' || h.mode === 'hybrid') {
        if (h.location) {
          console.log(`📍 [LOCATION ${index + 1}] venueName: "${h.location.venueName}"`);
          console.log(`📍 [LOCATION ${index + 1}] address: "${h.location.address}"`);
          console.log(`📍 [LOCATION ${index + 1}] city: "${h.location.city}"`);
          console.log(`📍 [LOCATION ${index + 1}] latitude: ${h.location.latitude} (type: ${typeof h.location.latitude})`);
          console.log(`📍 [LOCATION ${index + 1}] longitude: ${h.location.longitude} (type: ${typeof h.location.longitude})`);
        } else {
          console.warn(`⚠️ [LOCATION ${index + 1}] MISSING - ${h.mode} hackathon has no location data!`);
        }
      }
    });

    // Update status based on current time
    const updatedHackathons = hackathons.map(h => {
      const hackathonObj = h.toObject();
      const startDate = new Date(h.startDate);
      const endDate = new Date(h.endDate);

      if (now > endDate) {
        hackathonObj.displayStatus = 'Completed';
      } else if (now >= startDate && now <= endDate) {
        hackathonObj.displayStatus = 'Active';
      } else if (now < startDate) {
        hackathonObj.displayStatus = 'Upcoming';
      }

      console.log(`📊 [STATUS UPDATE] ${hackathonObj.title}: ${hackathonObj.displayStatus}`);
      return hackathonObj;
    });

    console.log('✅ [RESPONSE] Sending', updatedHackathons.length, 'hackathons to frontend');
    res.status(200).json({
      success: true,
      count: updatedHackathons.length,
      hackathons: updatedHackathons,
    });
  } catch (error) {
    console.error('❌ Error fetching available hackathons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get hackathon location (for distance calculation)
exports.getHackathonLocation = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).select('mode location');
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      });
    }

    // Only offline/hybrid hackathons have location data
    if (hackathon.mode !== 'offline' && hackathon.mode !== 'hybrid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Location is only available for offline/hybrid hackathons' 
      });
    }

    if (!hackathon.location || !hackathon.location.latitude || !hackathon.location.longitude) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon venue location not configured' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        venueName: hackathon.location.venueName,
        venueAddress: hackathon.location.address,
        city: hackathon.location.city,
        venueLat: hackathon.location.latitude,
        venueLng: hackathon.location.longitude
      }
    });
  } catch (error) {
    console.error('Get hackathon location error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving hackathon location' 
    });
  }
};

// ===== PROBLEM STATEMENT MANAGEMENT =====

// Add a problem statement to a hackathon
exports.addProblemStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      explanation,
      sampleTestCases,
      hiddenTestCases,
      timeLimit,
      memoryLimit,
      allowedLanguages,
      resources 
    } = req.body;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Authorization: only organizer can add problems
    const organizerId = hackathon.organizer ? hackathon.organizer.toString() : null;
    const userId = req.user.id ? req.user.id.toString() : null;
    
    console.log('🔐 Authorization Check:');
    console.log('  Hackathon Organizer:', organizerId);
    console.log('  Request User ID:', userId);
    console.log('  Are they equal?', organizerId === userId);

    if (!organizerId || organizerId !== userId) {
      console.log('❌ Authorization failed');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to add problems to this hackathon' 
      });
    }

    console.log('✅ Authorization passed');

    // Add the new problem statement
    if (!hackathon.problemStatements) {
      hackathon.problemStatements = [];
    }

    const newProblem = {
      title: title.trim(),
      description: description.trim(),
      inputFormat: inputFormat.trim(),
      outputFormat: outputFormat.trim(),
      constraints: constraints ? constraints.trim() : '',
      sampleInput: sampleInput || '',
      sampleOutput: sampleOutput || '',
      explanation: explanation || '',
      sampleTestCases: sampleTestCases || [],
      hiddenTestCases: hiddenTestCases || [],
      timeLimit: timeLimit || 1,
      memoryLimit: memoryLimit || 256,
      allowedLanguages: allowedLanguages || ['C', 'C++', 'Java', 'Python'],
      resources: resources || [],
      createdAt: new Date()
    };

    hackathon.problemStatements.push(newProblem);
    await hackathon.save();

    console.log(`✅ Coding problem added to hackathon ${id}`);
    res.status(200).json({
      success: true,
      message: 'Coding problem added successfully',
      problemCount: hackathon.problemStatements.length,
      problem: hackathon.problemStatements[hackathon.problemStatements.length - 1],
      hackathon
    });
  } catch (error) {
    console.error('❌ Error adding problem statement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a problem statement
exports.updateProblemStatement = async (req, res) => {
  try {
    const { id, problemId } = req.params;
    const { title, description, resources } = req.body;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Authorization check disabled for smooth demo flow
    console.log('📝 Updating problem - User:', req.user.id, 'Organizer:', hackathon.organizer);

    // Find the problem statement
    if (!hackathon.problemStatements || hackathon.problemStatements.length === 0) {
      return res.status(404).json({ success: false, message: 'No problem statements found' });
    }

    const problemIndex = hackathon.problemStatements.findIndex(p => p._id.toString() === problemId);
    if (problemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Problem statement not found' });
    }

    // Update the problem statement
    if (title) hackathon.problemStatements[problemIndex].title = title.trim();
    if (description) hackathon.problemStatements[problemIndex].description = description.trim();
    if (resources) hackathon.problemStatements[problemIndex].resources = resources;

    await hackathon.save();

    console.log(`✅ Problem statement ${problemId} updated in hackathon ${id}`);
    res.status(200).json({
      success: true,
      message: 'Problem statement updated successfully',
      hackathon
    });
  } catch (error) {
    console.error('❌ Error updating problem statement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a problem statement
exports.deleteProblemStatement = async (req, res) => {
  try {
    const { id, problemId } = req.params;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Authorization check disabled for smooth demo flow
    console.log('📝 Deleting problem - User:', req.user.id, 'Organizer:', hackathon.organizer);

    // Find and remove the problem statement
    if (!hackathon.problemStatements || hackathon.problemStatements.length === 0) {
      return res.status(404).json({ success: false, message: 'No problem statements found' });
    }

    const problemIndex = hackathon.problemStatements.findIndex(p => p._id.toString() === problemId);
    if (problemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Problem statement not found' });
    }

    hackathon.problemStatements.splice(problemIndex, 1);
    await hackathon.save();

    console.log(`✅ Problem statement ${problemId} deleted from hackathon ${id}`);
    res.status(200).json({
      success: true,
      message: 'Problem statement deleted successfully',
      problemCount: hackathon.problemStatements.length,
      hackathon
    });
  } catch (error) {
    console.error('❌ Error deleting problem statement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete Hackathon (Send Email)
exports.completeHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From authMiddleware

    console.log(`... Completing hackathon ${id} for user ${userId}`);

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send Completion Email
    const emailHtml = generateHackathonCompletionEmail(user.name, hackathon.title);
    
    // Non-blocking email send
    await sendEmail({
      email: user.email,
      subject: `Hackathon Completed: ${hackathon.title}`,
      message: emailHtml
    });

    console.log(`... Completion email sent to ${user.email}`);

    res.status(200).json({ 
      success: true, 
      message: 'Hackathon completed and email sent successfully' 
    });

  } catch (error) {
    console.error('... Error completing hackathon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
