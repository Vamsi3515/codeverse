require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db'); // Use new db.js file
const { errorHandler } = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Global error handlers - MUST be at top before any async operations
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Log but don't exit - let the app continue
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Exit on uncaught exceptions as they're dangerous
  process.exit(1);
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const teamRoutes = require('./routes/teamRoutes');
const resultRoutes = require('./routes/resultRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const offlineRoutes = require('./routes/offlineRoutes');
const studentRoutes = require('./routes/studentRoutes');
const qrRoutes = require('./routes/qrRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const googleCalendarRoutes = require('./routes/googleCalendarRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Initialize app: connect to DB, then start server
const startServer = async () => {
  try {
    // Connect to MongoDB - server will exit if connection fails
    await connectDB();
    
    // Start server only after successful DB connection
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Error handling for server
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });
  } catch (err) {
    // If DB connection fails, the process will exit (handled in db.js)
    console.error('Failed to start server:', err.message);
  }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/offline', offlineRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/payments', paymentRoutes);
// Alias mount so /api/auth/google/callback hits the same router
app.use('/api/auth/google', googleCalendarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Compiler Routes (New)
const compilerRoutes = require('./routes/compiler/compilerRoutes');
app.use('/api/compiler', compilerRoutes);

// Socket.io events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins notification room
  socket.on('join-notifications', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined notifications`);
  });

  // Send live updates for contests
  socket.on('join-contest', (hackathonId) => {
    socket.join(`contest-${hackathonId}`);
    console.log(`User joined contest ${hackathonId}`);
  });

  // Real-time activity tracking
  socket.on('activity-log', (data) => {
    io.to(`contest-${data.hackathonId}`).emit('activity-update', data);
  });

  // Leaderboard updates
  socket.on('update-leaderboard', (data) => {
    io.to(`contest-${data.hackathonId}`).emit('leaderboard-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Kick off
startServer();

module.exports = { app, io };
