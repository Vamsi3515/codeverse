// User roles
const USER_ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

// Hackathon status
const HACKATHON_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Hackathon modes
const HACKATHON_MODE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid',
};

// Registration status
const REGISTRATION_STATUS = {
  REGISTERED: 'registered',
  ATTENDED: 'attended',
  WITHDRAWN: 'withdrawn',
  DISQUALIFIED: 'disqualified',
};

// Payment status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  FREE: 'free',
};

// Team status
const TEAM_STATUS = {
  FORMING: 'forming',
  ACTIVE: 'active',
  SUBMITTED: 'submitted',
  DISQUALIFIED: 'disqualified',
};

// Notification types
const NOTIFICATION_TYPE = {
  REGISTRATION_REMINDER: 'registration_reminder',
  EVENT_START: 'event_start',
  EVENT_END: 'event_end',
  RESULT_DECLARED: 'result_declared',
  COIN_AWARDED: 'coin_awarded',
  CERTIFICATE_ISSUED: 'certificate_issued',
  TEAM_INVITATION: 'team_invitation',
  GENERAL: 'general',
};

// Activity severity
const ACTIVITY_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Coin rewards for rankings
const COIN_REWARDS = {
  FIRST: 100,
  SECOND: 75,
  THIRD: 50,
  PARTICIPATION: 10,
};

module.exports = {
  USER_ROLES,
  HACKATHON_STATUS,
  HACKATHON_MODE,
  REGISTRATION_STATUS,
  PAYMENT_STATUS,
  TEAM_STATUS,
  NOTIFICATION_TYPE,
  ACTIVITY_SEVERITY,
  COIN_REWARDS,
};
